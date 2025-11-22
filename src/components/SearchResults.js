import React, { useMemo, useState } from "react";
import "../styles/SearchResults.css";
import { bookTicket } from "../services/api";
import { bookRoundTrip } from "../services/api";
import BookingModal from "./BookingModal";

const transportIcons = {
  air: "✈️",
  bus: "🚌",
  train: "🚆",
  ship: "⛴️",
  taxi: "🚕",
};

//sdgregre
function normalizeTicket(t) {
  if (!t) return {};
  const fromStopKey =
    t.fromStopKey || t.ПунктОтправления_Key || t.fromStop?.Ref_Key;

  const toStopKey =
    t.toStopKey || t.ПунктНазначения_Key || t.toStop?.Ref_Key;

  const scheduleKey =
    t.scheduleKey ||
    t.Рейс_Key ||
    t.РейсРасписания_Key ||
    t.Ref_Key;

  const departureDateTime =
    t.departureDateTime || t.ВремяОтправления || t.DepartureDateTime;

  const arrivalDateTime =
    t.arrivalDateTime || t.ВремяПрибытия || t.ArrivalDateTime;

  const priceRaw = t.price ?? t.Price ?? t.Тариф;
  const price = priceRaw == null ? null : Number(priceRaw);

  return {
    ...t,

    fromStopKey,
    toStopKey,
    scheduleKey,
    departureDateTime,
    arrivalDateTime,
    price,

    routeName: t.routeName || t.routename || t.Description || "Рейс",
    transport: t.transport || "bus",
    departureTime: t.departureTime || (departureDateTime ? departureDateTime.slice(11,16) : ""),
    arrivalTime: t.arrivalTime || (arrivalDateTime ? arrivalDateTime.slice(11,16) : ""),
    duration: t.duration || t.ВремяВПутиПредставление || "",
    from: t.from || "",
    to: t.to || "",
  };
}

const SegmentCard = ({ item, selected, onClick, compact = false }) => {
  return (
    <div
      className={`segment-card ${compact ? "compact" : ""} ${
        selected ? "selected" : ""
      }`}
      onClick={onClick}
    >
      <div className="seg-left">
        <div className="seg-icon">
          {transportIcons[item.transport] || "🚌"}
        </div>
        <div className="seg-meta">
          <div className="seg-company">{item.companyName}</div>
          <div className="seg-code">
            {item.transport === "train" ? "Поезд" : "Рейс"} {item.code || ""}
          </div>
        </div>
      </div>

      <div className="seg-middle">
        <div className="seg-times">
          <div className="seg-time">
            {item.departureTime}
            <div className="seg-city">{item.from}</div>
          </div>

          <div className="seg-line">
            <div className="seg-duration">
              ⏱ {item.duration || "—"}
            </div>
            <div className="seg-track" />
            <div className="seg-badge">Прямой</div>
          </div>

          <div className="seg-time">
            {item.arrivalTime}
            <div className="seg-city">{item.to}</div>
          </div>
        </div>
      </div>

      <div className="seg-right">
        <div className="seg-price">{item.price} ₽</div>
        <div className="seg-per">За человека</div>
        {!compact && <div className="seg-cta">Выбрать</div>}
      </div>
    </div>
  );
};

const SearchResults = ({ results }) => {
  const safeResults = Array.isArray(results) ? results : [];
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [pendingRoundTrip, setPendingRoundTrip] = useState(null);

  const isRoundTrip =
    results &&
    !Array.isArray(results) &&
    Array.isArray(results.outbound) &&
    Array.isArray(results.return);

  const outboundList = useMemo(() => {
    const arr = isRoundTrip ? results.outbound : (results || []);
    return (Array.isArray(arr) ? arr : []).map(normalizeTicket);
  }, [results, isRoundTrip]);

  const returnList = useMemo(() => {
    if (!isRoundTrip) return [];
    return (results.return || []).map(normalizeTicket);
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
    });

    try {
      const res = await bookRoundTrip({
        outbound: makePayload(selectedOut),
        inbound: makePayload(selectedRet),
        passenger,
      });

      alert(
        `Бронь туда-обратно создана!\n` +
        `Туда: ${res.outboundOrder?.Ref_Key || "OK"}\n` +
        `Обратно: ${res.inboundOrder?.Ref_Key || "OK"}`
      );
    } catch (err) {
      console.error("ROUNDTRIP BOOK ERROR:", err);
      alert(
        "Ошибка бронирования: " +
        (err.details?.message?.value ||
          err.details ||
          err.message ||
          "")
      );
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
      {/* ONE WAY */}
      {!isRoundTrip &&
        outboundList.map((item, idx) => (
          <div key={idx} className="ticket-card">
            <SegmentCard item={item} />
            <button
              className="choose-btn big"
              onClick={() => handleBookOneWay(item)}
            >
              Выбрать билет
            </button>
          </div>
        ))}

      {/* ROUND TRIP */}
      {isRoundTrip && (
        <div className="ticket-card roundtrip-card nice">
          <div className="rt-block">
            <div className="rt-title">Туда</div>
            <div className="rt-list">
              {outboundList.map((item, idx) => (
                <SegmentCard
                  key={idx}
                  item={item}
                  compact
                  selected={idx === selectedOutIdx}
                  onClick={() => setSelectedOutIdx(idx)}
                />
              ))}
            </div>
          </div>

          <div className="rt-divider" />

          <div className="rt-block">
            <div className="rt-title">Обратно</div>
            <div className="rt-list">
              {returnList.length === 0 ? (
                <div className="no-returns">Обратных рейсов нет</div>
              ) : (
                returnList.map((item, idx) => (
                  <SegmentCard
                    key={idx}
                    item={item}
                    compact
                    selected={idx === selectedRetIdx}
                    onClick={() => setSelectedRetIdx(idx)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="roundtrip-total nice">
            <div>
              <div className="total-label">Итого</div>
              <div className="total-price">{totalPrice} ₽</div>
              <div className="per-person">За человека</div>
            </div>

            <button
              className="choose-btn big"
              onClick={() => {
                if (!selectedOut || !selectedRet) {
                  alert("Выберите оба направления!");
                  return;
                }
                setPendingRoundTrip({ outbound: selectedOut, inbound: selectedRet });
                setBookingModalOpen(true);
              }}
              disabled={!selectedOut || !selectedRet}
            >
              Выбрать билет
            </button>
          </div>
        </div>
      )}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onConfirm={async (passenger) => {
          try {
            await bookRoundTrip({
              outbound: pendingRoundTrip.outbound,
              inbound: pendingRoundTrip.inbound,
              passenger,
            });
            alert("Бронирование успешно!");
          } catch (err) {
            console.error("ROUNDTRIP BOOK ERROR:", err);
            alert("Ошибка бронирования: " + err.message);
          } finally {
            setBookingModalOpen(false);
          }
        }}
      />

    </div>
  );
};

export default SearchResults;
