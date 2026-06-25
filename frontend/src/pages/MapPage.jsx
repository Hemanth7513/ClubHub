import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import API_BASE_URL from '../config';
import Button from '../components/Button/Button';
import './MapPage.css';

// Fix for default Leaflet icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Brutalist Icon
const brutalistIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Center of Vijayawada
  const centerPosition = [16.5062, 80.6480];

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/clubs`);
        if (!response.ok) throw new Error('Failed to fetch clubs');
        const data = await response.json();
        
        // Only keep clubs that have valid coordinates
        const validClubs = data.filter(club => club.latitude && club.longitude);
        
        // Add some dummy coordinates for testing if none exist
        if (validClubs.length === 0 && data.length > 0) {
           const demoClubs = data.map((club, index) => ({
             ...club,
             latitude: 16.5062 + (Math.random() * 0.05 - 0.025),
             longitude: 80.6480 + (Math.random() * 0.05 - 0.025),
           }));
           setClubs(demoClubs);
        } else {
           setClubs(validClubs);
        }
      } catch (err) {
        console.error('Error fetching clubs for map:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  return (
    <div className="map-page">
      <motion.div 
        className="map-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container">
          <h1 className="title-xl editorial-font">Explore <span className="text-gradient">Vijayawada</span></h1>
          <p>Discover creative communities, tech hubs, and events happening around the city.</p>
        </div>
      </motion.div>

      <div className="map-wrapper">
        {loading ? (
          <div className="spinner" style={{ margin: 'auto', marginTop: '20vh' }}></div>
        ) : (
          <MapContainer 
            center={centerPosition} 
            zoom={13} 
            scrollWheelZoom={true} 
            className="leaflet-map-container"
          >
            {/* CartoDB Dark Matter Tiles for Brutalist Dark Mode Look */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {clubs.map(club => (
              <Marker 
                key={club.id} 
                position={[club.latitude, club.longitude]}
                icon={brutalistIcon}
              >
                <Popup className="custom-popup">
                  <div className="popup-content">
                    <img src={club.imageUrl || 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=300&q=80'} alt={club.name} className="popup-img" />
                    <h3 className="popup-title">{club.name}</h3>
                    <p className="popup-category">{club.category}</p>
                    <Link to={`/club/${club.id}`}>
                      <Button variant="primary" size="small" style={{ width: '100%', marginTop: '0.5rem' }}>
                        View Club
                      </Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapPage;
