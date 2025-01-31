import os
import requests
from math import radians, sin, cos, sqrt, atan2

def get_coordinates(place_id: str):
    url = f"https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        'placeid': place_id,
        'key': os.getenv('GOOGLE_API_KEY')
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        place_details = response.json().get('result', {})
        lat = place_details.get('geometry', {}).get('location', {}).get('lat')
        lng = place_details.get('geometry', {}).get('location', {}).get('lng')
        if lat is not None and lng is not None:
            return lat, lng
        else:
            return None, None
    else:
            return None, None
        
def haversine(lat1, lon1, lat2, lon2):
    R = 3958.8
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    return R * c