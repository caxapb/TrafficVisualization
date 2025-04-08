# TrafficVisualization

This is a simple web application with THREE.js features. Packages of data that are sent to the server are displayed
on the globe as color points.
- The server gets packages of data (IP, Latitude, Longitude,
Timestamp, Continent, Suspicion state). The real time package delivering is simulated in *sender.py*: based on timestamps
packages are sent with correct time delays.   
- js async functions send requests to server (GET method) to get data and statistics. After receiving updated info, it is parsed, corresponding points appear on the globe, and statistical charts are updated. Green dots are verified packages and red dots are suspicious packages. These points are shining on the sphere during 12 seconds.
- The left corner keeps data about top locations: which locations are sending the most of packages. The right corner is a statictical chart demonstrating continents and amount of packages sent from there.

The functionality of this application can be expanded if required. Additional data can bring more visualizations and new features can be rendered.

# Data Preparation
To collect continents statistics we firstly should identify a continent per each package. The scripts/data_preparation.py takes the **initial** dataset ip_addresses.csv, processes each record, and assigns it a country. The processing lasts about an hour for the best accuracy. After that we get the **packages_with_continents.csv** file (see backend/data folder).

# Running the App

To run the app:
1) clone the repository
2) run from the project root:

```
docker-compose up --build
```

3) the application can be accessed on: http://localhost/, http://localhost:80, or http://localhost/app. 