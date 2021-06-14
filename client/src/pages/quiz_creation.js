//React dependencies 
import React from 'react';

//Quiz creation functional component
const QuizCreation = props => {
  return (
    <div id="quiz-creation">
      <h2>Quiz creation page</h2>
      <p>This page with have the quiz creation UI</p>

      {alert('This is the quiz creation page, this hasn\'t been developed yet, if you press the home button at the top left of the page you will be redirected back to the homepage')}
    </div>
  );
}

export default QuizCreation;
//when quiz_creation.js is imported in other files the
//QuizCreation functional component is what is accessed
