//React dependencies 
import React from 'react';

//Image assets
import QuizLogoImg from '../../assets/QuizCreateLogo.png';

//Import styling - imporing the .scss file imports the scss
//same as <link href="navbar.scss" rel="stylesheet">
import './navbar.scss';

//Navbar functional component
const Navbar = () => {
  return (
    <div id="navbar">
      <img src={QuizLogoImg} alt="QuizCreate logo" />
    </div>
  );
}

export default Navbar;
//when navbar.js is imported in other files the
//Navbar functional component is what is accessed
