from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from marshmallow import Schema, fields, validates, ValidationError
from config import db
from flask_marshmallow import Marshmallow
from werkzeug.security import generate_password_hash, check_password_hash

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

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if len(self.images) > 10:
            raise ValidationError("A property can have at most 10 images.")
    
    def to_dict(self, user_id=None):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "price_per_night": self.price_per_night,
            "location_name": self.location_name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "owner": {
                "id": self.owner_id,
                "name": self.owner.name,   
            },
            "images": [{"image_path": img.image_path} for img in self.images],
            "bookings": [
                {
                    "id": booking.id,
                    "start_date": booking.start_date.strftime("%Y-%m-%d"),
                    "end_date": booking.end_date.strftime("%Y-%m-%d"),
                    "user_id": booking.user_id
                }
                for booking in self.bookings if user_id is None or booking.user_id == user_id
            ],
            "reviews": [
                {
                    "id": review.id,
                    "rating": review.rating,
                    "comment": review.comment,
                    "user_id": review.user_id
                }
                for review in self.reviews
            ]
        }

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
    
    def to_dict(self):
        booking_data = {
            "id": self.id,
            "user_id": self.user_id,
            "property_id": self.property_id,
            "start_date": self.start_date.strftime("%Y-%m-%d"),
            "end_date": self.end_date.strftime("%Y-%m-%d")
        }

        return booking_data


class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    user = db.relationship('User', back_populates='reviews')
    property = db.relationship('Property', back_populates='reviews')
    
    def to_dict(self):
        review_data = {
            "id": self.id,
            "user_id": self.user_id,
            "property_id": self.property_id,
            "rating": self.rating,
            "comment": self.comment,
        }
        return review_data


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
    image_path = fields.String()
    property_id = fields.Integer()

    class Meta:
        model = PropertyImage

class PropertySchema(ma.SQLAlchemyAutoSchema):
    owner = ma.Nested(lambda: UserSchema(only=("id", "name")))
    bookings = ma.Nested(BookingSchema, many=True)
    reviews = ma.Nested(ReviewSchema, many=True)
    images = ma.Nested(PropertyImageSchema, many=True)

    class Meta:
        model = Property

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
