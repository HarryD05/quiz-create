//React dependencies
import React from 'react';
import ReactDOM from 'react-dom';

//Components
import App from './app';
//the app component stores all the separate pages

//Styling
import './index.scss'; //the root styling for the website

ReactDOM.render(
  <App />,
  document.getElementById('root')
); //this renders the app component to the website
