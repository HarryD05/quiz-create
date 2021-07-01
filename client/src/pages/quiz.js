//React dependencies 
import React, { useContext, useState } from 'react';

//Importing the contexts so current user data can be accessed and 
//modals used
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';

//Importing services so API calls can be made
import ResultService from '../services/ResultService';

//Importing styling
import './styling/index.scss';
import './styling/quiz.scss';

//Quiz taking page functional component
const Quiz = props => {
  //Setting up state
  //Screen state stores which screen is showing (initially the start screen)
  const [screenState, setScreenState] = useState('start');

  //Stores the details that will be used for completeAssignment API call
  const [resultsDetails, setResultsDetails] = useState({
    startTime: '', endTime: '', marks: 0, hints: [], answers: []
  });

  //Stores the current question number
  const [currentQuestion, setCurrentQuestion] = useState(0);

  //Stores the current answer to the question
  const [currentAnswer, setCurrentAnswer] = useState('');

  //Stores if the current question has been submitted
  const [submitted, setSubmitted] = useState(false);

  //Stores if this question's hint has been used
  const [hintUsed, setHintUsed] = useState(false);

  //Stores the multiple choice options in a shuffled array, if empty
  //either the options haven't been shuffled yet or short answer question
  const [options, setOptions] = useState([]);

  //Setting up the contexts
  const authContext = useContext(AuthContext);
  const modalContext = useContext(ModalContext);

  //If there is no current assignment, there is nothing to display
  if (authContext.assignment === null) {
    return <p>No content...</p>;
  }

  //Extracting assignment data from the current assignment
  const { _id, title, description, questions, recordTime } = authContext.assignment;

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
      setResultsDetails({
        ...resultsDetails,
        startTime: new Date()
      })
    }

    return <div id="welcome">
      <div id="quiz-header" className={screenState}>
        <p id="title">{title}</p>
        <p id="description">{description}</p>
      </div>

      <div id="quiz-details">
        <u>Details</u>
        <p>Questions: {questions.length}</p>
        <p>Marks: {getMarks()}</p>
        <p>{
          (recordTime === true ?
            'Your time taken is being recorded.' :
            'Your time taken isn\'t being recorded.'
          )}
        </p>

        <p id="footer">Press the home button at any time to return back to the student homepage,
          your answers won't be saved if you haven't submitted the assignment.</p>
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

      return (answer === correct.toLowerCase());
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
        let allOptions = [...wrong, correct];

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
          if (submitted && option === correct.toLowerCase() && option === currentAnswer) {
            baseClasses += ' correct'
          } else if (submitted && option !== correct.toLowerCase() && option === currentAnswer) {
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
      let totalMarks = resultsDetails.marks;
      if (isCorrect()) {
        totalMarks += marks;
      }

      //Updating the results details (adding this question's answer, the new total
      //marks and adding whether or not a hint was used this question)
      setResultsDetails({
        ...resultsDetails,
        answers: [...resultsDetails.answers, currentAnswer],
        marks: totalMarks,
        hints: [...resultsDetails.hints, hintUsed]
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
      if (completed) {
        //Cleaning data to be saved in database (completeAssignment API call)
        const resultInfo = {
          marks: resultsDetails.marks,
          answers: resultsDetails.answers.map(answer => {
            answer = answer.trim();
            answer = answer.toLowerCase();
            return answer;
          }),
          hints: resultsDetails.hints,
          assignment: _id
        }

        //Calculate seconds it took to complete assignment if time recorded 
        if (recordTime) {
          const seconds = Math.abs(new Date() - resultsDetails.startTime) / 1000;
          resultInfo.timeTaken = Math.round(seconds);
        }

        //Making the API call - completeAssignment
        try {
          //Send the API request and retrieve any data returned
          const resultData = await ResultService.completeAssignment(resultInfo, authContext.token);

          if (resultData) {
            //Redirect user back to homepage when assignment published
            props.history.push('/student/home');

            authContext.updateUser(); //Reloads the user data

            modalContext.updateModal({
              title: 'Success',
              content: <p>Result successfully saved.</p>
            })
          } else {
            modalContext.updateModal({
              title: 'Error',
              content: <p>There was an error saving your result to the database, please try again.</p>
            });
          }
        } catch (error) {
          modalContext.updateModal({
            title: 'Error',
            content: <p>There was an error saving your result, either press button again or go back to
              the homepage and complete the assignment again.</p>
          });

          throw error;
        }
      } else {
        //Next question - so resetting all values
        setHintUsed(false);
        setCurrentQuestion(currentQuestion + 1);
        setCurrentAnswer('');
        setOptions([]);
        setSubmitted(false); //closes footer
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
        <h3 id="title">{title}</h3>

        <div id="question-details">
          <p>Question: {currentQuestion + 1}/{questions.length}</p>
          <p>Marks: {resultsDetails.marks}/{getMarks()}</p>
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
