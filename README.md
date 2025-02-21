# CampusNest 🏠🐻

An Airbnb-style web application for finding and listing sublets in college towns, built with React (Vite) and Flask/SQLAlchemy.

![CampusNest Demo](client/src/assets/img/watch_bear_0.png)  
*Our friendly campus bear welcomes you to find your perfect nest*

## Features ✨

- 🔍 Google Places API autocomplete search
- 📏 Distance calculator using Haversine formula
- 🔐 JWT authentication with animated bear feedback
- ⭐ Review system with validation (1-5 ratings)
- 📅 Booking management (CRUD operations)
- 🏗️ Layout-based routing with React Router
- 📱 Material UI components

## Tech Stack 💻

**Frontend**  
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![MaterialUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)

**Backend**  
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-100000?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![Marshmallow](https://img.shields.io/badge/Marshmallow-999999?style=for-the-badge)

**APIs**  
![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)

## Installation & Setup 🛠️

### Prerequisites
- Python 3.9+
- Node.js 16+
- pipenv (`pip install pipenv`)

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install Python dependencies
pipenv install
pipenv shell
pip install -r requirements.txt

# Initialize and seed database
flask db upgrade
python seed.py

# Run Flask server (keep this running in terminal)
flask run --port 5555
```

### Frontend Setup
```bash
# Navigate to client directory
cd ../client

# Install Node modules
npm install

# Start Vite dev server (keep this running in separate terminal)
npm run dev
```
### Configuration
Create `.env` file in `server/` directory:
```bash
GOOGLE_API_KEY=your_google_maps_api_key
```

### Project Structure
```
.
├── client/             # React frontend
│   ├── src/            # Components, pages, and assets
│   └── vite.config.js  
├── server/             # Flask backend
│   ├── app.py          # Main application entry
│   ├── models.py       # Database models
│   └── migrations/     # Database migrations
```