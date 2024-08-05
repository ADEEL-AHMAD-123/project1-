import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';



const MapComponent = ({ city, country, zoom = 13, markerPosition, popupText }) => {
  const [mapCenter, setMapCenter] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; 
  useEffect(() => {
    if (city && country) {
      fetchGeocode(city, country);
    }
  }, [city, country]);

  const fetchGeocode = async (city, country) => {
    const encodedCity = encodeURIComponent(city);
    const encodedCountry = encodeURIComponent(country);
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedCity},${encodedCountry}&key=${API_KEY}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setMapCenter({ lat, lng });
      } else {
        console.warn('No results from geocoding');
        setMapCenter(null);
      }
    } catch (error) {
      console.error('Error fetching geocode data:', error);
      setMapCenter(null);
    }
  };

  return (
    mapCenter ? (
      <LoadScript googleMapsApiKey={API_KEY}>
        <GoogleMap
          center={mapCenter}
          zoom={zoom}
          mapContainerStyle={{ width: '100%', height: '400px' }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              onClick={() => setShowInfoWindow(true)}
            >
              {showInfoWindow && (
                <InfoWindow onCloseClick={() => setShowInfoWindow(false)}>
                  <div>{popupText}</div>
                </InfoWindow>
              )}
            </Marker>
          )}
        </GoogleMap>
      </LoadScript>
    ) : <div>Loading map...</div>
  );
};

export default MapComponent;
