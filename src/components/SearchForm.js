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
            <div className="input-container">
                <input type="text" placeholder="Откуда" />
                <input type="text" placeholder="Куда" />
                <input type="date" />
                <input type="date" />
                <select>
                <option value="">Кто едет</option>
                <option value="adult">Взрослый</option>
                <option value="child">Детский</option>
                </select>
                <button>Найти билеты</button>
            </div>
        </div>
  );
};

export default SearchForm;
