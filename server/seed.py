from app import app
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from faker import Faker
import random
from datetime import datetime, timedelta
from models import db, User, Property, Booking, Review, UserSchema, PropertySchema, BookingSchema, ReviewSchema, PropertyImage

# Initialize Faker
fake = Faker()

# Define some major cities and their latitudes/longitudes
city_locations = [
    ("New York", 40.7128, -74.0060),
    ("Los Angeles", 34.0522, -118.2437),
    ("Chicago", 41.8781, -87.6298),
    ("Houston", 29.7604, -95.3698),
    ("Phoenix", 33.4484, -112.0740),
    ("San Antonio", 29.4241, -98.4936),
    ("San Diego", 32.7157, -117.1611),
    ("Dallas", 32.7767, -96.7970),
    ("San Jose", 37.3382, -121.8863),
    ("Austin", 30.2672, -97.7431),
    # Add more cities as needed for testing
]

# Create Seed Data
def seed_data():
    with app.app_context():
        db.drop_all()
        db.create_all()

        # Create Users
        users = []
        for _ in range(100):  # Increased the number of users to 20
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
        for owner in random.sample(users, k=80):  # Randomly assign 15 users as property owners
            for _ in range(random.randint(1, 3)):  # Each owner can own 1-3 properties
                city_name, latitude, longitude = random.choice(city_locations)
                property = Property(
                    title=fake.text(max_nb_chars=20),
                    description=fake.text(max_nb_chars=100),
                    price_per_night=random.uniform(50, 500),
                    location_name=city_name,
                    latitude=latitude,
                    longitude=longitude,
                    owner_id=owner.id
                )

                db.session.add(property)
                db.session.flush()  # Flush to generate an ID before adding images

                # Add at least one image before committing
                num_images = random.randint(4, 10)  # Each property gets between 1 and 10 images
                images = [
                    PropertyImage(
                        image_path=fake.image_url(),  # Simulated image file path
                        property_id=property.id,  # Now property_id exists
                    )
                    for _ in range(num_images)
                ]

                for img in images:
                    db.session.add(img)  # Add the images

                properties.append(property)

        db.session.commit()

        # Create Bookings
        bookings = []
        for user in users:
            booked_properties = random.sample(properties, k=random.randint(1, 3))  # 1-3 properties per user
            for property in booked_properties:
                # Make sure the user doesn't book their own property
                if property.owner_id != user.id:
                    # Use datetime to create date objects
                    start_date = datetime(2025, 1, 31) + timedelta(days=random.randint(0, 30))  # Near future
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
            if random.random() < 0.85:  # 70% chance of leaving a review
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