from flask_sqlalchemy import SQLAlchemy
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields
from config import db


# User Model
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    # Relationships
    properties = db.relationship('Property', back_populates='owner', cascade='all, delete')
    bookings = db.relationship('Booking', back_populates='user', cascade='all, delete')
    reviews = db.relationship('Review', back_populates='user', cascade='all, delete')

# Property Model
class Property(db.Model):
    __tablename__ = 'properties'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price_per_night = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    owner = db.relationship('User', back_populates='properties')
    bookings = db.relationship('Booking', back_populates='property', cascade='all, delete')
    reviews = db.relationship('Review', back_populates='property', cascade='all, delete')

# Booking Model
class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='bookings')
    property = db.relationship('Property', back_populates='bookings')

# Review Model
class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)

    # Relationships
    user = db.relationship('User', back_populates='reviews')
    property = db.relationship('Property', back_populates='reviews')

# Marshmallow Schemas
class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        include_relationships = True
        load_instance = True

    properties = fields.Nested('PropertySchema', many=True, exclude=('owner', 'bookings', 'reviews'))
    bookings = fields.Nested('BookingSchema', many=True, exclude=('user', 'property'))
    reviews = fields.Nested('ReviewSchema', many=True, exclude=('user', 'property'))


class PropertySchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Property
        include_relationships = True
        load_instance = True

    # Include owner_id explicitly
    owner_id = fields.Integer()
    owner = fields.Nested(UserSchema, exclude=('properties', 'bookings', 'reviews'))
    bookings = fields.Nested('BookingSchema', many=True, exclude=('property', 'user'))
    reviews = fields.Nested('ReviewSchema', many=True, exclude=('property', 'user'))


class BookingSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Booking
        include_relationships = True
        load_instance = True

    # Include property_id explicitly
    property_id = fields.Integer()
    user = fields.Nested(UserSchema, exclude=('bookings', 'properties', 'reviews'))
    property = fields.Nested(PropertySchema, exclude=('bookings', 'owner', 'reviews'))


class ReviewSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Review
        include_relationships = True
        load_instance = True

    # Include property_id explicitly
    property_id = fields.Integer()
    user = fields.Nested(UserSchema, exclude=('reviews', 'bookings', 'properties'))
    property = fields.Nested(PropertySchema, exclude=('reviews', 'owner', 'bookings'))
