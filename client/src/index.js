//React dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
//HashRouter allows for the route functionality 
//where if the URL changes the page shown changes

//Components
import App from './app';
//the app component stores all the separate pages

//Context
import AuthProvider from './context/AuthContext';
import ModalProvider from './context/ModalContext';

//Styling
import './index.scss'; //the root styling for the website

ReactDOM.render(
  <AuthProvider><ModalProvider>
    <Router><App /></Router>
  </ModalProvider></AuthProvider >,
  document.getElementById('root')
); //this renders the app component to the website
