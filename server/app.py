from flask import Flask, request, jsonify, send_from_directory
from flask_restful import Api, Resource
from marshmallow import ValidationError
from models import User, Property, Booking, Review, UserSchema, PropertySchema, BookingSchema, ReviewSchema, PropertyImage
from config import app, db, api, jwt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import os
import requests
from dotenv import load_dotenv
import datetime
from utils import get_coordinates, haversine
from werkzeug.utils import secure_filename

load_dotenv()

# Constants
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.getcwd(), "images"))
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
DATE_FORMAT = "%Y-%m-%d"
MAX_IMAGES_PER_PROPERTY = 10

# Schema instances
user_schema = UserSchema()
property_schema = PropertySchema()
booking_schema = BookingSchema()
review_schema = ReviewSchema()

users_schema = UserSchema(many=True)
properties_schema = PropertySchema(many=True)
bookings_schema = BookingSchema(many=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def handle_validation_error(error):
    return jsonify({"error": "Validation error", "messages": error.messages}), 400

def get_user_or_404(user_id):
    user = User.query.get(user_id)
    if not user:
        raise NotFoundError("User not found")
    return user

class NotFoundError(Exception):
    pass

class SignupResource(Resource):
    def post(self):
        try:
            data = user_schema.load(request.get_json())
            if User.query.filter_by(email=data['email']).first():
                return {"error": "Email already exists"}, 409
            
            user = User(**data)
            user.set_password(data['password'])
            db.session.add(user)
            db.session.commit()
            return {"message": "User registered successfully"}, 201
        
        except ValidationError as e:
            return handle_validation_error(e)


class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        try:
            user = User.query.filter_by(email=data.get('email')).first()
            if not user or not user.check_password(data.get('password')):
                return {"error": "Invalid credentials"}, 401
            
            access_token = create_access_token(identity=user.id, expires_delta=False)
            return {"access_token": access_token, "user": user_schema.dump(user)}, 200
        
        except KeyError:
            return {"error": "Email and password required"}, 400


class CheckSession(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found."}, 404
        return user_schema.dump(user), 200

class UserResource(Resource):
    def get(self, user_id):
        if user_id:
            user = User.query.get(user_id)
            if not user:
                return {"error": "User not found."}, 404
            return user_schema.dump(user), 200

    @jwt_required()
    def put(self, user_id):
        current_user = get_user_or_404(get_jwt_identity())
        if current_user.id != user_id:
            return {"error": "Unauthorized"}, 403
        
        try:
            data = user_schema.load(request.get_json(), partial=True)
            current_user.update(**data)
            db.session.commit()
            return {"user": user_schema.dump(current_user)}, 200
        
        except ValidationError as e:
            return handle_validation_error(e)

class ImageResource(Resource):
    def get(self, filename):
        images_dir = os.path.join(os.getcwd(), 'images')
        return send_from_directory(images_dir, filename)

class PropertyResource(Resource):
    def get(self, property_id=None):
        if property_id:
            property = Property.query.get_or_404(property_id)
            return {"property": property_schema.dump(property)}, 200
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 12, type=int)
        properties = Property.query.paginate(page=page, per_page=limit, error_out=False)
        return {"properties": properties_schema.dump(properties.items)}, 200

    @jwt_required()
    def post(self):
        try:
            user = get_user_or_404(get_jwt_identity())
            data = property_schema.load(request.form)
            
            images = request.files.getlist("images")
            if len(images) > MAX_IMAGES_PER_PROPERTY:
                return {"error": f"Maximum {MAX_IMAGES_PER_PROPERTY} images allowed"}, 400
            
            property = Property(owner=user, **data)
            db.session.add(property)
            
            for image in images:
                if image and allowed_file(image.filename):
                    filename = secure_filename(image.filename)
                    image.save(os.path.join(UPLOAD_FOLDER, filename))
                    property.images.append(PropertyImage(image_path=filename))
            
            db.session.commit()
            return {"property": property_schema.dump(property)}, 201
        
        except ValidationError as e:
            return handle_validation_error(e)
        
    @jwt_required()
    def put(self, property_id):
        property = Property.query.get_or_404(property_id)
        if property.owner_id != get_jwt_identity():
            return {"error": "Unauthorized"}, 403
        
        try:
            data = property_schema.load(request.get_json(), partial=True)
            property.update(**data)
            db.session.commit()
            return {"property": property_schema.dump(property)}, 200
        
        except ValidationError as e:
            return handle_validation_error(e)

    @jwt_required()
    def delete(self, property_id):
        property = Property.query.get_or_404(property_id)
        if property.owner_id != get_jwt_identity():
            return {"error": "Unauthorized"}, 403
        
        PropertyImage.query.filter_by(property_id=property.id).delete()

        db.session.delete(property)
        db.session.commit()

        return {"message": "Property deleted successfully"}, 200

class BookingResource(Resource):
    @jwt_required()
    def post(self):
        try:
            user_id = get_jwt_identity()
            data = booking_schema.load(request.get_json())
            user = get_user_or_404(user_id)
            
            booking = Booking(user=user, **data)
            db.session.add(booking)
            db.session.commit()
            
            property = Property.query.get(data["property_id"])
            property_schema.context = {"user_id": user_id}
            
            return {"booking": booking_schema.dump(booking), "property": property_schema.dump(property)}, 201
        
        except ValidationError as e:
            return handle_validation_error(e)

    @jwt_required()
    def put(self, booking_id):
        booking = Booking.query.get_or_404(booking_id)
        if booking.user_id != get_jwt_identity():
            return {"error": "Unauthorized"}, 403
        
        try:
            data = booking_schema.load(request.get_json(), partial=True)
            booking.update(**data)
            db.session.commit()
            return {"booking": booking_schema.dump(booking)}, 200
        
        except ValidationError as e:
            return handle_validation_error(e)

    @jwt_required()
    def delete(self, booking_id):
        booking = Booking.query.get_or_404(booking_id)
        if booking.user_id != get_jwt_identity():
            return {"error": "Unauthorized"}, 403
        
        db.session.delete(booking)
        db.session.commit()
        return {"message": "Booking deleted"}, 204

class ReviewResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        property_id = data.get('property_id')

        booking = Booking.query.filter_by(user_id=user_id, property_id=property_id).first()
        if not booking:
            return {"error": "User must have a booking before leaving a review."}, 400

        new_review = Review(**data, user_id=user_id)
        db.session.add(new_review)
        db.session.commit()

        return {"review": review_schema.dump(new_review)}, 201


class Autocomplete(Resource):
    def post(self):
        data = request.get_json()

        location = data.get('location')
        if not location:
            return {'message': 'Location is required'}, 400

        url = f"https://maps.googleapis.com/maps/api/place/autocomplete/json"
        params = {
            'input': location,
            'key': os.getenv('GOOGLE_API_KEY')
        }

        response = requests.get(url, params=params)

        if response.status_code == 200:
            suggestions = response.json().get('predictions', [])
            return {'suggestions': suggestions}, 200
        else:
            return {'message': 'Error fetching data from Google Places API'}, 500
        
class AvailableProperties(Resource):
    def post(self):
        data = request.get_json()
        
        place_id = data.get('place_id')
        if place_id == '':
            lat = lng = None
        else:
            lat, lng = get_coordinates(place_id)
        
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        try:
            start_date = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return {'message': 'Invalid date format. Please use YYYY-MM-DD.'}, 400
        
        query = Property.query
        properties = query.all()

        available_properties = []

        for property in properties:
            is_available = True
            for booking in property.bookings:
                if not (end_date < booking.start_date or start_date > booking.end_date):
                    is_available = False
                    break

            if is_available:
                property_lat = property.latitude
                property_lng = property.longitude

                if lat is not None and lng is not None:
                    if haversine(property_lat, property_lng, lat, lng) <= 25:
                        available_properties.append(PropertySchema().dump(property))
                else:
                    available_properties.append(PropertySchema().dump(property))

        return {'available_properties': available_properties}, 200

# API Routes
api.add_resource(CheckSession, '/checksession')
api.add_resource(SignupResource, '/signup')
api.add_resource(LoginResource, '/login')

api.add_resource(Autocomplete, '/autocomplete')

api.add_resource(AvailableProperties, '/search')
api.add_resource(ImageResource, '/images/<string:filename>')

api.add_resource(UserResource, '/users/<int:user_id>')
api.add_resource(PropertyResource, '/properties', '/properties/<int:property_id>')
api.add_resource(BookingResource, '/bookings', '/bookings/<int:booking_id>')
api.add_resource(ReviewResource, '/reviews')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
