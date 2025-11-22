import React, { useState } from "react";
import "../styles/BookingModal.css";

const BookingModal = ({ isOpen, onClose, onConfirm }) => {
  const [passenger, setPassenger] = useState({
    name: "",
    phone: "",
    email: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passenger.name || !passenger.phone || !passenger.email) {
      alert("Заполните все поля!");
      return;
    }
    onConfirm(passenger);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Введите данные пассажира</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            ФИО:
            <input
              type="text"
              value={passenger.name}
              onChange={(e) =>
                setPassenger({ ...passenger, name: e.target.value })
              }
              required
            />
          </label>

          <label>
            Телефон:
            <input
              type="tel"
              value={passenger.phone}
              onChange={(e) =>
                setPassenger({ ...passenger, phone: e.target.value })
              }
              required
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              value={passenger.email}
              onChange={(e) =>
                setPassenger({ ...passenger, email: e.target.value })
              }
              required
            />
          </label>

          <div className="modal-buttons">
            <button type="submit" className="confirm-btn">
              Забронировать
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
