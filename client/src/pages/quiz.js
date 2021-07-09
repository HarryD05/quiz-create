//React dependencies 
import React, { useContext, useState } from 'react';

//Importing the contexts so current user data can be accessed and 
//modals used
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';

//Importing services so API calls can be made
import ResultService from '../services/ResultService';

//Importing reuseable components
import Timer from '../components/timer/timer';

//Importing styling
import './styling/index.scss';
import './styling/quiz.scss';

//Quiz taking page functional component
const Quiz = props => {
  //Setting up the contexts
  const authContext = useContext(AuthContext);
  const modalContext = useContext(ModalContext);

  //Setting up state
  //Stores information for displaying the timer
  const [timerInfo, setTimerInfo] = useState({});

  //Screen state stores which screen is showing (initially the start screen)
  const [screenState, setScreenState] = useState('start');

  //Stores the details that will be used for completeAssignment API call
  const [extraDetails, setExtraDetails] = useState({
    startTime: '', marks: 0, totalMarks: 0
  });

  //Stores the current question number - initialised using the index in the authContext 
  //which will be 0 if the assignment hasn't been started before or where the assignment
  //left off when only partially completed previously
  const [currentQuestion, setCurrentQuestion] = useState((authContext.assignment !== null) ?
    authContext.assignment.startingQuestion : 0
  );

  //Stores the current answer to the question
  const [currentAnswer, setCurrentAnswer] = useState('');

  //Stores if the current question has been submitted
  const [submitted, setSubmitted] = useState(false);

  //Stores if this question's hint has been used
  const [hintUsed, setHintUsed] = useState(false);

  //Stores the multiple choice options in a shuffled array, if empty
  //either the options haven't been shuffled yet or short answer question
  const [options, setOptions] = useState([]);

  //If there is no current assignment, there is nothing to display
  if (authContext.assignment === null) {
    return <p>No content...</p>;
  }

  //Extracting assignment data from the current assignment
  const { _id, title, description, questions, recordTime } = authContext.assignment.assignment;

  //Returns the number of marks available in the assignment
  const getMarks = () => {
    //Loops through the entire question array adding the number of marks per quesiton
    return questions.reduce((accumulator, q) => {
      return accumulator + q.marks
    }, 0);
  }

  //Renders the page the student will see before the quiz begins
  const renderWelcomePage = () => {
    //When the start button is pressed the screenState changes to the quiz page
    const handleStartClick = () => {
      setScreenState('quiz');

      //Saving the start time
      setExtraDetails({
        ...extraDetails,
        startTime: new Date()
      });

      //Only calling the timer to display if the assignment is recording the time
      if (authContext.assignment.assignment.recordTime) {
        let start = 0; //Default the timer to start at 0 seconds

        if (authContext.assignment.timeTaken !== undefined && authContext.assignment.timeTaken !== null) {
          start = authContext.assignment.timeTaken;
          //If the assignment has been started, start the timer where the student left off
        }

        //Defining the timer info
        setTimerInfo({
          firstCall: true,
          start
        });
      }
    }

    //If user not starting at question 1 (index 0) remind them
    const renderContinuingText = () => {
      //Getting the starting question and starting score
      const { startingQuestion, currentMarks } = authContext.assignment;

      if (startingQuestion !== 0) {
        return <li>You are starting at question {startingQuestion + 1},
          your current score is {currentMarks}/{getMarks()}.</li>
      }
    }

    return <div id="welcome">
      <div id="quiz-header" className={screenState}>
        <p id="title">{title}</p>
        <p id="description">{description}</p>
      </div>

      <div id="quiz-details">
        <u>Details</u>
        <ul>
          <li>Questions: {questions.length}</li>
          <li>Marks: {getMarks()}</li>
          <li>{
            (recordTime === true ?
              'Your time taken is being recorded.' :
              'Your time taken isn\'t being recorded.'
            )}
          </li>
          {renderContinuingText()}
        </ul>

        <p id="footer">Press the home button at any time to return back to the student homepage,
          if you have answered a question any answers will be saved.</p>
      </div>

      <div id="start-button">
        <button className="btn" onClick={handleStartClick}>Start</button>
      </div>
    </div>
  }

  //Renders the main quiz content (questions etc.)
  const renderQuizPage = () => {
    //Extracting the data from the current question
    const { question, marks, qtype, correct, wrong, explanation, hint, imageURL } = questions[currentQuestion];

    //Returns whether the current answer is correct or not
    const isCorrect = () => {
      let answer = currentAnswer.trim();
      answer = answer.toLowerCase();

      return (correct.indexOf(answer) !== -1);
    };

    //handles when an answer changes 
    const handleAnswerChange = e => {
      setCurrentAnswer(e.target.value);
    }

    //Renders the short answer text input
    const renderShort = () => {
      return <div id="short-answer">
        <div className="form-control">
          <input type="text" name="answer" autoComplete="off"
            onChange={handleAnswerChange} value={currentAnswer} required />
          <label htmlFor="answer">Answer</label>
        </div>
      </div>
    }

    //Renders the short answer text input
    const renderMultichoice = () => {
      //If options is equal to null they haven't been shuffled yet...
      if (options.length === 0) {
        //Put all options in an array
        let allOptions = [...wrong, correct[0]];

        allOptions = allOptions.map(option => option.toLowerCase());

        //Shuffle options so in random positions
        let counter = allOptions.length;

        // While there are elements in the array
        while (counter > 0) {
          // Pick a random index
          const index = Math.floor(Math.random() * counter);

          // Decrease counter by 1
          counter--;

          // And swap the last element with it
          const temp = allOptions[counter];
          allOptions[counter] = allOptions[index];
          allOptions[index] = temp;
        }

        setOptions(allOptions);
      }

      return <div id="multiple-choice">
        {options.map(option => {
          let baseClasses = 'btn option';

          //If the option button is the student's answer which has been submitted and 
          //is correct then make the button green
          if (submitted && correct.indexOf(option) !== -1 && option === currentAnswer) {
            baseClasses += ' correct'
          } else if (submitted && correct.indexOf(option) !== -1 && option === currentAnswer) {
            //If wrong make it red
            baseClasses += ' wrong'
          }

          //If the button is the selected option make it blue 
          //(and the answer isn't yet submitted)
          if (submitted === false && option === currentAnswer) {
            baseClasses += ' selected';
          }

          return <button
            key={option} className={baseClasses} value={option}
            onClick={handleAnswerChange}>{option.toLowerCase()}</button>
        })}
      </div>
    }

    //Returns the css classes for the footer
    const getClasses = submitted => {
      //if the answer isn't submitted just give submit class
      if (submitted === false) return 'submit';

      let classes = 'submitted';

      //Checking if the answer is correct
      if (isCorrect()) {
        classes += ' correct';
      } else {
        classes += ' wrong';
      }

      return classes;
    }

    //Handles submit question click - add answer to answers etc.
    const submitQuestion = e => {
      e.preventDefault();

      //if the answer is blank, modal to state must have answer
      if (currentAnswer.replaceAll(' ', '') === '') {
        modalContext.updateModal({
          title: 'Error',
          content: <p>You have left the answer blank, please answer the question.</p>
        })

        return;
      }

      //Sets submitted to true so submitted footer opens
      setSubmitted(true);

      //Adding the marks of the question to the total marks if corrrect answer
      let totalMarks = 0;
      if (isCorrect()) {
        totalMarks += marks;
      }

      //Updating the results details (adding this question's answer, the new total
      //marks and adding whether or not a hint was used this question)
      setExtraDetails({
        ...extraDetails,
        marks: totalMarks,
        totalMarks: totalMarks + extraDetails.totalMarks
      })
    }

    //Renders the submit question button
    const renderSubmit = () => {
      return <div id="footer" class="submit">
        <button className="btn" id="submit" onClick={submitQuestion}>Submit</button>
      </div>
    }

    //Handles on click of footer button (next question or complete assignment)
    const footerClicked = async completed => {
      //save current answer
      //Checking if the result needs to be updated or initiated
      //If the starting question wasn't 0 then the result just needs to be updated
      const initResult = (authContext.assignment.startingQuestion === 0 && currentQuestion === 0);

      const sanitiseAnswer = answer => {
        answer = answer.trim();
        answer = answer.toLowerCase();
        return answer;
      }

      //Cleaning data to be saved in database (completeAssignment API call)
      //Including completed being true as all questions answered
      const resultInfo = {
        initResult,
        completed,
        marks: extraDetails.marks,
        answers: [sanitiseAnswer(currentAnswer)],
        hints: [hintUsed],
        assignment: _id
      }

      //Calculate seconds it took to complete assignment if time recorded 
      if (recordTime) {
        const seconds = Math.abs(new Date() - extraDetails.startTime) / 1000;
        resultInfo.timeTaken = Math.round(seconds);
      }

      //Making the API call - completeAssignment
      try {
        //Send the API request and retrieve any data returned
        const resultData = await ResultService.completeAssignment(resultInfo, authContext.token);

        //Answer saved
        if (resultData) {
          authContext.updateUser(); //Reloads the user data

          if (completed) {
            //Redirect user back to homepage when assignment published
            props.history.push('/student/home');
          } else {
            //Next question - so resetting all values
            setHintUsed(false);
            setCurrentQuestion(currentQuestion + 1);
            setCurrentAnswer('');
            setOptions([]);
            //Resetting the details
            setExtraDetails({
              ...extraDetails,
              marks: 0,
              startTime: new Date()
            })
            setSubmitted(false); //closes footer
          }

          return;
        } else {
          modalContext.updateModal({
            title: 'Error',
            content: <p>There was an error saving your answer to the database, please try again.</p>
          });
        }
      } catch (error) {
        modalContext.updateModal({
          title: 'Error',
          content: <p>There was an error saving your answer, please try again.</p>
        });

        throw error;
      }
    }

    //Renders the footer that displays when the answer is submitted
    const renderSubmitted = () => {
      //Checking there are any more questions left
      const completed = (currentQuestion + 1 === questions.length);

      return <div id="footer" className={getClasses(submitted)}>
        <p>{isCorrect() ? 'Correct' : 'Incorrect'}</p>
        <p>{explanation}</p>
        <button className="btn" id="submit" onClick={() => footerClicked(completed)}>
          {completed ? 'Submit assignment' : 'Next question'}
        </button>
      </div>
    }

    //opens modal to show hint if are you sure confirmed
    const showHint = () => {
      //Setting that this question's hint has been used
      setHintUsed(true);

      modalContext.updateModal({
        title: 'Hint',
        content: <p>{hint}</p>
      })
    }

    //Called when hint button pressed
    const hintSure = () => {
      //Opening are you sure modal, if yes then openHint
      modalContext.updateModal({
        title: 'Show hint',
        content: <div id="sure">
          <p>Are you sure?</p>

          <div id="buttons">
            <button type="button" className="btn" onClick={showHint}>Yes</button>
            <button type="button" className="btn" onClick={() => modalContext.clearModal()}>No</button>
          </div>
        </div>
      })
    }

    return <div id="quiz-screen">
      <div id="quiz-header" className={screenState}>
        <div id="question-left">
          <h3 id="title">{title}</h3>
          {timerInfo.firstCall ? <Timer start={timerInfo.start} /> : null}
        </div>

        <div id="question-details">
          <p>Question: {currentQuestion + 1}/{questions.length}</p>
          <p>Marks: {extraDetails.totalMarks + authContext.assignment.currentMarks}/{getMarks()}</p>
        </div>
      </div>

      <div id="question">
        <b>{question} [{marks}]</b>
        {hint !== null && hint !== undefined ?
          <button className="btn" id="hint" onClick={hintSure}>See hint</button> :
          null
        }
        {imageURL !== null && imageURL !== undefined && imageURL.replaceAll(' ', '') !== '' ?
          <img src={imageURL} alt={'Unable to provide...'}></img> :
          null
        }
      </div>

      <div id="answer-space">
        {qtype === 'short' ? renderShort() : renderMultichoice()}
      </div>

      {submitted ? renderSubmitted() : renderSubmit()}
    </div>
  }

  //Renders the content of the current screenState
  const renderMain = () => {
    switch (screenState) {
      case 'start':
        return renderWelcomePage();

      case 'quiz':
        return renderQuizPage();

      default:
        return <p>No content...</p>
    }
  }

  return <div id="quiz">
    {renderMain()}
  </div>
}

export default Quiz;
//when quiz.js is imported in other files the
//Quiz functional component is what is accessed
