import React from 'react';
import '../styles/RouteResults.css';

const RouteResults = ({ results }) => {
    return (
        <div className="route-results">
            <h2>Результаты поиска</h2>
            <ul>
                {results.map((route, index) => (
                    <li key={index} className="route-item">
                    <div>{route.origin} → {route.destination}</div>
                    <div>Время: {route.duration} ч</div>
                    <div>Цена: {route.price} ₽</div>
                    <button>Забронировать</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RouteResults;