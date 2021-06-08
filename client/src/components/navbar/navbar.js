//React dependencies 
import React, { useContext, useState, useCallback } from 'react';

//Function imports from external files
import getInfoText from './infoText';

//Image assets
import QuizLogoImg from '../../assets/QuizCreateLogo.png';
import QuizLogoSmallImg from '../../assets/QuizCreateLogoSmall.png';

//Importing context
import { ModalContext } from './../../context/ModalContext';
import { AuthContext } from './../../context/AuthContext';

//Import styling - imporing the .scss file imports the scss
//same as <link href="navbar.scss" rel="stylesheet">
import './navbar.scss';

//Navbar functional component
const Navbar = () => {
  //Logo made small if small width or large if can fit
  const checkLogoSize = () => {
    return (window.visualViewport.width < 475);
  }

  //Setting up context
  const modalContext = useContext(ModalContext);
  const authContext = useContext(AuthContext);

  //Setting up state
  const [isSmallLogo, setIsSmallLogo] = useState(checkLogoSize);

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  //used to force re-render of navbar, as otherwise buttons in navbar
  //don't display correctly when page swaps (e.g. logout on auth page)

  //function called whenever screen is resized to check if 
  //logo needs to change size
  const onResize = () => {
    setIsSmallLogo(checkLogoSize);
  }

  //makes the resize function call when the screen is resized
  window.addEventListener('resize', onResize);

  //Function called when the info button is clicked
  const handleInfoClick = () => {
    //Sorting out the info text
    //this returns the end of the url which just has the router path
    const path = window.location.href.split('#')[1];

    //temporarily this will be an alert, in the future there will be 
    //a dedicated compoenent for the info box
    modalContext.updateModal(getInfoText(path));
  }

  const logoutButton = () => {
    authContext.logout();
    setTimeout(forceUpdate, 1);
  }

  const homeButton = () => {
    const path = window.location.href.split('#')[1];

    if (path === '/teacher/create') {
      window.history.back();
    } else if (path === '/student/quiz') {
      window.history.back();
    }

    setTimeout(forceUpdate, 10);
  }

  //if the page isn't the authenitcation page, render a logout button
  const renderLogoutButton = () => {
    const path = window.location.href.split('#')[1];

    if (path === '/auth') {
      return (<button className="btn disabled" id="logout-btn" onClick={logoutButton}>Logout</button>);
      //button not displayed if authentication page
    }

    return (<button className="btn" id="logout-btn" onClick={logoutButton}>Logout</button>);
  }

  //if the page isn't the authenitcation page or a homepage 
  //render a home button
  const renderHomeButton = () => {
    const path = window.location.href.split('#')[1];

    if (path === '/auth' || path === '/teacher/home' || path === '/student/home') {
      return (<button className="btn disabled" id="home-btn" onChange={homeButton}>Home</button>);
      //button not displayed if authentication page or a homepage
    }

    return (<button className="btn" id="home-btn" onClick={homeButton}>Home</button>);
  }

  return (
    <div id="navbar">
      <div id="main">
        {renderHomeButton()}
        <img src={(isSmallLogo ? QuizLogoSmallImg : QuizLogoImg)} alt="QuizCreate logo" />
        {renderLogoutButton()}
      </div>

      <div id="overlay">
        <button type="button" id="helpBtn" onClick={handleInfoClick}>i</button>
      </div>
    </div>
  );
}

export default Navbar;
//when navbar.js is imported in other files the
//Navbar functional component is what is accessed
