# TrafficVisualization

This is a simple web application with THREE.js features. Packages of data that are sent to the server are displayed
on the globe as color points.
- The server gets packages of data (IP, Latitude, Longitude,
Timestamp, Continent, Suspicion state). The real time package delivering is simulated in sender.py: based on timestamps
packages are sent with correct time delays.   
- js async function send requests to server (GET method) to get data and statistics. After receiving updated info, it is parsed and corresponding points appear on the globe. Green dots are verified packages and red dots are suspicious packages. These points are shining on the sphere during 12 seconds.
- The left corner keeps data about top locations: which location is sending the most of packages. The right corner is a statictical chart demonstrating continents and amount of packages sent from there.

The functionality of this application can be expanded if required. Additional data can bring more visualizations and new features can be rendered.