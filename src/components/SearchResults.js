import React from "react";
import "../styles/SearchResults.css";

function SearchResults({ results }) {
  if (!results || results.length === 0) {
    return <div className="no-results">Рейсов не найдено</div>;
  }

  return (
    <div className="results-container">
      {results.map((r, idx) => (
        <div className="result-card" key={idx}>
          <div className="time-col">
            <div className="time">{r.departureTime}</div>
            <div className="city">{r.from}</div>
          </div>

          <div className="middle-col">
            <div className="duration">{r.duration}</div>
            <div className="arrow">→</div>
            <div className="route">{r.routeName}</div>
          </div>

          <div className="time-col">
            <div className="time">{r.arrivalTime}</div>
            <div className="city">{r.to}</div>
          </div>

          <div className="right-col">
            <div className="price">{r.price} ₽</div>
            <button className="buy-btn">Купить</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchResults;
