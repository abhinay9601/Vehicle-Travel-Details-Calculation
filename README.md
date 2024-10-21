# Vehicle Travel Details Calculation System

This project develops a system to calculate and visualize vehicle travel details, including distance traveled, speed, overspeed instances, and stopped time, based on GPS coordinates from a CSV file. It also displays travel locations on a map.

---

## **Functional Requirements**

- **CSV File Upload**  
  - Users can upload a CSV file containing vehicle coordinates (latitude and longitude) along with timestamps.

- **Data Processing**  
  - The system calculates:
    - Distance traveled between each pair of coordinates.
    - Speed at each point, using distance and time difference between consecutive coordinates.
    - Overspeed instances based on a predefined speed limit.
    - Stopped time when the vehicle remains stationary for a defined period.

- **Map Visualization**  
  - Displays the travel route and locations on a map using the `Leaflet` library.

- **Data Visualization Dashboard**  
  - Provides a summary of the calculated travel details, including:
    - **Total Distance Traveled**  
    - **Total Travel Duration**  
    - **Overspeeding Duration**  
    - **Overspeeding Distance**  
    - **Stopped Duration**

---

## **Technical Requirements**

- **Backend**  
  - Node.js with Express.js framework

- **Frontend**  
  - React.js with `react-leaflet` library for mapping

- **Database**  
  - MongoDB for data storage

---

## **System Architecture**

1. **CSV File Upload**  
   - The user uploads a CSV file to the server.

2. **Data Processing**  
   - The server processes the uploaded data using Node.js to calculate travel details.

3. **Map Visualization**  
   - The server sends the processed data to the frontend, which displays the route and locations using the `react-leaflet` library.

4. **Data Visualization**  
   - The client shows calculated travel details on a dashboard for easy monitoring.

---
