//React dependencies 
import React, { useContext } from 'react';

//Importing the contexts so current user data can be accessed and 
//modals used
import { AuthContext } from '../context/AuthContext';

//Importing styling
import './styling/index.scss';
import './styling/quiz.scss';

//Quiz taking page functional component
const Quiz = props => {
  //Setting up the contexts
  const authContext = useContext(AuthContext);

  const renderMainContent = () => {
    return <div id="quiz">
      <h1>{authContext.assignment.title}</h1>
      <i>{authContext.assignment.description}</i>

      <p style={{ marginTop: '2rem' }}>This page isn't ready yet, please press the home button to return to the student homepage</p>
    </div>
  }

  return (authContext.assignment === null ? null : renderMainContent())
}

export default Quiz;
//when quiz.js is imported in other files the
//Quiz functional component is what is accessed
