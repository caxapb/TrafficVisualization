import pandas as pd
import requests
import time

def send_data(csv_file, server_url):
    df = pd.read_csv(csv_file)
    package_start = df.iloc[0]["Timestamp"] 
    app_start = time.time()

    for _, row in df.iterrows():
        package = {
            "ip":         row["ip address"],    
            "latitude":   row["Latitude"],
            "longitude":  row["Longitude"],
            "timestamp":  row["Timestamp"],
            "suspicious": row["suspicious"],
            "continent":  row["continent"],
        }
        
        delay = row["Timestamp"] - package_start
        while time.time() - app_start < delay:
            time.sleep(0.1)
        
        response = requests.post(f"{server_url}/api/packages", json=package)

if __name__ == "__main__":
    # there will be "data" folder in docker
    send_data("data/packages_with_continents.csv", "http://server:5000")