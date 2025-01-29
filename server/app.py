from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from marshmallow import ValidationError, fields
from models import User, Property, Booking, Review, UserSchema, PropertySchema, BookingSchema, ReviewSchema
from config import app, db, api


# Schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)
property_schema = PropertySchema()
properties_schema = PropertySchema(many=True)
booking_schema = BookingSchema()
bookings_schema = BookingSchema(many=True)
review_schema = ReviewSchema()
reviews_schema = ReviewSchema(many=True)


class UserResource(Resource):
    def get(self, user_id=None):
        if user_id:
            user = User.query.get(user_id)
            if not user:
                return {"error": "User not found"}, 404
            return user_schema.dump(user)
        users = User.query.all()
        if not users:
            return {"message": "No users found"}, 404
        return users_schema.dump(users)
    
    def post(self):
        data = request.get_json()
        new_user = User(**data)
        db.session.add(new_user)
        db.session.commit()
        return user_schema.dump(new_user), 201

class PropertyResource(Resource):
    def get(self, property_id=None):
        if property_id:
            property_ = Property.query.get(property_id)
            if not property_:
                return {"error": "Property not found"}, 404
            return property_schema.dump(property_)
        properties = Property.query.all()
        if not properties:
            return {"message": "No properties found"}, 404
        return properties_schema.dump(properties)
    
    def post(self):
        data = request.get_json()
        new_property = Property(**data)
        db.session.add(new_property)
        db.session.commit()
        return property_schema.dump(new_property), 201

class BookingResource(Resource):
    def post(self):
        data = request.get_json()
        new_booking = Booking(**data)
        db.session.add(new_booking)
        db.session.commit()
        return {"message": "Booking created successfully"}, 201

class ReviewResource(Resource):
    def post(self):
        data = request.get_json()
        user_id = data.get('user_id')
        property_id = data.get('property_id')
        
        booking = Booking.query.filter_by(user_id=user_id, property_id=property_id).first()
        if not booking:
            return {"error": "User must have a booking before leaving a review."}, 400
        
        new_review = Review(**data)
        db.session.add(new_review)
        db.session.commit()
        return {"message": "Review added successfully"}, 201



# API Routes
api.add_resource(UserResource, '/users', '/users/<int:user_id>')
api.add_resource(PropertyResource, '/properties', '/properties/<int:property_id>')
api.add_resource(BookingResource, '/bookings', '/bookings/<int:booking_id>')
api.add_resource(ReviewResource, '/reviews', '/reviews/<int:review_id>')


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
