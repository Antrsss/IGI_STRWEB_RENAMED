import React from 'react';
import { AuthContext } from '../contexts/AuthContext';
import './Footer.css';

class Footer extends React.Component {
  static contextType = AuthContext;
  
  constructor(props) {
    super(props);
    this.state = {
      currentYear: new Date().getFullYear()
    };
  }
  
  componentDidMount() {
    console.log('Footer mounted');
  }
  
  componentWillUnmount() {
    console.log('Footer will unmount');
  }
  
  getCopyrightText() {
    const { user } = this.context;
    const baseText = `© ${this.state.currentYear} Zoo Management System. All rights reserved.`;
    
    if (user) {
      return `${baseText} | User: ${user.username || user.email}`;
    }
    
    return baseText;
  }
  
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