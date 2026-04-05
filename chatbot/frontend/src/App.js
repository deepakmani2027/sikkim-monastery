import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import GallerySection from './components/GallerySection';
import TravelTips from './components/TravelTips';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [monasteries, setMonasteries] = useState([]);
  const [travelTips, setTravelTips] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/monasteries`)
      .then(res => res.json())
      .then(data => setMonasteries(data))
      .catch(err => console.error('Failed to fetch monasteries:', err));

    fetch(`${API_URL}/api/travel-tips`)
      .then(res => res.json())
      .then(data => setTravelTips(data))
      .catch(err => console.error('Failed to fetch travel tips:', err));
  }, []);

  return (
    <div className="app" data-testid="app-container">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <GallerySection monasteries={monasteries} />
        <TravelTips tips={travelTips} />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}

export default App;
