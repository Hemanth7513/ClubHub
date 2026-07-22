/* eslint-disable */
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

// Custom Premium Brutalist Icon
const premiumIcon = new L.divIcon({
  className: 'premium-marker',
  html: `<div class="premium-pin">
           <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#FF2E63" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
             <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="#000000"></circle>
           </svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
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
        
        // If the database is completely empty (we wiped it), show some dummy data for the map to look alive
        if (data.length === 0) {
           setClubs([
             { id: 'demo1', name: 'Vijayawada Tech Hub', category: 'Technology', latitude: 16.5062, longitude: 80.6480 },
             { id: 'demo2', name: 'Benz Circle Runners', category: 'Sports', latitude: 16.4971, longitude: 80.6496 },
             { id: 'demo3', name: 'Krishna River Art Club', category: 'Arts & Culture', latitude: 16.5120, longitude: 80.6120 }
           ]);
        } else if (validClubs.length === 0) {
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

      <div className="map-wrapper container">
        {loading ? (
          <div className="spinner" style={{ margin: 'auto', marginTop: '10vh' }}></div>
        ) : (
          <div className="map-brutalist-container">
            <MapContainer 
              center={centerPosition} 
              zoom={13} 
              scrollWheelZoom={true} 
              className="leaflet-map-container"
            >
              <TileLayer
                attribution='&copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
            {clubs.map(club => (
              <Marker 
                key={club.id} 
                position={[club.latitude, club.longitude]}
                icon={premiumIcon}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
