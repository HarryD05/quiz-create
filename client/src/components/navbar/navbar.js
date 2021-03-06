//React dependencies 
import React, { useContext, useState } from 'react';

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

  //whenever incremented the navbar rerenders (linked to the key)
  //attribute of the main element - so buttons change correctly
  const [key, setKey] = useState(0);
  //called whenver the url changes
  window.addEventListener('popstate', () => setKey(key + 1));

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

    //Showing the info text in a modal
    modalContext.updateModal(getInfoText(path));
  }

  const logoutButton = () => {
    authContext.logout();
  }

  const homeButton = () => {
    const path = window.location.href.split('#')[1];

    //Sends the user to the previous page (the homepage)
    if (path === '/teacher/create' || path === '/student/quiz') {
      window.history.back();
    }

    //Clear the current assignment 
    authContext.clearAssignment();
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

  //if the page isn't the authenitcation page or a homepage render a home button
  const renderHomeButton = () => {
    const path = window.location.href.split('#')[1];

    if (path === '/teacher/create' || path === '/student/quiz') {
      return (<button className="btn" id="home-btn" onClick={homeButton}>Home</button>);
      //button only displayed on quiz creation page
    }

    return (<button className="btn disabled" id="home-btn" onChange={homeButton}>Home</button>);
  }

  return (
    <div id="navbar" key={key}>
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
