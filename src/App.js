import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Parallax from './components/Parallax';
import SearchForm from './components/SearchForm';
import RouteResults from './components/SearchResults';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';

function App() {
  const [results, setResults] = useState([]);

  const handleSearch = (origin, destination) => {
    const mockResults = [
      { origin, destination, duration: 4, price: 1500 },
      { origin, destination, duration: 3, price: 1200 },
    ];
    setResults(mockResults);
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Parallax />
        <Routes>
          <Route path="/" element={<SearchForm onSearch={handleSearch} />} />
          <Route path="/search" element={<><SearchForm onSearch={handleSearch} /><RouteResults results={results} /></>} />
          <Route path="/bookings" element={<BookingForm route={results[0]} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
