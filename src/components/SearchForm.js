import React, { useState } from 'react';
import '../styles/SearchForm.css';
import { searchFlights } from '../services/api'; 

const SearchForm = () => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [passengerType, setPassengerType] = useState('adult');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSearch = async () => {
    setLoading(true);
        setError('');
        try {
        // Вызов функции поиска билетов
        const data = await searchFlights(from, to, startDate);
        setResults(data.value); // Сохраняем результаты в state
        } catch (err) {
        setError('Ошибка при поиске билетов');
        } finally {
        setLoading(false);
        }
    };
    return (
        <div className="ticket-search">
            <h2>Поиск подходящих билетов</h2>
            <div className="form-container">
                <input className="input-field" type="text" placeholder="Откуда" value={from} onChange={(e) => setFrom(e.target.value)}/>
                <input className="input-field" type="text" placeholder="Куда" value={to} onChange={(e) => setTo(e.target.value)}/>
                <input className="input-field" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
                <input className="input-field" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
                <select className="select-field" value={passengerType} onChange={(e) => setPassengerType(e.target.value)}>
                    <option value="adult">Взрослый</option>
                    <option value="child">Детский</option>
                </select>
                <button className="search-button" onClick={handleSearch}>Найти билеты</button>
            </div>
            {/* Отображение ошибок */}
            {error && <div className="error-message">{error}</div>}

            {/* Отображение результатов */}
            {loading ? (
                <div>Загрузка...</div>
            ) : (
                <div className="results">
                {results.length === 0 ? (
                    <div>Нет доступных билетов</div>
                ) : (
                    results.map((ticket, index) => (
                        <div key={index} className="ticket">
                            <h3>{ticket.routeName}</h3>

                            <p><strong>Отправление:</strong> {ticket.from} — {ticket.departureTime}</p>
                            <p><strong>Прибытие:</strong> {ticket.to} — {ticket.arrivalTime}</p>

                            <p><strong>В пути:</strong> {ticket.duration}</p>

                            <p><strong>Цена:</strong> {ticket.price} руб</p>

                            <p><strong>Автобус:</strong> {ticket.busKey}</p>
                            <p><strong>Перевозчик:</strong> {ticket.carrierKey}</p>
                        </div>
                    ))

                )}
                </div>
            )}
        </div>
  );
};

export default SearchForm;
