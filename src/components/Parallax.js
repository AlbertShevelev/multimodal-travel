import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Parallax.css';

const Parallax = () => {
  return (
    <div className='parallax'>
      <div className='parallax_text'>

        <h1>Твое путешествие начинается здесь</h1>
      </div>
      <div className='parallax_btns'>
        <button className='btn_transport'>
          Мультимодальные маршруты
        </button>
        <button className='btn_hotels'>
          Гостиницы
        </button>
      </div>
    </div>
  );
};

export default Parallax;