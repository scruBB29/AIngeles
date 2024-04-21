import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Logo from "./Logo.png";
import "./category.css";
import FormattedText from "./formating";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";
import { redIcon, greenIcon } from "./leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";

function MapComponent({ currentLocation, locations, selectedLocation }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    if (currentLocation && locations.length > 0 && selectedLocation !== null) {
      const waypoints = [
        L.latLng(currentLocation.lat, currentLocation.lng),
        L.latLng(locations[selectedLocation].coordinates[0], locations[selectedLocation].coordinates[1])
      ];

      // Remove previous routing line if it exists
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }

      // Create new routing line
      const routingControl = L.Routing.control({
        waypoints: waypoints,
        router: new L.Routing.osrmv1({
          serviceUrl: "http://router.project-osrm.org/route/v1",
        }),
        routeWhileDragging: true, // Enable route update while dragging
        draggableWaypoints: false, // Disable waypoint dragging
        addWaypoints: false, // Disable adding new waypoints
        fitSelectedRoutes: 'smart', // Fit the map bounds to the selected route
        lineOptions: {
          styles: [{ color: 'blue', opacity: 0.6, weight: 4 }]
        },
        createMarker: function(i, waypoint, n) {
          return L.marker(waypoint.latLng, {
            draggable: false, // Make the marker non-draggable
            icon: new L.DivIcon({ className: 'routing-icon', iconSize: [10, 10] }),
            zIndexOffset: 1000 + i * n
          });
        }
      }).addTo(map);

      // Store reference to the new routing control
      routingControlRef.current = routingControl;
    }
  }, [currentLocation, locations, map, selectedLocation]);

  return null;
}

function App() {
  const [days, setDays] = useState("");
  const [activities, setActivities] = useState({
    nightlife: false,
    adventure: false,
    culture: false,
    landmarks: false,
  });
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error("Error getting current location:", error);
        setErrorMessage("Error getting current location");
      }
    );
  }, []);

  useEffect(() => {
    if (generatedResponse) {
      const fetchLocationsCoordinates = async () => {
        try {
          const locationsRegex =
            /([A-Za-z\s]+)\s*\(([-+]?\d+\.\d+)°\s*(N|S),\s*([-+]?\d+\.\d+)°\s*(E|W)\)/g;

          let match;
          const extractedLocations = [];
          while ((match = locationsRegex.exec(generatedResponse)) !== null) {
            const name = match[1];
            const lat = parseFloat(match[2]) * (match[3] === "S" ? -1 : 1);
            const lng = parseFloat(match[4]) * (match[5] === "W" ? -1 : 1);
            extractedLocations.push({ name, coordinates: [lat, lng] });
          }
          setLocations(extractedLocations);
        } catch (error) {
          console.error("Error extracting coordinates:", error);
          setErrorMessage("Error extracting coordinates");
        }
      };
      fetchLocationsCoordinates();
    }
  }, [generatedResponse]);

  useEffect(() => {
    if (mapRef.current && locations.length > 0) {
      const bounds = locations.reduce(
        (acc, location) => acc.extend(location.coordinates),
        latLngBounds(locations[0].coordinates, locations[0].coordinates)
      );
      mapRef.current.fitBounds(bounds);
    }
  }, [locations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Check if the number of days is valid
    if (!days || (days < 1 || days > 14)) {
      setErrorMessage("Please enter a valid number of days (1-14).");
      setLoading(false);
      return;
    }
  
    const selectedActivities = Object.entries(activities)
      .filter(([_, selected]) => selected)
      .map(([activity, _]) => activity);
  
    const prompt = `Plan vacation for ${days} days within Angeles City only in table form  (use this format| Day | Location (with the accurate coordinate) | Activity |). Activities: ${selectedActivities.join(", ")} (be accurate and give only ${days} location)`;
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/chats/create/",
        { prompt }
      );

      if (response.data.status === "success") {
        setGeneratedResponse(response.data.prompt);
        setErrorMessage("");
      } else {
        setGeneratedResponse("");
        setErrorMessage("Error generating response: " + response.data.prompt);
      }
    } catch (error) {
      setGeneratedResponse("");
      setErrorMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (activity) => {
    setActivities((prevActivities) => ({
      ...prevActivities,
      [activity]: !prevActivities[activity],
    }));
  };

  const handleMarkerClick = (index) => {
    setSelectedLocation(index);
  };

  return (
    <div className="background-container2">
      <header className="header1">
        <img src={Logo} alt="Your Logo" className="logo" />
      </header>

      <div className="container">
        <div className="left-column">
          <form onSubmit={handleSubmit}>
            <label>
              HOW MANY DAYS DO YOU PLAN YOUR TRIP?
              <input
                type="number"
                value={days}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? "" : parseInt(e.target.value, 10);
                  if (value === "" || (value >= 1 && value <= 14)) {
                    setDays(value);
                  }
                }}
                required
                min={1}
                max={14}
              />
            </label>
            <fieldset>
              <legend>
                <b>SELECT CATEGORY:</b>
              </legend>
              {Object.entries(activities).map(([activity, checked]) => (
                <label key={activity}>
                  {activity.toUpperCase()}
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckboxChange(activity)}
                  />
                </label>
              ))}
            </fieldset>
            <button className="button6" type="submit">
              Generate Plans
            </button>
          </form>
        </div>
        <div className="right-column">
          <div className="head1">
            <h2>YOUR PLANS WOULD BE:</h2>
          </div>
          {loading && <p>Loading...</p>}
          {generatedResponse && !loading && (
            <div>
              <div className="container5">
                <p>
                  <FormattedText response={generatedResponse} />
                </p>
              </div>
              {}
              {generatedResponse && currentLocation && (
                <div className="leaflet-container">
                  <MapContainer ref={mapRef} center={currentLocation} zoom={8}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {locations.map((location, index) => (
                      <Marker key={index} position={location.coordinates} icon={redIcon} eventHandlers={{click: () => handleMarkerClick(index)}}>
                        <Popup >{location.name}</Popup>
                      </Marker>
                    ))}
                    {/* Current location marker */}
                    {currentLocation && (
                      <Marker position={currentLocation} icon={greenIcon}>
                        <Popup autoOpen={true}><b>Your current location</b></Popup>
                      </Marker>
                    )}
                    <MapComponent currentLocation={currentLocation} locations={locations} selectedLocation={selectedLocation} />
                  </MapContainer>
                </div>
              )}
            </div>
          )}
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
