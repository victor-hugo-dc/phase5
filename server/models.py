from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from marshmallow import Schema, fields, validates, ValidationError, validate
from config import db
from flask_marshmallow import Marshmallow
from werkzeug.security import generate_password_hash, check_password_hash
import re

ma = Marshmallow()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    owned_properties = db.relationship('Property', back_populates='owner', lazy=True)
    bookings = db.relationship('Booking', back_populates='user', lazy=True)
    reviews = db.relationship('Review', back_populates='user', lazy=True)
    
    @validates('name')
    def validate_name(self, key, name):
        if len(name.strip()) < 1:
            raise ValueError("Name cannot be empty")
        if len(name) > 100:
            raise ValueError("Name must be under 100 characters")
        return name

    @validates('email')
    def validate_email(self, key, email):
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            raise ValueError("Invalid email format")
        return email
    
    def set_password(self, password):
        """Hashes password and stores it."""
        self.password = generate_password_hash(password)

    def check_password(self, password):
        """Checks if provided password matches the stored hash."""
        return check_password_hash(self.password, password)


class Property(db.Model):
    __tablename__ = 'properties'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price_per_night = db.Column(db.Float, nullable=False)
    location_name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    owner = db.relationship('User', back_populates='owned_properties')
    bookings = db.relationship('Booking', back_populates='property', lazy=True)
    reviews = db.relationship('Review', back_populates='property', lazy=True)
    images = db.relationship('PropertyImage', back_populates='property', lazy=True)

    @validates('title')
    def validate_title(self, key, title):
        if len(title.strip()) < 1:
            raise ValueError("Title cannot be empty")
        return title

    @validates('price_per_night')
    def validate_price(self, key, price):
        if price <= 0:
            raise ValueError("Price must be positive")
        return price

    @validates('latitude')
    def validate_latitude(self, key, lat):
        if not (-90 <= lat <= 90):
            raise ValueError("Invalid latitude (range: -90 to 90)")
        return lat

    @validates('longitude')
    def validate_longitude(self, key, lng):
        if not (-180 <= lng <= 180):
            raise ValueError("Invalid longitude (range: -180 to 180)")
        return lng
    
    def update(self, **kwargs):
        allowed_fields = {'title', 'description', 'price_per_night', 'location_name'}
        for key, value in kwargs.items():
            if key in allowed_fields:
                setattr(self, key, value)
            else:
                raise ValueError(f"Cannot update field: {key}")

class PropertyImage(db.Model):
    __tablename__ = 'property_images'
    id = db.Column(db.Integer, primary_key=True)
    image_path = db.Column(db.String(255), nullable=False)  # Stores image path
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    property = db.relationship('Property', back_populates='images')

    def __init__(self, image_path, property_id):
        self.image_path = image_path
        self.property_id = property_id


class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    user = db.relationship('User', back_populates='bookings')
    property = db.relationship('Property', back_populates='bookings')

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    user = db.relationship('User', back_populates='reviews')
    property = db.relationship('Property', back_populates='reviews')
    
    @validates('rating')
    def validate_rating(self, key, rating):
        if not (1 <= rating <= 5):
            raise ValueError("Rating must be between 1-5")
        return rating

    @validates('comment')
    def validate_comment(self, key, comment):
        if len(comment.strip()) < 10:
            raise ValueError("Comment must be at least 10 characters")
        return comment

class ReviewSchema(ma.SQLAlchemyAutoSchema):
    user_id = fields.Integer()
    property_id = fields.Integer()
    
    class Meta:
        model = Review

class BookingSchema(ma.SQLAlchemyAutoSchema):
    user_id = fields.Integer()
    property_id = fields.Integer()
    
    class Meta:
        model = Booking

class PropertyImageSchema(ma.SQLAlchemyAutoSchema):
    image_path = fields.String(validate=validate.Regexp(r'^.+\.(jpg|jpeg|png|gif)$', error="Invalid image format"))
    property_id = fields.Integer()

    class Meta:
        model = PropertyImage

class PropertySchema(ma.SQLAlchemyAutoSchema):
    owner = ma.Nested(lambda: UserSchema(only=("id", "name")))
    bookings = ma.Method("get_filtered_bookings")
    reviews = ma.Nested(ReviewSchema, many=True)
    images = ma.Nested(PropertyImageSchema, many=True)

    class Meta:
        model = Property
    
    def get_filtered_bookings(self, obj):
        user_id = self.context.get("user_id")
        filtered_bookings = [
            booking
            for booking in obj.bookings
            if user_id is None or booking.user_id == user_id
        ]
        return BookingSchema(many=True).dump(filtered_bookings)

class UserSchema(ma.SQLAlchemyAutoSchema):
    owned_properties = ma.Method("get_owned_properties")
    booked_properties = ma.Method("get_booked_properties")

    class Meta:
        model = User

    def get_owned_properties(self, user):
        return [
            {
                **PropertySchema().dump(property),
                "bookings": BookingSchema(many=True).dump(property.bookings),
                "reviews": ReviewSchema(many=True).dump(property.reviews),
                "images": PropertyImageSchema(many=True).dump(property.images),
            }
            for property in user.owned_properties
        ]

    def get_booked_properties(self, user):
        booked_properties = {}

        for booking in user.bookings:
            property_id = booking.property.id

            if property_id not in booked_properties:
                booked_properties[property_id] = {
                    **PropertySchema().dump(booking.property),
                    "bookings": [],
                }

            booked_properties[property_id]["bookings"].append(BookingSchema().dump(booking))

        return list(booked_properties.values())
