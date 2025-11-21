import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="nr-footer">
      <div className="nr-footer-top">
        <div className="nr-footer-brand">
          <img src="/images/logo.png" alt="NomadRoads" className="nr-footer-logo" />
          <span className="nr-footer-name">NomadRoads</span>
        </div>

        <div className="nr-footer-columns">
          <div className="nr-footer-column">
            <h4>Компания</h4>
            <a href="#">О нас</a>
            <a href="#">Контакты</a>
          </div>

          <div className="nr-footer-column">
            <h4>Помощь</h4>
            <a href="#">Справочная</a>
            <a href="#">Обратная связь</a>
          </div>
        </div>
      </div>

      <div className="nr-footer-bottom">
        © 2025 NomadRoads. Все права защищены.
      </div>
    </footer>
  );
};

export default Footer;
