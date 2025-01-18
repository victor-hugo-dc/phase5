from faker import Faker
from models import db, User, Property, Booking, Review
from app import app
import random

# Initialize Faker
fake = Faker()

# Create Seed Data
def seed_data():
    with app.app_context():
        # Drop and recreate the database
        db.drop_all()
        db.create_all()

        # Create Users
        users = []
        for _ in range(5):
            user = User(
                name=fake.name(),
                email=fake.email(),
                password=fake.password(length=10)
            )
            users.append(user)
            db.session.add(user)

        db.session.commit()

        # Create Properties
        properties = []
        for _ in range(20):
            property_ = Property(
                title=fake.sentence(nb_words=4),
                description=fake.paragraph(nb_sentences=3),
                price_per_night=round(random.uniform(50, 500), 2),
                location=fake.city(),
                owner_id=random.choice(users).id
            )
            properties.append(property_)
            db.session.add(property_)

        db.session.commit()

        # Create Reviews
        for property_ in properties:
            for _ in range(random.randint(2, 5)):
                review = Review(
                    user_id=random.choice(users).id,
                    property_id=property_.id,
                    rating=random.randint(1, 5),
                    comment=fake.sentence(nb_words=10)
                )
                db.session.add(review)

        db.session.commit()
        
        # Create Bookings
        for _ in range(30):  # Create 30 bookings
            booking = Booking(
                user_id=random.choice(users).id,
                property_id=random.choice(properties).id,
                start_date=fake.date_between(start_date='-30d', end_date='today'),
                end_date=fake.date_between(start_date='today', end_date='+30d')
            )
            db.session.add(booking)

        db.session.commit()

if __name__ == "__main__":
    seed_data()
    print("Database seeded successfully!")
