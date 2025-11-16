import React, { useState } from 'react';
import '../styles/SearchForm.css';

const SearchForm = ({ onSearch }) => {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(origin, destination);
    };

    return (
        <div className="ticket-search">
            <h2>Поиск подходящих билетов</h2>
            <div className="form-container">
                <input className="input-field" type="text" placeholder="Откуда" />
                <input className="input-field" type="text" placeholder="Куда" />
                <input className="input-field" type="date" />
                <input className="input-field" type="date" />
                <select className="select-field">
                <option value="adult">Взрослый</option>
                <option value="child">Детский</option>
                </select>
                <button className="search-button">Найти билеты</button>
            </div>
        </div>
  );
};

export default SearchForm;
