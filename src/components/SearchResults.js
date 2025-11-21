import React, { useMemo, useState } from "react";
import "../styles/SearchResults.css";
import { bookTicket } from "../services/api";

const transportIcons = {
  air: "✈️",
  bus: "🚌",
  train: "🚆",
  ship: "⛴️",
  taxi: "🚕",
};

function normalizeTicket(t) {
  if (!t) return {};
  return {
    ...t,
    routeName: t.routeName || t.routename || t.Рейс || "Рейс",
    companyName: t.companyName || t.carrierName || "Перевозчик",
    code: t.code || "",
    transport: t.transport || "bus",
    price: Number(t.price ?? t.Price ?? 0),
    departureTime: t.departureTime || "",
    arrivalTime: t.arrivalTime || "",
    duration: t.duration || "",
    from: t.from || "",
    to: t.to || "",
  };
}

const SearchResults = ({ results }) => {
  const isRoundTrip =
    results &&
    !Array.isArray(results) &&
    Array.isArray(results.outbound) &&
    Array.isArray(results.return);

  const outboundList = useMemo(() => {
    const arr = isRoundTrip ? results.outbound : (results || []);
    return arr.map(normalizeTicket);
  }, [results, isRoundTrip]);

  const returnList = useMemo(() => {
    if (!isRoundTrip) return [];
    return results.return.map(normalizeTicket);
  }, [results, isRoundTrip]);

  const [selectedOutIdx, setSelectedOutIdx] = useState(0);
  const [selectedRetIdx, setSelectedRetIdx] = useState(0);

  const selectedOut = outboundList[selectedOutIdx];
  const selectedRet = returnList[selectedRetIdx];

  const totalPrice = isRoundTrip
    ? (selectedOut?.price || 0) + (selectedRet?.price || 0)
    : (selectedOut?.price || 0);

  async function handleBookOneWay(ticket) {
    const missing = [];
    if (!ticket.fromStopKey) missing.push("fromStopKey");
    if (!ticket.toStopKey) missing.push("toStopKey");
    if (!ticket.scheduleKey) missing.push("scheduleKey");
    if (!ticket.departureDateTime) missing.push("departureDateTime");
    if (!ticket.price) missing.push("price");

    if (missing.length) {
      console.error("Missing fields:", missing, ticket);
      alert("В данных билета нет: " + missing.join(", "));
      return;
    }

    const name = prompt("ФИО пассажира:");
    const phone = prompt("Телефон:");
    const email = prompt("Email:");
    if (!name || !phone || !email) {
      alert("Нужно заполнить данные пассажира");
      return;
    }

    const payload = {
      fromStopKey: ticket.fromStopKey,
      toStopKey: ticket.toStopKey,
      scheduleKey: ticket.scheduleKey,
      routeName: ticket.routeName,
      departureDateTime: ticket.departureDateTime,
      arrivalDateTime: ticket.arrivalDateTime || null,
      price: ticket.price,
      seatNumber: 1,
      passenger: { name, phone, email },
    };

    const res = await bookTicket(payload);

    if (res.error) {
      console.error("BOOK ERROR:", res);
      alert("Ошибка бронирования: " + (res.details?.message?.value || res.details || ""));
    } else {
      alert("Бронь создана! № " + (res.Ref_Key || "OK"));
    }
  }

  async function handleBookRoundTrip() {
    if (!selectedOut || !selectedRet) {
      alert("Выберите билеты туда и обратно");
      return;
    }
    const check = (ticket, label) => {
      const miss = [];
      if (!ticket.fromStopKey) miss.push("fromStopKey");
      if (!ticket.toStopKey) miss.push("toStopKey");
      if (!ticket.scheduleKey) miss.push("scheduleKey");
      if (!ticket.departureDateTime) miss.push("departureDateTime");
      if (!ticket.price) miss.push("price");
      if (miss.length) {
        throw new Error(`${label}: нет полей ${miss.join(", ")}`);
      }
    };

    try {
      check(selectedOut, "Туда");
      check(selectedRet, "Обратно");
    } catch (e) {
      console.error(e);
      alert(e.message);
      return;
    }
    const name = prompt("ФИО пассажира:");
    const phone = prompt("Телефон:");
    const email = prompt("Email:");
    if (!name || !phone || !email) {
      alert("Нужно заполнить данные пассажира");
      return;
    }
    const passenger = { name, phone, email };

    const makePayload = (ticket) => ({
      fromStopKey: ticket.fromStopKey,
      toStopKey: ticket.toStopKey,
      scheduleKey: ticket.scheduleKey,
      routeName: ticket.routeName,
      departureDateTime: ticket.departureDateTime,
      arrivalDateTime: ticket.arrivalDateTime || null,
      price: ticket.price,
      seatNumber: 1,
      passenger,
    });

    try {
      const outRes = await bookTicket(makePayload(selectedOut));
      if (outRes.error) throw outRes;

      const retRes = await bookTicket(makePayload(selectedRet));
      if (retRes.error) throw retRes;

      alert(
        `Бронь туда-обратно создана!\n` +
          `Туда: ${outRes.Ref_Key || "OK"}\n` +
          `Обратно: ${retRes.Ref_Key || "OK"}`
      );
    } catch (err) {
      console.error("ROUNDTRIP BOOK ERROR:", err);
      alert("Ошибка бронирования: " + (err.details?.message?.value || err.details || err.message || ""));
    }
  }
  if (!results || (Array.isArray(results) && results.length === 0)) {
    return <div className="no-results">Нет доступных билетов</div>;
  }
  if (isRoundTrip && outboundList.length === 0 && returnList.length === 0) {
    return <div className="no-results">Нет доступных билетов</div>;
  }
  return (
    <div className="results-wrapper">
      {!isRoundTrip && (
        outboundList.map((item, idx) => (
          <div key={idx} className="ticket-card">
            <div className="left-block">
              <div className="airline-icon">
                {transportIcons[item.transport] || "🚌"}
              </div>
              <div>
                <div className="airline-name">{item.companyName}</div>
                <div className="flight-number">
                  {item.transport === "train" ? "Поезд" : "Рейс"} {item.code}
                </div>
              </div>
            </div>

            <div className="middle-block">
              <div className="time-row">
                <div className="time">{item.departureTime}</div>
                <div className="time">{item.arrivalTime}</div>
              </div>
              <div className="city-row">
                <div className="city">{item.from}</div>
                <div className="city">{item.to}</div>
              </div>
              <div className="duration-row">
                <span>⏱ {item.duration}</span>
                <span className="direct">Прямой</span>
              </div>
            </div>

            <div className="right-block">
              <div className="price">{item.price} ₽</div>
              <div className="per-person">За человека</div>
              <button className="choose-btn" onClick={() => handleBookOneWay(item)}>
                Выбрать
              </button>
            </div>
          </div>
        ))
      )}
      {isRoundTrip && (
        <div className="ticket-card roundtrip-card">
          <div className="roundtrip-sections">
            <div className="roundtrip-section">
              <div className="section-title">Туда</div>
              <div className="section-list">
                {outboundList.map((item, idx) => (
                  <div
                    key={idx}
                    className={`segment-row ${idx === selectedOutIdx ? "selected" : ""}`}
                    onClick={() => setSelectedOutIdx(idx)}
                  >
                    <div className="segment-left">
                      <div className="segment-icon">
                        {transportIcons[item.transport] || "🚌"}
                      </div>
                      <div className="segment-main">
                        <div className="segment-route">{item.routeName}</div>
                        <div className="segment-times">
                          {item.departureTime} — {item.arrivalTime}
                        </div>
                        <div className="segment-duration">{item.duration}</div>
                      </div>
                    </div>
                    <div className="segment-price">{item.price} ₽</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="roundtrip-section">
              <div className="section-title">Обратно</div>
              <div className="section-list">
                {returnList.length === 0 ? (
                  <div className="no-returns">Обратных рейсов нет</div>
                ) : (
                  returnList.map((item, idx) => (
                    <div
                      key={idx}
                      className={`segment-row ${idx === selectedRetIdx ? "selected" : ""}`}
                      onClick={() => setSelectedRetIdx(idx)}
                    >
                      <div className="segment-left">
                        <div className="segment-icon">
                          {transportIcons[item.transport] || "🚌"}
                        </div>
                        <div className="segment-main">
                          <div className="segment-route">{item.routeName}</div>
                          <div className="segment-times">
                            {item.departureTime} — {item.arrivalTime}
                          </div>
                          <div className="segment-duration">{item.duration}</div>
                        </div>
                      </div>
                      <div className="segment-price">{item.price} ₽</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="roundtrip-total">
            <div className="total-price">
              Итого: <b>{totalPrice} ₽</b>
              <div className="per-person">За человека</div>
            </div>

            <button
              className="choose-btn"
              onClick={handleBookRoundTrip}
              disabled={!selectedOut || !selectedRet}
            >
              Выбрать билет
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
