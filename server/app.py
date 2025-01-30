from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from marshmallow import ValidationError, fields
from models import User, Property, Booking, Review, UserSchema, PropertySchema, BookingSchema, ReviewSchema
from config import app, db, api, jwt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

# Schemas
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
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not name or not email or not password:
            return {"error": "All fields are required"}, 400
        
        if User.query.filter_by(email=email).first():
            return {"error": "Email already exists"}, 400

        new_user = User(name=name, email=email)
        new_user.set_password(password)  # Hash password
        db.session.add(new_user)
        db.session.commit()

        return {"message": "User registered successfully"}, 201


class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return {"error": "Invalid email or password"}, 401

        access_token = create_access_token(identity=user.id)  # Generate JWT token
        return {"access_token": access_token, "user_id": user.id}, 200


class ProtectedResource(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return {"error": "User not found"}, 404
        return {"message": f"Hello, {user.name}"}, 200


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
api.add_resource(SignupResource, '/signup')
api.add_resource(LoginResource, '/login')
api.add_resource(ProtectedResource, '/protected')

api.add_resource(UserResource, '/users', '/users/<int:user_id>')
api.add_resource(PropertyResource, '/properties', '/properties/<int:property_id>')
api.add_resource(BookingResource, '/bookings', '/bookings/<int:booking_id>')
api.add_resource(ReviewResource, '/reviews', '/reviews/<int:review_id>')


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
