//React dependencies 
import React, { useState, useContext, useEffect } from 'react';

//Importing contexts and services
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';
import QuestionService from '../services/QuestionService';

//Importing styling
import './pages.scss';

//Quiz creation functional component
const QuizCreation = props => {
  //Setting up state
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);

  useEffect(() => {
    async function fetchQuestions() {
      const questions = await QuestionService.questions();

      if (questions === null) {
        setAllQuestions([]);
        return;
      }

      setAllQuestions(questions);
    }

    fetchQuestions();
  }, [])

  //Setting up the authcontext to get the selected class
  //data so the assignment can be saved with the correct class
  const authContext = useContext(AuthContext);

  //Setting up the modalcontext so modals can be used
  const modalContext = useContext(ModalContext);

  //Returns the class name in a descriptive format
  const getClassName = () => {
    const currentClass = authContext.selectedClass;

    return `${currentClass.name} (${currentClass.qualification} ${currentClass.subject})`;
  }

  const returnQuestionType = question => {
    return question.qtype === 'short' ? 'Short answer' : 'Multiple choice';
  }

  //Returns all questions in the card format
  const returnQuestionCards = async filterWord => {
    //If there are no questions in the database, return 
    //some 'placeholder text'
    if (allQuestions.length === 0) {
      return <p>No questions yet...</p>
    }

    //onClick handler for question card in add question from bank modal
    function addQuestion(question) {
      //Adds question to question list
      setCurrentQuestions([...currentQuestions, { ...question }]);

      //Closes modal
      modalContext.clearModal();
    }

    let questions = [];
    if (filterWord === null) questions = [...allQuestions];
    else {
      questions = [...allQuestions].filter(question => question.question.search(filterWord) !== -1);
    }

    //Return all questions in the database as a card
    return questions.map(question => {
      let classes = `bank-question-card ${question.qtype}`;

      return <button type="button" className={classes} key={question._id} onClick={addQuestion.bind(this, question)}>
        <h3>{question.question}</h3>

        <p><b>Type:</b> {returnQuestionType(question)}</p>
        <p><b>Answer:</b> {question.correct}</p>
        <p><b>Marks:</b> {question.marks}</p>
        <p><b>Explanation:</b> {question.explanation}</p>
        <p><b>Hint:</b> {question.hint === null ? 'No hint' : question.hint}</p>
      </button>
    })
  }

  //Will change the questions shown in the bank modal to only be questions
  //including the searched word
  async function handleSearchChange(e) {
    const questionHTML = await returnQuestionCards(e.target.value);

    modalContext.updateModal({
      title: 'Add question from bank',
      content: <div id="question-bank">
        <div id="bank-header">
          <h3>{authContext.selectedClass.subject} questions</h3>

          <input placeholder="Search..." onChange={handleSearchChange.bind(this)}></input>
        </div>

        <div id="bank-questions">
          {questionHTML}
        </div>
      </div>
    })
  }

  //Opens the add question from bank modal
  const openQuestionBankModal = async () => {
    const questionHTML = await returnQuestionCards();

    modalContext.updateModal({
      title: 'Add question from bank',
      content: <div id="question-bank">
        <div id="bank-header">
          <h3>{authContext.selectedClass.subject} questions</h3>

          <input placeholder="Search..." onChange={handleSearchChange.bind(this)}></input>
        </div>

        <div id="bank-questions">
          {questionHTML}
        </div>
      </div>
    })
  }

  //Returns the number of current questions
  const returnQuestionCount = () => {
    if (currentQuestions.length === 0) return 'No questions yet...';

    return currentQuestions.length;
  }

  //Returns the total marks of all the current questions
  const returnTotalMarks = () => {
    if (currentQuestions.length === 0) return 'No questions yet...';

    return currentQuestions.reduce((accumulator, current) => {
      return accumulator + current.marks;
    }, 0);
  }

  //onclick handler for the question cards, removes card from current questions list
  function removeQuestion(clickedIndex) {
    const questions = [...currentQuestions];
    questions.splice(clickedIndex, 1);

    setCurrentQuestions(questions);
  }

  //Returns all the current questions as cards
  const returnQuestions = () => {
    if (currentQuestions.length === 0) return <p>No questions yet...</p>;

    return currentQuestions.map((question, index) => {
      let classes = `question-card ${question.qtype}`;

      return <button type="button" className={classes} key={index}
        onClick={removeQuestion.bind(this, index)}>
        <p><b>({index + 1})</b> {question.question}</p>

        <p><b>Type:</b> {returnQuestionType(question)}</p>
        <p><b>Answer:</b> {question.correct}</p>
        <p><b>Marks:</b> {question.marks}</p>
      </button>
    })
  }

  return (
    <div id="quiz-creation" >
      <h2>Create new assignment</h2>

      <form id="assignment-form" onSubmit={() => alert('not setup yet')}>
        <div id="assignment-details">

          <div id="left" className="side">
            <div className="form-control">
              <input type="text" name="title" autoComplete="off" required />
              <label htmlFor="title">Title</label>
            </div>

            <div className="form-control text-area">
              <textarea type="text" name="description" autoComplete="off" required />
              <label htmlFor="description">Description</label>
            </div>

            <div className="form-control">
              <input type="text" name="topic" autoComplete="off" required />
              <label htmlFor="topic">Topic</label>
            </div>
          </div>

          <div id="right" className="side">
            <table>
              <tbody>
                <tr>
                  <td>Selected class</td>
                  <td>{getClassName()}</td>
                </tr>
                <tr>
                  <td>Questions</td>
                  <td>{returnQuestionCount()}</td>
                </tr>
                <tr>
                  <td>Total marks</td>
                  <td>{returnTotalMarks()}</td>
                </tr>
              </tbody>
            </table>

            <div id="question-buttons">
              <button className="btn" type="button" onClick={openQuestionBankModal}>Add question from bank</button>
              <button className="btn" type="button" onClick={() => alert('not setup yet')}>Create and add new question</button>
            </div>
          </div>
        </div>

        <div id="all-questions">
          <div id="all-questions-header">
            <h3>Current questions</h3>
            <button className="btn" type="submit">Publish assignment</button>
          </div>

          <div id="current-questions">
            {returnQuestions()}
          </div>
        </div>
      </form>
    </div>
  )
}

export default QuizCreation;
//when quiz_creation.js is imported in other files the
//QuizCreation functional component is what is accessed
