import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import debounce from 'lodash/debounce';

// Fix marker icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_KEY = 'ebd93d595fa745dbbec0f4a967ea9a47'; // Replace with your OpenCage API key

const MapComponent = ({ city, country, zoom = 13, markerPosition, popupText }) => {
  const [mapCenter, setMapCenter] = useState(null);

  // Debounce the geocode function
  const fetchGeocode = debounce(async (city, country) => {
    if (!city || !country) {
      console.warn('City or country is missing');
      return;
    }

    try {
      const encodedCity = encodeURIComponent(city);
      const encodedCountry = encodeURIComponent(country);
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodedCity},${encodedCountry}&key=${API_KEY}`);
      const data = await response.json();
      console.log('Geocoding response:', data);

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        setMapCenter([lat, lng]);
      } else {
        console.warn('No results from geocoding');
        setMapCenter(null);
      }
    } catch (error) {
      console.error('Error fetching geocode data:', error);
      setMapCenter(null);
    }
  }, 300); // Adjust debounce delay as needed

  useEffect(() => {
    if (city && country) {
      fetchGeocode(city, country);
    } else {
      setMapCenter(null); // Clear the map if no city or country
    }
  }, [city, country, fetchGeocode]);

  return (
    mapCenter ? (
      <MapContainer center={mapCenter} zoom={zoom} className="country-map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>{popupText}</Popup>
          </Marker>
        )}
      </MapContainer>
    ) : <div>Loading map...</div> // Placeholder while waiting for mapCenter
  );
};

export default MapComponent;
