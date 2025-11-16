import React, { useState } from 'react';
import '../styles/BookingForm.css';

const BookingForm = ({ route }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Бронирование на маршрут ${route.origin} → ${route.destination} оформлено!`);
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h2>Оформить бронирование</h2>
      <div>
        <label htmlFor="name">Ваше имя:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите ваше имя"
        />
      </div>
      <div>
        <label htmlFor="email">Электронная почта:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Введите вашу почту"
        />
      </div>
      <button type="submit">Забронировать</button>
    </form>
  );
};

export default BookingForm;
