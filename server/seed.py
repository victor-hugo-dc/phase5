from app import app
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from faker import Faker
import random
from datetime import datetime, timedelta
from models import db, User, Property, Booking, Review, UserSchema, PropertySchema, BookingSchema, ReviewSchema

# Initialize Faker
fake = Faker()

# Create Seed Data
def seed_data():
    with app.app_context():
        db.drop_all()
        db.create_all()

        # Create Users
        users = []
        for _ in range(20):  # Increased the number of users to 20
            user = User(
                name=fake.name(),
                email=fake.email(),
                password=fake.password()
            )
            users.append(user)
            db.session.add(user)

        db.session.commit()

        # Create Properties
        properties = []
        for owner in random.sample(users, k=15):  # Randomly assign 10 users as property owners
            for _ in range(random.randint(1, 3)):  # Each owner can own 1-3 properties
                property = Property(
                    title=fake.text(max_nb_chars=20),
                    description=fake.text(max_nb_chars=100),
                    price_per_night=random.uniform(50, 500),
                    location_name=fake.city(),
                    latitude=fake.latitude(),
                    longitude=fake.longitude(),
                    owner_id=owner.id
                )
                properties.append(property)
                db.session.add(property)

        db.session.commit()

        bookings = []
        for user in users:
            booked_properties = random.sample(properties, k=random.randint(1, 3))  # 1-3 properties per user
            for property in booked_properties:
                # Make sure the user doesn't book their own property
                if property.owner_id != user.id:
                    # Use datetime to create date objects
                    start_date = datetime(2025, 1, 30) + timedelta(days=random.randint(0, 30))  # Near future
                    end_date = start_date + timedelta(days=random.randint(1, 7))  # Booking length 1-7 days

                    # Ensure no conflicting bookings
                    if not any(
                        b.property_id == property.id and 
                        (b.start_date <= end_date and b.end_date >= start_date)
                        for b in Booking.query.all()
                    ):
                        booking = Booking(
                            user_id=user.id,
                            property_id=property.id,
                            start_date=start_date,
                            end_date=end_date
                        )
                        bookings.append(booking)
                        db.session.add(booking)

        db.session.commit()

        # Create Reviews
        for booking in Booking.query.all():
            if random.random() < 0.7:  # 70% chance of leaving a review
                review = Review(
                    user_id=booking.user_id,
                    property_id=booking.property_id,
                    rating=random.randint(1, 5),
                    comment=fake.text(max_nb_chars=200)
                )
                db.session.add(review)

        db.session.commit()

if __name__ == "__main__":
    seed_data()
    print("Database seeded successfully!")
