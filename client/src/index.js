//React dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
//BrowserRouter allows for the route functionality 
//where if the URL changes the page shown changes

//Components
import App from './app';
//the app component stores all the separate pages

//Styling
import './index.scss'; //the root styling for the website

ReactDOM.render(
  <BrowserRouter><App /></BrowserRouter>,
  document.getElementById('root')
); //this renders the app component to the website
