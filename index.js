let initialLat, initialLon; // Variables to store the initial position
let userLat, userLon, heading; // Variables for current user position and heading

const arObjects = []; // Array to store dynamically created AR objects with new coordinates

// Array to define distances and bearings for each AR object from the initial location
const objectDistances = [
  { distance: 100, bearing: 0 },   // 100 meters north
  { distance: 200, bearing: 90 },  // 200 meters east
  { distance: 150, bearing: 180 }, // 150 meters south
  { distance: 300, bearing: 270 }  // 300 meters west
];

// Geolocation API to get the user's initial GPS location
navigator.geolocation.getCurrentPosition(position => {
  initialLat = position.coords.latitude;
  initialLon = position.coords.longitude;

  // Once the initial position is captured, create AR objects relative to it
  createARObjectsRelativeToInitial();
}, err => {
  console.error("Error getting initial GPS position", err);
}, { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 });

// DeviceOrientation API to get the user's heading (compass direction)
window.addEventListener('deviceorientation', event => {
  heading = event.alpha;  // Rotation around the Z-axis (compass direction)
});

// Function to create AR objects based on the initial position
function createARObjectsRelativeToInitial() {
  const scene = document.querySelector('a-scene'); // Get the A-Frame scene element

  // Loop through the objectDistances array to create each AR object at the specified distance and bearing
  objectDistances.forEach((objectData, index) => {
    // Use Geolib to calculate the new coordinates for each object
    const newCoords = geolib.computeDestinationPoint(
      { latitude: initialLat, longitude: initialLon }, // Initial coordinates
      objectData.distance,  // Distance from the initial location (in meters)
      objectData.bearing    // Bearing (direction) from the initial location (in degrees)
    );

    // Create a new object entry in the arObjects array
    arObjects.push({
      id: `object${index + 1}`,  // Create a unique ID for each object
      latitude: newCoords.latitude,
      longitude: newCoords.longitude
    });

    // Dynamically create the A-Frame entity for each AR object
    const arEntity = document.createElement('a-box');
    arEntity.setAttribute('id', `object${index + 1}`);
    arEntity.setAttribute('position', '0 0 -5'); // Default position (updated later)
    arEntity.setAttribute('rotation', '0 45 0');
    arEntity.setAttribute('color', '#4CC3D9');
    scene.appendChild(arEntity);
  });

  // Start the position update loop after the objects are created
  updateLoop();
}

// Function to update each AR object's position based on user location and heading
function updateARObjectPosition(object, userLat, userLon, heading) {
  const distance = geolib.getDistance(
    { latitude: userLat, longitude: userLon },
    { latitude: object.latitude, longitude: object.longitude }
  );

  const bearing = geolib.getGreatCircleBearing(
    { latitude: userLat, longitude: userLon },
    { latitude: object.latitude, longitude: object.longitude }
  );

  const relativeAngle = bearing - heading;
  const x = distance * Math.sin(relativeAngle * Math.PI / 180);
  const z = distance * Math.cos(relativeAngle * Math.PI / 180);

  const objectEntity = document.getElementById(object.id);
  objectEntity.setAttribute('position', `${x} 0 ${z}`);
}

// Function to update the positions of all AR objects in a loop
function updateLoop() {
  if (userLat && userLon && heading !== undefined) {
    // Loop through all AR objects and update their positions
    arObjects.forEach(object => {
      updateARObjectPosition(object, userLat, userLon, heading);
    });
  }

  requestAnimationFrame(updateLoop); // Keep updating at each animation frame
}

// Geolocation API to continuously track the user's current position
navigator.geolocation.watchPosition(position => {
  userLat = position.coords.latitude;
  userLon = position.coords.longitude;
}, err => {
  console.error("Error getting GPS position", err);
}, { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 });
