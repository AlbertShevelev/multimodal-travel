import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="left">
        <a href="/"><img className="logo-img" src="/images/logo.png" alt='NomadRoads Logo'/></a>
        <h1 className="logo">NomadRoads</h1>
      </div> 
      <div className="right">
        <ul className="items">
          <li><a href="/search">Маршруты</a></li>
          <li><a href="/support">Поддержка</a></li>
          <li><a href="/driver">Путеводитель</a></li>
          <li><a href="/journal">Журнал</a></li>
        </ul>
        <button className="login-btn">Войти</button>
        <button className="signup-btn">Создать аккаунт</button>
      </div>
    </nav>
  );
};

export default Navbar;
