import React, { useEffect, useState } from 'react';
import '../styles/SearchForm.css';
import { searchFlights } from '../services/api';
import SearchResults from "./SearchResults";
import AutocompleteInput from "./AutocompleteInput";
import axios from "axios";

const SearchForm = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(''); 

  const [tripType, setTripType] = useState('oneway');
  const [passengerType, setPassengerType] = useState('adult');

  const [cities, setCities] = useState([]);

  const [outboundResults, setOutboundResults] = useState([]);
  const [returnResults, setReturnResults] = useState([]); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // загрузка городов
  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/cities");
        setCities(res.data.value || []);
      } catch (e) {
        console.error("cities load error:", e);
      }
    };
    loadCities();
  }, []);

  const handleSearch = async () => {
    // валидация
    if (!from || !to || !startDate) {
      setError("Заполните Откуда, Куда и Дату");
      return;
    }
    if (tripType === 'roundtrip' && !endDate) {
      setError("Укажите дату обратного билета");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const outboundData = await searchFlights(from, to, startDate);
      setOutboundResults(outboundData.value || []);

      if (tripType === 'roundtrip') {
        const returnData = await searchFlights(to, from, endDate);
        setReturnResults(returnData.value || []);
      } else {
        setReturnResults([]);
      }

    } catch (err) {
      console.error(err);
      setError('Ошибка при поиске билетов');
      setOutboundResults([]);
      setReturnResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ticket-search">
      <div className='ticket-search-forms'>
        <h2>Поиск подходящих билетов</h2>

        

        <div className="form-container">
            <div style={{ display: "flex", gap: 16, backgroundColor: "white", height:"59px", width:"300px", borderRadius:"5px", fontSize:"14px"}}>
                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                    type="radio"
                    name="tripType"
                    value="oneway"
                    checked={tripType === "oneway"}
                    onChange={() => setTripType("oneway")}
                    />
                    В одну сторону
                </label>

                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                    type="radio"
                    name="tripType"
                    value="roundtrip"
                    checked={tripType === "roundtrip"}
                    onChange={() => setTripType("roundtrip")}
                    />
                    Туда-обратно
                </label>
            </div>
          <AutocompleteInput
            value={from}
            onChange={setFrom}
            placeholder="Откуда"
            options={cities}
          />

          <AutocompleteInput
            value={to}
            onChange={setTo}
            placeholder="Куда"
            options={cities}
          />

          <input
            className="input-field"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />


          {tripType === 'roundtrip' && (
            <input
              className="input-field"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          )}

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
      </div>

      <div className='ticket-search-results'>
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <>

            <h3 style={{ marginTop: 20 }}>Туда</h3>
            <SearchResults results={outboundResults} />

            {tripType === "roundtrip" && (
              <>
                <h3 style={{ marginTop: 30 }}>Обратно</h3>
                <SearchResults results={returnResults} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
