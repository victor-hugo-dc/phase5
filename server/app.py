from flask import Flask, request, jsonify
from flask_restful import Resource
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from models import User, Property, Booking, Review, UserSchema, PropertySchema, BookingSchema, ReviewSchema
from config import app, db, api


ma = Marshmallow(app)

# Schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)
property_schema = PropertySchema()
properties_schema = PropertySchema(many=True)
booking_schema = BookingSchema()
bookings_schema = BookingSchema(many=True)
review_schema = ReviewSchema()
reviews_schema = ReviewSchema(many=True)

# Resources
class UserResource(Resource):
    def get(self, user_id=None):
        if user_id:
            user = User.query.get_or_404(user_id)
            return user_schema.dump(user), 200
        users = User.query.all()
        return users_schema.dump(users), 200

    def post(self):
        data = request.json
        new_user = User(
            name=data['name'],
            email=data['email'],
            password=data['password']
        )
        db.session.add(new_user)
        db.session.commit()
        return user_schema.dump(new_user), 201

class PropertyResource(Resource):
    def get(self, property_id=None):
        if property_id:
            property_ = Property.query.get_or_404(property_id)
            return property_schema.dump(property_), 200
        properties = Property.query.all()
        return properties_schema.dump(properties), 200

    def post(self):
        data = request.json
        new_property = Property(
            title=data['title'],
            description=data['description'],
            price_per_night=data['price_per_night'],
            location=data['location'],
            owner_id=data['owner_id']
        )
        db.session.add(new_property)
        db.session.commit()
        return property_schema.dump(new_property), 201

class BookingResource(Resource):
    def get(self, booking_id=None):
        if booking_id:
            booking = Booking.query.get_or_404(booking_id)
            return booking_schema.dump(booking), 200
        bookings = Booking.query.all()
        return bookings_schema.dump(bookings), 200

    def post(self):
        data = request.json
        new_booking = Booking(
            user_id=data['user_id'],
            property_id=data['property_id'],
            start_date=data['start_date'],
            end_date=data['end_date']
        )
        db.session.add(new_booking)
        db.session.commit()
        return booking_schema.dump(new_booking), 201

class ReviewResource(Resource):
    def get(self, review_id=None):
        if review_id:
            review = Review.query.get_or_404(review_id)
            return review_schema.dump(review), 200
        reviews = Review.query.all()
        return reviews_schema.dump(reviews), 200

    def post(self):
        data = request.json
        new_review = Review(
            user_id=data['user_id'],
            property_id=data['property_id'],
            rating=data['rating'],
            comment=data.get('comment')
        )
        db.session.add(new_review)
        db.session.commit()
        return review_schema.dump(new_review), 201

# Register API resources
api.add_resource(UserResource, '/users', '/users/<int:user_id>')
api.add_resource(PropertyResource, '/properties', '/properties/<int:property_id>')
api.add_resource(BookingResource, '/bookings', '/bookings/<int:booking_id>')
api.add_resource(ReviewResource, '/reviews', '/reviews/<int:review_id>')

# Run the app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)