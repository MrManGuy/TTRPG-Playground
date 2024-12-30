import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './components/structural/App';
import { UserProvider } from './contexts/user';
import { CharacterProvider } from './contexts/character';

import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.scss';
import './sessions.scss';
import './characterCreation.scss';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider><CharacterProvider>
      <App />
      </CharacterProvider></UserProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
