// src/components/layout/Footer.jsx
import React from 'react';
import { AuthContext } from '../contexts/AuthContext';
import './Footer.css';

class Footer extends React.Component {
  // 1. Определяем contextType для доступа к контексту
  static contextType = AuthContext;
  
  // 2. Конструктор (опционально)
  constructor(props) {
    super(props);
    this.state = {
      currentYear: new Date().getFullYear()
    };
  }
  
  // 3. Метод жизненного цикла (пример)
  componentDidMount() {
    console.log('Footer mounted');
  }
  
  // 4. Метод жизненного цикла (пример)
  componentWillUnmount() {
    console.log('Footer will unmount');
  }
  
  // 5. Пользовательский метод (пример)
  getCopyrightText() {
    const { user } = this.context;
    const baseText = `© ${this.state.currentYear} Zoo Management System. All rights reserved.`;
    
    if (user) {
      return `${baseText} | User: ${user.username || user.email}`;
    }
    
    return baseText;
  }
  
  // 6. Обязательный метод render()
  render() {
    const { user } = this.context;
    
    return (
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Zoo Management System</h3>
            <p className="footer-description">
              Modern system for managing zoo animals, employees, and enclosures
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            {this.getCopyrightText()}
          </p>
          <div className="system-info">
            <small>Version 2.0.0 {user && `| User: ${user?.username || user?.email}`}</small>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;