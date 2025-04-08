import pandas as pd
from pycountry_convert import country_alpha2_to_continent_code, country_name_to_country_alpha2
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable

geolocator = Nominatim(user_agent="continent_finder")

def get_continent(lat, lon, retries=3):
    try:
        location = geolocator.reverse((lat, lon), exactly_one=True, language='en')
        if location and location.raw.get('address'):
            address = location.raw['address']
            country = address.get('country', '')
            
            if country:
                try:
                    country_code = country_name_to_country_alpha2(country)
                    continent_code = country_alpha2_to_continent_code(country_code)
                    continent_name = {
                        'AF': 'Africa',
                        'AS': 'Asia',
                        'EU': 'Europe',
                        'NA': 'North America',
                        'SA': 'South America',
                        'OC': 'Oceania',
                        'AN': 'Antarctica'
                    }.get(continent_code, 'Unknown')
                    return continent_name
                except:
                    return 'Unknown'
    except (GeocoderTimedOut, GeocoderUnavailable):
        if retries > 0:
            return get_continent(lat, lon, retries=retries-1)
    return 'Unknown'

df = pd.read_csv('../backend/data/ip_addresses.csv')
df['continent'] = df.apply(lambda row: get_continent(row['Latitude'], row['Longitude']), axis=1)
df.to_csv('packages_with_continents.csv', index=False)

print("Continents are added successfully")