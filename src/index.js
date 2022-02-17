import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

window.onload = async function initialize() {
    ReactDOM.render(
        <App />, 
        document.getElementById('root'));
}
