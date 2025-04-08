# TrafficVisualization

This is a simple web application with THREE.js features. Packages of data that are sent to the server are displayed
on the globe as color points.
- The server gets packages of data (IP, Latitude, Longitude,
Timestamp, Continent, Suspicion state). The real time package delivering is simulated in sender.py: based on timestamps
packages are sent with correct time delays.   
- js async function send requests to server (GET method) to get data and statistics. After receiving updated info, it is parsed and corresponding points appear on the globe. Green dots are verified packages and red dots are suspicious packages. These points are shining on the sphere during 12 seconds.
- The left corner keeps data about top locations: which location is sending the most of packages. The right corner is a statictical chart demonstrating continents and amount of packages sent from there.

The functionality of this application can be expanded if required. Additional data can bring more visualizations and new features can be rendered.

# Data Preparation
To collect continents statistics we firstly should identify them for each package. The data_preparation.py takes the **initial** dataset ip_addresses.csv, process each record and assign it a country. The processing lasts about an hour for the best accuracy. After that we get the **packages_with_continents.csv** file.

# Running the App

To run the app:
1) clone the repository
2) run from the project root:

```
docker-compose up --build
```

3) the application can be accessed on: http://localhost/, http://localhost:80, or http://localhost/app. 