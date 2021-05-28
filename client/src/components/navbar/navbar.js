//React dependencies 
import React, { useContext } from 'react';

//Function imports from external files
import getInfoText from './infoText';

//Image assets
import QuizLogoImg from '../../assets/QuizCreateLogo.png';

//Importing context
import { ModalContext } from './../../context/ModalContext';

//Import styling - imporing the .scss file imports the scss
//same as <link href="navbar.scss" rel="stylesheet">
import './navbar.scss';

//Navbar functional component
const Navbar = () => {
  const modalContext = useContext(ModalContext);

  //Function called when the info button is clicked
  const handleClick = () => {
    //Sorting out the info text
    //this returns the end of the url which just has the router path
    const path = window.location.href.split('#')[1];

    //temporarily this will be an alert, in the future there will be 
    //a dedicated compoenent for the info box
    modalContext.updateModal(getInfoText(path));
  }

  return (
    <div id="navbar">
      <img src={QuizLogoImg} alt="QuizCreate logo" />

      <button type="button" id="helpBtn" onClick={handleClick}>i</button>
    </div>
  );
}

export default Navbar;
//when navbar.js is imported in other files the
//Navbar functional component is what is accessed
