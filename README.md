This project aims to develop a system that calculates vehicle travel details, including distance traveled, speed, overspeed, and stopped time, from a given set of coordinates in a CSV file. The system will also display the travel locations on a map.

FUNCTIONAL REQUIREMENTS

1.CSV File Upload: The system will allow users to upload a CSV file containing the vehicle's coordinates (latitude and longitude) along with timestamps.

2.Data Processing: The system will process the uploaded data to calculate the following:
Distance traveled between each pair of coordinates
Speed at each point (using the distance and time difference between consecutive coordinates)
Overspeed instances (based on a predefined speed limit)
Stopped time (when the vehicle is stationary for a certain period)

3.Map Visualization: The system will display the travel locations on a map, using a mapping library Leaflet.

4.Data Visualization: The system will provide a dashboard to display the calculated travel details, including:
Total distance traveled
Total Travelled Duration
Over Speeding Duration
Over Speeding Distance
Stopped Duration

TECHNICAL REQUIREMENTS

1.Backend: Node.js with Express.js framework.
2.Frontend: React JS with a mapping library react-leaflet.
3.Database: Mongo DB

SYSTEM ARCHITECTURE

1.CSV File Upload: The user uploads a CSV file to the server.
2.Data Processing: The server processes the uploaded data using Node.js and calculates the travel details.
3.Map Visualization: The server sends the processed data to the client, which displays the travel locations on a map using a react-leaflet library.
4.Data Visualization: The client displays the calculated travel details on a dashboard.

