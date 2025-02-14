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

UPLOAD_FOLDER = os.path.abspath(os.path.join(os.getcwd(), "images"))
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

user_schema = UserSchema()
users_schema = UserSchema(many=True)
property_schema = PropertySchema()
properties_schema = PropertySchema(many=True)
booking_schema = BookingSchema()
bookings_schema = BookingSchema(many=True)
review_schema = ReviewSchema()
reviews_schema = ReviewSchema(many=True)

class SignupResource(Resource):
    def post(self):
        data = request.get_json()
        name, email, password = data.get('name'), data.get('email'), data.get('password')

        if not all([name, email, password]):
            return {"error": "All fields are required"}, 400
        
        if User.query.filter_by(email=email).first():
            return {"error": "Email already exists"}, 400

        new_user = User(name=name, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        return {"message": "User registered successfully"}, 201


class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        email, password = data.get('email'), data.get('password')

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return {"error": "Invalid email or password"}, 401

        access_token = create_access_token(identity=user.id, expires_delta=False)
        return {"access_token": access_token, "user_id": user.id}, 200


class UserResource(Resource):
    def get(self, user_id=None):
        if user_id:
            user = User.query.get(user_id)
            return user_schema.dump(user)
        return users_schema.dump(User.query.all())

    @jwt_required()
    def put(self, user_id):
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return {"error": "You can only update your own information."}, 403
        
        data = request.get_json()
        new_name = data.get('name')

        if not new_name:
            return {"error": "Name is required."}, 400
        
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found."}, 404
        
        # Update the user's name
        user.name = new_name
        db.session.commit()

        return {"message": "User name updated successfully."}, 200

class ImageResource(Resource):
    def get(self, filename):
        images_dir = os.path.join(os.getcwd(), 'images')
        return send_from_directory(images_dir, filename)

class PropertyResource(Resource):
    # TODO: add 404 error if property not found
    def get(self, property_id=None):
        if property_id:
            property_ = Property.query.get(property_id)
            return property_schema.dump(property_)

        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 12, type=int)
        properties = Property.query.paginate(page=page, per_page=limit, error_out=False)

        return properties_schema.dump(properties.items)

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        
        title = request.form.get("title")
        description = request.form.get("description")
        price_per_night = request.form.get("price_per_night")
        location_name = request.form.get("location")
        latitude, longitude = get_coordinates(request.form.get("place_id"))
        images = request.files.getlist("images")

        if not title or not description or not price_per_night:
            return {"error": "Missing required fields"}, 400

        new_property = Property(
            title=title,
            description=description,
            price_per_night=float(price_per_night),
            location_name=location_name,
            latitude=float(latitude),
            longitude=float(longitude),
            owner_id=user_id,
        )

        db.session.add(new_property)
        db.session.commit()

        # Save images and associate with property
        for image in images:
            if image.filename == "" or "." not in image.filename:
                continue

            ext = image.filename.rsplit(".", 1)[1].lower()
            if ext in ALLOWED_EXTENSIONS:
                filename = secure_filename(image.filename)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                image.save(filepath)

                property_image = PropertyImage(image_path=filename, property_id=new_property.id)
                db.session.add(property_image)

        db.session.commit()

        return {"message": "Property created successfully!", "property": new_property.to_dict()}, 201

    @jwt_required()
    def put(self, property_id):
        user_id = get_jwt_identity()
        property_ = Property.query.get(property_id)
        
        if not property_:
            return {"error": "Property not found"}, 404
        
        if property_.owner_id != user_id:
            return {"error": "Unauthorized to edit this property"}, 403
        
        data = request.get_json()
        
        property_.title = data.get("title", property_.title)
        property_.description = data.get("description", property_.description)
        property_.price_per_night = data.get("price_per_night", property_.price_per_night)
        property_.location_name = data.get("location_name", property_.location_name)
        
        db.session.commit()
        
        return property_schema.dump(property_), 200

class BookingResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()

        try:
            data["start_date"] = datetime.datetime.strptime(data["start_date"], "%Y-%m-%d").date()
            data["end_date"] = datetime.datetime.strptime(data["end_date"], "%Y-%m-%d").date()
        except (ValueError, KeyError):
            return {"error": "Invalid date format. Use YYYY-MM-DD."}, 400

        # Create a new booking
        new_booking = Booking(**data)
        db.session.add(new_booking)
        db.session.commit()
        property = Property.query.get(data["property_id"])
        booking = Booking.query.get(new_booking.id)
        return {"message": "Booking created successfully", "property": property.to_dict(user_id = user_id), "booking": booking.to_dict()}, 201

    @jwt_required()
    def put(self, booking_id):
        user_id = get_jwt_identity()
        booking = Booking.query.get(booking_id)
        
        if not booking:
            return {"error": "Booking not found."}, 404
        
        if booking.user_id != user_id:
            return {"error": "You can only edit your own bookings."}, 403

        data = request.get_json()
        if "start_date" in data:
            try:
                data["start_date"] = datetime.datetime.strptime(data["start_date"], "%Y-%m-%d").date()
            except ValueError:
                return {"error": "Invalid start date format. Use YYYY-MM-DD."}, 400

        if "end_date" in data:
            try:
                data["end_date"] = datetime.datetime.strptime(data["end_date"], "%Y-%m-%d").date()
            except ValueError:
                return {"error": "Invalid end date format. Use YYYY-MM-DD."}, 400

        for key, value in data.items():
            setattr(booking, key, value)

        db.session.commit()

        return {"message": "Booking updated successfully."}, 200

    @jwt_required()
    def delete(self, booking_id):
        user_id = get_jwt_identity()
        booking = Booking.query.get(booking_id)

        if not booking:
            return {"error": "Booking not found."}, 404

        if booking.user_id != user_id:
            return {"error": "You can only delete your own bookings."}, 403

        db.session.delete(booking)
        db.session.commit()

        return {"message": "Booking deleted successfully."}, 200

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

        return {"message": "Review added successfully"}, 201


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
api.add_resource(SignupResource, '/signup')
api.add_resource(LoginResource, '/login')

api.add_resource(Autocomplete, '/autocomplete')

api.add_resource(AvailableProperties, '/search')
api.add_resource(ImageResource, '/images/<string:filename>')

api.add_resource(UserResource, '/users', '/users/<int:user_id>')
api.add_resource(PropertyResource, '/properties', '/properties/<int:property_id>')
api.add_resource(BookingResource, '/bookings', '/bookings/<int:booking_id>')
api.add_resource(ReviewResource, '/reviews')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
