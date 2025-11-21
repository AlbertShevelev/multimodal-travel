import React, { useEffect, useMemo, useState } from "react";
import "../styles/SearchForm.css";
import { searchFlights, fetchCities } from "../services/api";
import SearchResults from "./SearchResults";

const AutocompleteInput = ({
  value,
  onChange,
  options,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    const arr = q
      ? options.filter(c => c.toLowerCase().includes(q))
      : options;
    return arr.slice(0, 8);
  }, [value, options]);

  return (
    <div className="autocomplete">
      <input
        className="input-field"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />

      {open && filtered.length > 0 && (
        <ul className="autocomplete-list">
          {filtered.map((city) => (
            <li
              key={city}
              onMouseDown={() => {
                onChange(city);
                setOpen(false);
              }}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SearchForm = () => {
  const [cities, setCities] = useState([]);
  const [citiesError, setCitiesError] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [passengerType, setPassengerType] = useState("adult");

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
      const loadCities = async () => {
    try {
      const data = await fetchCities();
      setCities(Array.isArray(data.value) ? data.value : []);
    } catch (e) {
      console.error("Failed to load cities", e);
      setCities([]);
    }
  };

  loadCities();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await searchFlights(from, to, startDate, endDate);
      setResults(data); // data.value или {outbound, return}
    } catch (err) {
      console.error(err);
      setError("Ошибка при поиске билетов");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ticket-search">
      <div className="ticket-search-forms">
        <h2>Поиск подходящих билетов</h2>

        <div className="form-container">
          <AutocompleteInput
            value={from}
            onChange={setFrom}
            options={cities}
            placeholder="Откуда"
          />

          <AutocompleteInput
            value={to}
            onChange={setTo}
            options={cities}
            placeholder="Куда"
          />

          <input
            className="input-field"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            className="input-field"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Дата обратно"
          />

          <select
            className="select-field"
            value={passengerType}
            onChange={(e) => setPassengerType(e.target.value)}
          >
            <option value="adult">Взрослый</option>
            <option value="child">Детский</option>
          </select>

          <button className="search-button" onClick={handleSearch}>
            Найти билеты
          </button>
        </div>

        {citiesError && <div className="error-message">{citiesError}</div>}
      </div>

      <div className="ticket-search-results">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <SearchResults results={results?.value ? results.value : results} />
        )}
      </div>
    </div>
  );
};

export default SearchForm;
