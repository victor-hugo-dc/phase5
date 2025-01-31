from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from marshmallow import ValidationError
from models import User, Property, Booking, Review, UserSchema, PropertySchema, BookingSchema, ReviewSchema
from config import app, db, api, jwt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import os
import requests
from dotenv import load_dotenv
import datetime
from utils import get_coordinates, haversine

load_dotenv()

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

        access_token = create_access_token(identity=user.id)
        return {"access_token": access_token, "user_id": user.id}, 200


class UserResource(Resource):
    def get(self, user_id=None):
        if user_id:
            user = User.query.get(user_id)
            return user_schema.dump(user)
        return users_schema.dump(User.query.all())


class PropertyResource(Resource):
    def get(self, property_id=None):
        if property_id:
            property_ = Property.query.get(property_id)
            return property_schema.dump(property_) if property_ else {"error": "Property not found"}, 404
        return properties_schema.dump(Property.query.all())

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()

        new_property = Property(**data, owner_id=user_id)  # Assume property has an owner_id field
        db.session.add(new_property)
        db.session.commit()

        return property_schema.dump(new_property), 201


class BookingResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()

        new_booking = Booking(**data, user_id=user_id)
        db.session.add(new_booking)
        db.session.commit()

        return {"message": "Booking created successfully"}, 201


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

        if 'place_id' in data:
            lat, lng = get_coordinates(data.get('place_id'))
            if lat is None or lng is None:
                return {'message': 'Invalid place_id or coordinates not found.'}, 400
        else:
            lat = lng = None  # No filtering by location if place_id is not provided
        
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

api.add_resource(UserResource, '/users', '/users/<int:user_id>')
api.add_resource(PropertyResource, '/properties', '/properties/<int:property_id>')
api.add_resource(BookingResource, '/bookings')
api.add_resource(ReviewResource, '/reviews')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
