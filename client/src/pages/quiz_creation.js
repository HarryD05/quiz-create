//React dependencies 
import React, { useState, useContext, useEffect } from 'react';
import Select from 'react-select';

//Importing contexts and services
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';
import AssignmentService from '../services/AssignmentService';
import QuestionService from '../services/QuestionService';

//Importing styling
import './styling/index.scss';
import './styling/quizcreation.scss';

//Quiz creation functional component
const QuizCreation = props => {
  //Setting up state
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [newQuestionInput, setNewQuestionInput] = useState({
    question: '', imageURL: '', topic: '', hint: '', explanation: '', qtype: '', option1: '', option2: '', option3: '', option4: '', correct: '', marks: ''
  });
  const [newAssignmentInput, setNewAssignmentInput] = useState({
    title: '', description: '', recordTime: false, dueDate: '', expectedHigh: 0, expectedMid: 0, expectedLow: 0
  });
  const [createQuestionFormShowing, setCreateQuestionFormShowing] = useState(false);
  const [expectedShowing, setExpectedShowing] = useState(false);

  //Setting up the authcontext to get the selected class
  //data so the assignment can be saved with the correct class
  const authContext = useContext(AuthContext);

  //Setting up the modalcontext so modals can be used
  const modalContext = useContext(ModalContext);

  //Fetches all questions from the database 
  const fetchQuestions = async () => {
    const questions = await QuestionService.questions();

    if (questions === null) {
      setAllQuestions([]);
      return;
    }

    //Returns all the questions of the same subject of the selected class
    setAllQuestions(questions.filter(question => {
      return question.subject === authContext.selectedClass.subject
    }));
  }

  //This function is called once when the component first loads, to get all
  //the questions meaning the component isn't constantly making api calls (slow)
  useEffect(() => {
    fetchQuestions();
    //eslint-disable-next-line
  }, []);

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

    let questions = []; //Array will hold the questions to output

    if (filterWord === null || filterWord === undefined) {
      questions = [...allQuestions];
    } else {
      questions = [...allQuestions].filter(question => {
        //Putting filter word into a case insensitive regular expression
        //So when searching matching case isn't required
        let filter = new RegExp(`${filterWord.trim()}`, 'i');

        let found = false;

        //Checking all data about the question for the filterword 
        if (question.question.search(filter) !== -1) found = true;
        else if (question.correct[0].search(filter) !== -1) found = true;
        else if (question.explanation.search(filter) !== -1) found = true;
        else if (question.hint) {
          if (question.hint.search(filter) !== -1) found = true;
        }
        else if (question.topic.search(filter) !== -1) found = true;

        return found;
      });
    }

    //Checking if no questions found, if not then display this instead of 
    //having a blank space 
    if (questions.length === 0) {
      return <p>No questions include the phrase "{filterWord}"</p>
    }

    //Return all questions in the database as a card
    return questions.map(question => {
      let classes = `bank-question-card ${question.qtype}`;

      return <button type="button" className={classes} key={question._id} onClick={addQuestion.bind(this, question)}>
        <h3>{question.question}</h3>

        <p><b>Type:</b> {returnQuestionType(question)}</p>
        <p><b>Topic:</b> {question.topic}</p>
        <p><b>Answer(s):</b> {question.correct.join(' or ')}</p>
        <p><b>Marks:</b> {question.marks}</p>
        <p><b>Explanation:</b> {question.explanation}</p>
        <p><b>Hint:</b> {question.hint === null || question.hint.replaceAll(' ', '') === '' ? 'No hint' : question.hint}</p>
        <p><b>Image:</b> {
          question.imageURL === null || question.imageURL.replaceAll(' ', '') === '' ?
            'No image' :
            <>
              <img src={question.imageURL} alt={question.question + ' image'}></img>
              <p id="image-text">Hover to see...</p>
            </>
        }</p>
        <i>Created by {question.creator.username}</i>
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
  const returnTotalMarks = (number = false) => {
    //If no questions then total marks is 0
    if (currentQuestions.length === 0) {
      //If the number parameter is set to true not false,
      //then a number is always returns 
      if (number) return 0;

      return 'No questions yet...';
    }

    return currentQuestions.reduce((accumulator, current) => {
      return accumulator + current.marks;
    }, 0);
  }

  //onclick handler for the question cards, removes card from current questions list
  function removeQuestion(clickedIndex) {
    const questions = [...currentQuestions];
    questions.splice(clickedIndex, 1);

    setCurrentQuestions(questions);

    //When a question in removed reset the expected results to 0 as the expected results
    //may now be higher than the total marks
    setNewAssignmentInput(
      { ...newAssignmentInput, expectedHigh: 0, expectedMid: 0, expectedLow: 0 }
    );
  }

  //Returns all the current questions as cards
  const returnQuestions = () => {
    if (currentQuestions.length === 0) return <p>No questions yet...</p>;

    return currentQuestions.map((question, index) => {
      let classes = `question-card ${question.qtype}`;

      return <button type="button" className={classes} key={index}
        onClick={removeQuestion.bind(this, index)}>
        <p><b>({index + 1})</b> {question.question}</p>
        <p><b>Image:</b> {
          question.imageURL === null || question.imageURL.replaceAll(' ', '') === '' ?
            'No image' :
            <>
              <img src={question.imageURL} alt={question.question + ' image'}></img>
              <p id="image-text">Hover to see...</p>
            </>
        }</p>
        <p><b>Type:</b> {returnQuestionType(question)}</p>
        <p><b>Topic:</b> {question.topic}</p>
        <p><b>Answer(s):</b> {question.correct.join(' or ')}</p>
        <p><b>Marks:</b> {question.marks}</p>
      </button>
    })
  }

  //Onsbumit function for when the new question is submitted
  const createQuestion = async e => {
    e.preventDefault();

    const toTitleCase = text => {
      return text[0].toUpperCase() + text.slice(1).toLowerCase();
    }

    try {
      const { question, imageURL, topic, hint, explanation, marks } = newQuestionInput;

      let correct = newQuestionInput.correct;
      let wrong = [];

      if (newQuestionInput.qtype === 'Multiple choice') {
        const { option1, option2, option3, option4 } = newQuestionInput;
        wrong = [option1.trim(), option2.trim(), option3.trim(), option4.trim()];

        const correctIndex = newQuestionInput.correct.split(' ')[1] - 1;
        correct = [wrong[correctIndex].toLowerCase()];
        wrong.splice(correctIndex, 1);
      } else {
        //If the question is a short answer question split correct by semi colons
        correct = newQuestionInput.correct.split(';');
        correct = correct.map(text => {
          let cleaned = text.trim();
          cleaned = cleaned.toLowerCase();
          return cleaned;
        });
      }

      const newQuestion = await QuestionService.createQuestion({
        question: question.trim(),
        imageURL: imageURL.trim(),
        qualification: authContext.selectedClass.qualification.toUpperCase().trim(),
        subject: toTitleCase(authContext.selectedClass.subject).trim(),
        qtype: (newQuestionInput.qtype === 'Short answer' ? 'short' : 'multichoice'),
        topic: toTitleCase(topic).trim(),
        hint: hint.trim(),
        explanation: explanation.trim(),
        correct,
        wrong,
        marks: Number(marks),
      }, authContext.token);

      if (newQuestion) {
        //Add question to curent questions
        setCurrentQuestions([...currentQuestions, newQuestion]);

        //Reseting the new question form
        setNewQuestionInput({
          question: '', imageURL: '', topic: '', hint: '', explanation: '', qtype: '', option1: '',
          option2: '', option3: '', option4: '', correct: '', marks: ''
        });

        //Returning to the main quiz creation page
        setCreateQuestionFormShowing(false);

        //Refetching all the questions to update the question bank to include the new question
        await fetchQuestions();
      } else {
        modalContext.updateModal({
          title: 'Error',
          content: <p>There was an error saving your question to the database, please try again.</p>
        });
      }

    } catch (error) {
      modalContext.updateModal({
        title: 'Error',
        content: <p>The question wasn't saved to the database, please try again.</p>
      });

      throw error;
    }
  }

  const handleQuestionChange = (e, dropdownName = null) => {
    if (dropdownName === null) {
      setNewQuestionInput({ ...newQuestionInput, [e.target.name]: e.target.value });
    } else {
      setNewQuestionInput({ ...newQuestionInput, [dropdownName]: e.label });
    }
  }

  const handleAssignmentChange = e => {
    setNewAssignmentInput({ ...newAssignmentInput, [e.target.name]: e.target.value });
  }

  const handleCheckboxChange = e => {
    setNewAssignmentInput({ ...newAssignmentInput, [e.target.name]: e.target.checked });
  }

  const questionTypeOptions = [
    { label: 'Short answer', value: 0 },
    { label: 'Multiple choice', value: 1 }
  ];

  const correctOptions = [
    { label: 'Option 1', value: 0 },
    { label: 'Option 2', value: 1 },
    { label: 'Option 3', value: 2 },
    { label: 'Option 4', value: 3 }
  ];

  const renderAnswerInput = type => {
    if (type === 'Short answer') {
      return <div id="short-answer">
        <i>If you want multiple correct answers separate by semi-colons e.g. earthquake; an earthquake</i>

        <div className="form-control">
          <input type="text" name="correct" autoComplete="off" value={newQuestionInput.correct} onChange={handleQuestionChange} required />
          <label htmlFor="correct">Answer</label>
        </div>
      </div>
    } else if (type === 'Multiple choice') {
      return <div id="multichoice">
        <p>Leave option blank if not needed.</p>

        <div className="form-control">
          <input type="text" name="option1" autoComplete="off" value={newQuestionInput.option1} onChange={handleQuestionChange} required />
          <label htmlFor="option1">Option 1</label>
        </div>
        <div className="form-control">
          <input type="text" name="option2" autoComplete="off" value={newQuestionInput.option2} onChange={handleQuestionChange} required />
          <label htmlFor="option2">Option 2</label>
        </div>
        <div className="form-control">
          <input type="text" name="option3" autoComplete="off" value={newQuestionInput.option3} onChange={handleQuestionChange} required />
          <label htmlFor="option3">Option 3</label>
        </div>
        <div className="form-control">
          <input type="text" name="option4" autoComplete="off" value={newQuestionInput.option4} onChange={handleQuestionChange} required />
          <label htmlFor="option4">Option 4</label>
        </div>

        <Select className="select" options={correctOptions} placeholder="Select correct answer..." form={newQuestionInput.correct} onChange={e => handleQuestionChange(e, 'correct')} />
      </div>
    }
  }

  const renderQuestionForm = () => {
    return (
      <div id="question-creation-page">
        <div id="create-question-header">
          <h3>Create new question</h3>
          <button className="btn" type="button" onClick={() => setCreateQuestionFormShowing(false)}>Back</button>
        </div>

        <form id="create-question-details" onSubmit={createQuestion}>
          <div className="form-control">
            <input type="text" name="question" autoComplete="off" value={newQuestionInput.question} onChange={handleQuestionChange} required />
            <label htmlFor="question">Question</label>
          </div>

          <div className="form-control nonrequired">
            <input type="url" name="imageURL" autoComplete="off" value={newQuestionInput.imageURL} onChange={handleQuestionChange} />
            <label htmlFor="imageURL">Image URL</label>
          </div>

          <div className="form-control">
            <input type="text" name="topic" autoComplete="off" value={newQuestionInput.topic} onChange={handleQuestionChange} required />
            <label htmlFor="topic">Topic</label>
          </div>

          <div className="form-control">
            <input type="text" inputMode="numeric" name="marks" autoComplete="off" value={newQuestionInput.marks} onChange={handleQuestionChange} required />
            <label htmlFor="marks">Marks</label>
          </div>

          <div className="form-control text-area">
            <textarea type="text" name="hint" autoComplete="off" value={newQuestionInput.hint} onChange={handleQuestionChange} />
            <label htmlFor="hint">Hint</label>
          </div>

          <div className="form-control text-area">
            <textarea type="text" name="explanation" autoComplete="off" value={newQuestionInput.explanation} onChange={handleQuestionChange} required />
            <label htmlFor="explanation">Explanation</label>
          </div>

          <Select className="select" options={questionTypeOptions} placeholder="Select question type..." form={newQuestionInput.qtype} onChange={e => handleQuestionChange(e, 'qtype')} />

          {renderAnswerInput(newQuestionInput.qtype)}

          <button id="submit-button" type="submit" className="btn">Add question</button>
        </form >
      </div>
    )
  }

  //Onsubmit function for assignment form, create assignment
  const publishAssignment = async e => {
    //stops the page reloading when the button is pressed
    e.preventDefault();

    //Showing error if no questions as assignment can't have 0 questions
    if (currentQuestions.length === 0) {
      modalContext.updateModal({
        title: 'Error',
        content: <p>Make sure you have questions in your assignment</p>
      });

      return; //stops the api call
    }

    //Handling expected results
    let expectedResults = []; //Default case, if expected results not specified
    //then the expected results array is left empty

    //Extracting the expected results from the user input
    let { expectedHigh, expectedMid, expectedLow } = newAssignmentInput;

    //Casting marks to numbers instead of strings so stored in database as numbers
    expectedHigh = Number(expectedHigh);
    expectedMid = Number(expectedMid);
    expectedLow = Number(expectedLow);

    if (expectedHigh !== 0 && expectedMid !== 0 && expectedLow !== 0) {
      //If all the expected results have a value above 0 (have been specified)
      //Then format them to be submitted to the assignment api call
      expectedResults = [expectedLow, expectedMid, expectedHigh];
    }

    //Getting a date string which is just the date with the time set to 00:00:00 with no timezone offset
    const dateString = new Date(newAssignmentInput.dueDate).toLocaleDateString();
    const dateParts = dateString.split('/');
    const dateValue = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]} 00:00:00 GMT+0000`);

    //Clean assignment data so it can be sent in the API call
    const assignmentData = {
      title: newAssignmentInput.title.trim(),
      description: newAssignmentInput.description.trim(),
      dueDate: dateValue,
      maxMarks: returnTotalMarks(),
      recordTime: newAssignmentInput.recordTime,
      questions: currentQuestions.map(question => question._id),
      classID: authContext.selectedClass._id,
      expectedResults
    }

    try {
      //Send the API request and retrieve any data returned
      const assignmentResult = await AssignmentService.createAssignment(assignmentData, authContext.token);

      if (assignmentResult) {
        //Redirect user back to homepage when assignment published
        props.history.push('/teacher/home');

        modalContext.updateModal({
          title: 'Success',
          content: <p>Assignment successfully published.</p>
        })
      } else {
        modalContext.updateModal({
          title: 'Error',
          content: <p>There was an error saving your assignment to the database, please try again.</p>
        });
      }

    } catch (error) {
      modalContext.updateModal({
        title: 'Error',
        content: <p>The assignment wasn't published, please try again.</p>
      });

      throw error;
    }
  }

  //Opens the are you sure modal with yes or no
  const openSureModal = e => {
    e.preventDefault();

    modalContext.updateModal({
      title: 'Publish assignment',
      content: <div id="sure">
        <p>Are you sure?</p>

        <div id="buttons">
          <button type="button" className="btn" onClick={publishAssignment}>Yes</button>
          <button type="button" className="btn" onClick={() => modalContext.clearModal()}>No</button>
        </div>
      </div>
    })
  }

  //Function that downloads the assignment as a word document
  const exportAssignment = () => {
    //Checking if assignment if reading, if not don't export
    const { description, title } = newAssignmentInput;

    //Checking if the title and description inputs have been filled in, if not the document isn't downloaded
    if (description.replaceAll(' ', '') === '' || title.replaceAll(' ', '') === '') {
      modalContext.updateModal({
        title: 'Error',
        content: <p>Make sure the assignment has a description and a title</p>
      })
      return;
    }

    //Checking if their are questions, if not the document isn't downloaded
    if (currentQuestions.length === 0 || currentQuestions === null) {
      modalContext.updateModal({
        title: 'Error',
        content: <p>Make sure the assignment has questions</p>
      })
      return;
    }

    //Converts assignment data to HTML
    const formatAssignment = () => {
      //Returns the question with the correct format (question number, marks and picture)
      const formatQuestion = (question, index) => {
        if (question.imageURL === '' || question.imageURL === null) {
          return `<b>(${index + 1}) ${question.question} [${question.marks}]</b>`
        } else {
          return `
            <b>(${index + 1}) ${question.question} [${question.marks}]</b>
            <img src=${question.imageURL} width="128px"></img>
          `
        }
      }

      let questions = currentQuestions.map((q, index) => {
        if (q.qtype === 'short') {
          //If a short question just display the question with a line below to answer
          return `
              ${formatQuestion(q, index)}
              <p>.....................................................................................................</p>
            `
        } else {
          //Putting all 4 options in 1 list
          const options = [...q.wrong, q.correct];

          //Shuffle the options so that the position of the correct
          //answer is random
          let counter = options.length;

          // While there are elements in the array
          while (counter > 0) {
            // Pick a random index
            const index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            const temp = options[counter];
            options[counter] = options[index];
            options[index] = temp;
          }

          //Returns the question and the 4 options as a list
          return `
              ${formatQuestion(q, index)}
              <ol type="a">
                <li>${options[0]}</li>
                <li>${options[1]}</li>
                <li>${options[2]}</li>
                <li>${options[3]}</li>
              </ol>           
            `
        }
      }).join('<br />'); //joins all the questions with a new line inbetween each

      //Returning the answer to each question as a list item
      let answers = currentQuestions.map(q => {
        return `<li>${q.correct.join(' or ')} (${q.marks})</li>`;
      }).join('');

      //The HTML that will be converted to a word document
      return `
          <h1>${newAssignmentInput.title}</h1>
          <i>${newAssignmentInput.description}</i>

          <p>Name:  ...............................
          Date:  ...............................
          Class: ...............................</p>

          <h2>Questions</h2>
          <h3>Marks: ......../${returnTotalMarks()}</h3>
          ${questions}
          <br />

          <h2>Answers</h2>
          <ol>
            ${answers}
          </ol>
        `;
    }

    //Function from Codeflix12 
    //HTML that goes before the HTML for the quiz content
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body style="font-family: Arial, san-serif">`;

    //HTML that goes before the HTML for the quiz content
    const postHtml = "</body></html>";

    //The entire HTML that will be converted to a word doc
    const html = preHtml + formatAssignment() + postHtml;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });

    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html)

    const filename = `${title}.doc`;

    const downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    //Downloading the file
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      downloadLink.href = url;

      downloadLink.download = filename;

      downloadLink.click();
    }

    document.body.removeChild(downloadLink);
  }

  //Renders the 3 expected result sliders
  const renderExpectedSliders = () => {
    return <div id="attainment-sliders">
      <div className="form-control">
        <input type="range" inputMode="numeric" min={0} max={Number(returnTotalMarks(true))} step={1} name="expectedHigh" value={newAssignmentInput.expectedHigh} onChange={handleAssignmentChange} />
        <label htmlFor="expectedHigh">High ({newAssignmentInput.expectedHigh}/{returnTotalMarks(true)})</label>
      </div>
      <div className="form-control">
        <input type="range" inputMode="numeric" min={0} max={Number(returnTotalMarks(true))} step={1} name="expectedMid" value={newAssignmentInput.expectedMid} onChange={handleAssignmentChange} />
        <label htmlFor="expectedMid">Mid ({newAssignmentInput.expectedMid}/{returnTotalMarks(true)})</label>
      </div>
      <div className="form-control">
        <input type="range" inputMode="numeric" min={0} max={Number(returnTotalMarks(true))} step={1} name="expectedLow" value={newAssignmentInput.expectedLow} onChange={handleAssignmentChange} />
        <label htmlFor="expectedLow">Low ({newAssignmentInput.expectedLow}/{returnTotalMarks(true)})</label>
      </div>
    </div>
  }

  const renderMainContent = () => {
    return (
      <div id="main-creation-page">
        <h2>Create new assignment</h2>

        <form id="assignment-form" onSubmit={openSureModal}>
          <div id="assignment-details">
            <div id="left" className="side">
              <div className="form-control">
                <input type="text" name="title" autoComplete="off" value={newAssignmentInput.title} onChange={handleAssignmentChange} required />
                <label htmlFor="title">Title</label>
              </div>

              <div className="form-control text-area">
                <textarea type="text" name="description" autoComplete="off" value={newAssignmentInput.description} onChange={handleAssignmentChange} required />
                <label htmlFor="description">Description</label>
              </div>

              <div className="form-control check">
                <input type="checkbox" name="recordTime" checked={newAssignmentInput.recordTime} onChange={handleCheckboxChange} />
                <label htmlFor="recordTime">Record time taken?</label>
              </div>

              <div className="time">
                <input type="date" name="dueDate" autoComplete="off" value={newAssignmentInput.dueDate} onChange={handleAssignmentChange} required />
                <label htmlFor="dueDate">Due date</label>
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
                <button className="btn" type="button" onClick={() => setCreateQuestionFormShowing(true)}>Create and add new question</button>
              </div>
            </div>
          </div>

          <div id="attainment-level">
            <div id="attainment-header">
              <p>Attainment level expected results</p>
              <button className="btn" type="button" onClick={() => setExpectedShowing(!expectedShowing)}>
                {expectedShowing ? 'Hide' : 'Show'}
              </button>
            </div>

            {expectedShowing ? renderExpectedSliders() : null}
          </div>


          <div id="all-questions">
            <div id="all-questions-header">
              <h3>Current questions</h3>

              <div id="buttons">
                <button className="btn" type="button" onClick={exportAssignment}>Export assignment</button>
                <button className="btn" type="submit">Publish assignment</button>
              </div>
            </div>

            <div id="current-questions">
              {returnQuestions()}
            </div>
          </div>
        </form>
      </div>
    )
  }

  return <div id="quiz-creation">
    {createQuestionFormShowing ? renderQuestionForm() : renderMainContent()}
  </div>
}

export default QuizCreation;
//when quiz_creation.js is imported in other files the
//QuizCreation functional component is what is accessed
