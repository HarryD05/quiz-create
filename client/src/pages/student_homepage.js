//React dependencies 
import React, { useContext, useState, useEffect } from 'react';
import Select from 'react-select';

//Importing authContext so data about the current user can be accessed
//and modalContext so modals can be displayed
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';

//Importing services to make class API calls
import ClassService from '../services/ClassService';

//Importing components
import Graph from '../components/graph/graph';

//Importing styling
import './styling/index.scss';
import './styling/studenthomepage.scss';

//Student homepage functional component
const StudentHomepage = props => {
  //Setting up the contexts
  const authContext = useContext(AuthContext);
  const modalContext = useContext(ModalContext);

  //Setting up state
  const [searchKeyWord, setSearchKeyWord] = useState('');
  const [joiningCode, setJoiningCode] = useState('');
  const [assignmentType, setAssignmentType] = useState('all');
  const [selectedClass, setSelectedClass] = useState('');
  const [modalSelectedClass, setModalSelectedClass] = useState(-1);
  const [graphModalOpen, setGraphModelOpen] = useState(false);

  //Whenever a modal is closed set the graph modal open state variable to closed
  document.getElementById('main').addEventListener('modalClosed', () => {
    setGraphModelOpen(false);
    setModalSelectedClass(-1);
  });

  //Returns if the passed in assignment has been completed by the current student
  const isCompleted = (assignment, returnResult = false) => {
    //Filtering all the student's results to check for results that are for the 
    //passed in assignment
    const results = [...authContext.user.results].filter(result => {
      return (result.assignment._id === assignment._id && result.completed)
    });

    //If the return result parameter is passed in check if the result is available
    //and if it is return the result
    if (returnResult) {
      if (results.length === 1) return results[0];
    }

    //If the result is for the passed in assignment then there will be 1 result in the 
    //array so the statement is true if not the statement is flase (assignment not compete)
    if (results.length === 0) {
      return false;
    } else {
      return results[0].completed;
    }
  }

  const returnStatus = assignment => {
    //Filtering all the student's results to check for results that are for the 
    //passed in assignment
    const results = [...authContext.user.results].filter(result => {
      return (result.assignment._id === assignment._id)
    });

    //If the result is for the passed in assignment then there will be 1 result in the 
    //array so if no results then the asignment hasn't been started, then check the result
    //to see if it is completed or just started
    if (results.length === 0) return 'missing';

    if (results[0].completed) return 'completed';

    return 'started';
  }

  //Returns assignment cards for all assignments
  const renderAssignmentCards = () => {
    //First get all the assignments by looping through every class
    if (authContext.user.classes.length === 0) return 'No assignments yet...';

    let assignments = [];

    //Looping through all the student's classes
    for (const class_ of authContext.user.classes) {
      //Checking if the class has any assignments (if not ignore)
      if (class_.assignments.length === 0) return;

      //Looping through all the class' assignments to add them to the array
      for (const assignment of class_.assignments) {
        assignments.push(assignment);
      }
    }

    //If there are no assignments then return that
    if (assignments.length === 0) return 'No assignments yet';

    //Filtering the assignment list to check for the search key word
    if (searchKeyWord !== '') {
      assignments = [...assignments].filter(assignment => {
        //Putting filter word into a case insensitive regular expression
        //So when searching matching case isn't required
        let filterWord = new RegExp(`${searchKeyWord.trim()}`, 'i');
        let found = false;

        //Checking all data about the assignment for the filterword 
        if (assignment.title.search(filterWord) !== -1) found = true;
        else if (assignment.description.search(filterWord) !== -1) found = true;
        else if (assignment.class.subject.search(filterWord) !== -1) found = true;
        else if (assignment.class.qualification.search(filterWord) !== -1) found = true;
        else if (assignment.class.name.search(filterWord) !== -1) found = true;

        //If filterword still not found check questions in the assignments 
        if (found === false) {
          assignment.questions.forEach(question => {
            if (question.question.search(filterWord) !== -1) found = true;
            else if (question.topic.search(filterWord) !== -1) found = true;
          })
        }

        return found;
      })
    }

    //If there are no assignments then return that
    if (assignments.length === 0) return `No assignments match the key word "${searchKeyWord}"`;

    //Now filtering based on the selected assignment type (from 3 buttons at top of page)
    //(no if statement for 'All' as no assignments need to be filtered out)
    if (assignmentType === 'completed') {
      assignments = [...assignments].filter(assignment => {
        return isCompleted(assignment) === true;
      });
    } else if (assignmentType === 'incomplete') {
      assignments = [...assignments].filter(assignment => {
        return isCompleted(assignment) === false;
      });
    }

    //Now filtering based on the selected class id
    if (selectedClass.replaceAll(' ', '') !== '') {
      assignments = [...assignments].filter(assignment => {
        return assignment.class._id === selectedClass;
      });
    }

    if (assignments.length === 0) return `No assignments to display...`;

    //Sorting the assignments by due date
    assignments.sort((a, b) => {
      return new Date(Number(a.dueDate)) - new Date(Number(b.dueDate))
    })

    return assignments.map(assignment => renderAssignmentCard(assignment));
  }

  //Returns an assignment card with the data linked to the passed in assignment
  const renderAssignmentCard = assignment => {
    //Returns the date (excluding time) in a neat format
    const formatDate = date => {
      //Splitting the default date string into parts
      const dateParts = new Date(Number(date)).toDateString().split(' ');

      //Reording date string so its readable
      return `${dateParts[0]} ${dateParts[2]} ${dateParts[1]} ${dateParts[3]}`;
    }

    //Returns the total marks of all the questions in the assignment
    const totalMarks = assignment => {
      //Loops through all the questions and sums the marks
      return assignment.questions.reduce((accumulator, question) => {
        return accumulator + question.marks;
      }, 0)
    }

    //Returns whether the passed in assignment is completed on time,
    //completed late or not submitted
    const getStatus = (assignment) => {
      //First check if the assignment is completed
      const completed = isCompleted(assignment);

      if (completed === false) {
        if (new Date() - new Date(Number(assignment.dueDate)) > 0) {
          return 'Overdue';
        } else {
          return 'Not submitted yet';
        }
      }

      //If the assignment is completed then check if it was handed in late or not
      //Filtering all the student's results to check for results that are for the 
      //passed in assignment
      const result = [...authContext.user.results].filter(result => {
        return result.assignment._id === assignment._id
      })[0];

      //Check if the date of the submission is after the due date
      if (new Date(Number(result.date)) - new Date(Number(assignment.dueDate)) > 0) {
        return 'Completed [LATE]';
      } else {
        return 'Completed [ON TIME]'
      }
    }

    //Returns the string 'missing' if the assignment passed in doesn't have a result 
    //from the current student and its due date is passed
    const checkMissing = (assignment) => {
      //First check if the assignment is completed
      const completed = isCompleted(assignment);

      if (completed === false) {
        //Checking if the due date has passed if the assignment is not completed
        if (new Date() - new Date(Number(assignment.dueDate)) > 0) {
          return 'missing';
        }
      }

      return '';
    }

    //Handles click, if assignment completed opens see result modal, if not redirects
    //to the quiz completion page
    function handleAssignmentClick(assignment) {
      //Checking if the assignment is complete or not
      const assignmentResult = isCompleted(assignment, true);

      if (assignmentResult === false) {
        //If assignment not completed redirect user to the assignment completion page
        props.history.push('/student/quiz');

        //Getting the status (either started or missing)
        const status = returnStatus(assignment);

        if (status === 'started') {
          //Get the partial result
          const result = [...authContext.user.results].filter(result => {
            return (result.assignment._id === assignment._id && result.completed === false);
          })[0];

          //Update the authContext to have the currentAssignment at next incomplete question
          authContext.updateAssignment({
            assignment,
            startingQuestion: result.answers.length,
            currentMarks: result.marks,
            timeTaken: result.timeTaken
          });
        } else {
          //Update the authContext to have the currentAssignment, starting at question 1 
          authContext.updateAssignment({
            assignment,
            startingQuestion: 0,
            currentMarks: 0,
            timeTaken: 0
          });
        }
      } else {
        //Returns the timetaken to complete the assignment if it is available
        const getTime = () => {
          return assignment.recordTime ? assignmentResult.timeTaken + 's' : 'Time not recorded';
        }

        //Counts the number of hints the student used for the current assignment
        const getHints = () => {
          return (assignmentResult.hints ?
            `${[...assignmentResult.hints].filter(hint => hint === true).length}/${assignment.questions.length}` :
            'N/A'
          );
        }

        //Returns all the student's answer for the current assignment 
        const getAnswers = () => {
          //Returns wrong/correct for the answer so the answer can be colour coded
          const getClass = (answer, index) => {
            return assignment.questions[index].correct.indexOf(answer.toLowerCase()) !== -1 ? 'correct' : 'wrong';
          }

          return assignmentResult.answers.map((answer_, index) => {
            //Checking if the answer is blank
            let answer = answer_;
            if (answer.replaceAll(' ', '') === '') answer = '[Left blank]';

            //Returning the question as a list element including the answer and explanation
            return (<li>{assignment.questions[index].question}
              <ul>
                <li className={getClass(answer, index)}>You answered: {answer}</li>
                <li>Explanation: {assignment.questions[index].explanation}</li>
              </ul>
            </li>)
          })
        }

        //If assignment is completed then show the results modal
        modalContext.updateModal({
          title: `${assignment.title} result`,
          content: <div id="assignment-result">
            <p>
              <div>Score</div>
              <div className="right">{assignmentResult.marks}/{assignment.maxMarks}</div>
            </p>
            <p>
              <div>Time taken</div>
              <div className="right">{getTime()}</div>
            </p>
            <p>
              <div>Hints used</div>
              <div className="right">{getHints()}</div>
            </p>

            <p style={{ marginTop: '1rem' }}>Questions</p>
            <ol id="answers">
              {getAnswers()}
            </ol>
          </div>
        })
      }
    }

    //Returns the relevant button text
    const renderAssignmentButton = () => {
      //Getting the status of the current assignment
      const status = returnStatus(assignment);

      switch (status) {
        case 'missing':
          return 'Start assignment';

        case 'started':
          return 'Continue assignment';

        case 'completed':
          return 'See result';

        default:
          return 'Error';
      }
    }

    //Returns the assignment card with all the assignment data 
    return (
      <div id="assignment-card" className={checkMissing(assignment)} key={assignment._id}>
        <div className="heading">{assignment.title}</div>
        <div className="subheading">{assignment.description}</div>

        <p><div>Status</div><div className="right">{getStatus(assignment)}</div></p>
        <p><div>Questions</div><div className="right">{assignment.questions.length}</div></p>
        <p><div>Marks</div><div className="right">{totalMarks(assignment)}</div></p>
        <p>
          <div>Class</div>
          <div className="right">{assignment.class.name} ({assignment.class.qualification} {assignment.class.subject})</div>
        </p>
        <p><div>Due date</div><div className="right">{formatDate(assignment.dueDate)}</div></p>
        <div className="footer">
          <button className="btn" onClick={handleAssignmentClick.bind(this, assignment)}>
            {renderAssignmentButton()}
          </button>
        </div>
      </div>
    );
  }

  //Returns class cards for all the classes the student is in
  const renderClassCards = () => {
    //First get all the assignments by looping through every class
    if (authContext.user.classes.length === 0) return 'No classes yet...';

    return authContext.user.classes.map(class_ => renderClassCard(class_));
  }

  //Returns a class card with the data linked to the passed in class
  const renderClassCard = class_ => {
    //Returns the number of completed or incomplete assignments
    const assignmentsCompleted = isCompleted => {
      //Total number of assignments
      const total = class_.assignments.length;

      //Getting the results that link to the passed in class
      const results = [...authContext.user.results].filter(result => {
        return (result.assignment.class._id === class_._id && result.completed)
      });

      //If looking for completed assignments just return the number of results
      //the user has that are linked to this class
      if (isCompleted) return results.length;

      //if looking for incomplete assignments return the total - results 
      return total - results.length;
    }

    //Returns an object of the user's topics with average mark 
    const getTopicsRanked = results => {
      let output = {};

      //loop through all results
      for (let result of results) {
        for (let i = 0; i < result.answers.length; i++) {
          const answer = result.answers[i];
          const question = result.assignment.questions[i];

          //adding the topic to the topic list if not yet in output object
          if (question.topic in output === false) {
            output[question.topic] = { marks: 0, maxMarks: 0, percentage: 0 };
          }

          //if correct answer then add marks to the topics total marks
          if (question.correct.indexOf(answer.toLowerCase()) !== -1) {
            output[question.topic].marks += question.marks;
          }

          //adding up the total possible marks for the topic
          output[question.topic].maxMarks += question.marks;
        }
      }

      //Finding the percentage for each topic (the marks/maximum marks)
      for (let topic in output) {
        output[topic].percentage = Number(((output[topic].marks / output[topic].maxMarks) * 100).toFixed(2));
      }

      return output;
    }

    //Gets the lowest scoring topic for the selected student
    const getStudentPoorestTopic = () => {
      //Checking that the user has results for this class
      const classResults = [...authContext.user.results].filter(result => {
        return (result.assignment.class._id === class_._id && result.completed)
      });

      if (classResults.length === 0) return 'No results yet';

      //Getting the average mark for each topic
      const topicList = getTopicsRanked(classResults);

      //Getting the topic with the lowest percentage
      let poorestTopic = null;
      let worstPercentage = 101;
      for (let topic in topicList) {
        if (topicList[topic].percentage <= worstPercentage) {
          worstPercentage = topicList[topic].percentage;
          poorestTopic = topic;
        }
      }

      //Returning the poorest topic with its percentage
      return `${poorestTopic} (${worstPercentage}%)`;
    }

    //Gets the highest scoring topic for the student
    const getStudentBestTopic = () => {
      //Checking that the user has results for this class
      const classResults = [...authContext.user.results].filter(result => {
        return (result.assignment.class._id === class_._id && result.completed)
      });

      if (classResults.length === 0) return 'No results yet';

      //Getting the average mark for each topic
      const topicList = getTopicsRanked(classResults);

      //Getting the topic with the highest percentage
      let bestTopic = null;
      let bestPercentage = -1;
      for (let topic in topicList) {
        if (topicList[topic].percentage >= bestPercentage) {
          bestPercentage = topicList[topic].percentage;
          bestTopic = topic;
        }
      }

      //Returning the best topic with its percentage
      return `${bestTopic} (${bestPercentage}%)`;
    }

    //Handles on click for a class card
    const selectClass = classID => {
      if (selectedClass === classID) {
        setSelectedClass('');
      } else {
        setSelectedClass(classID);
      }
    }

    let btnClass = '';
    if (selectedClass === class_._id) {
      btnClass = 'selected';
    }

    const returnTeacherName = () => {
      const { prefix, firstname, surname } = class_.teacher;

      return `${prefix} ${firstname.toUpperCase()[0]} ${surname}`;
    }

    return (
      <button id="class-card" onClick={() => selectClass(class_._id)} className={btnClass} key={class_._id}>
        <div className="heading">{class_.name} ({class_.qualification} {class_.subject})</div>
        <p style={{ marginBottom: '12px' }}><div>Teacher</div><div>{returnTeacherName()}</div></p>
        <p><div>Completed assignments</div><div className="right">{assignmentsCompleted(true)}</div></p>
        <p style={{ marginBottom: '12px' }}><div>Assignments still to do</div><div className="right">{assignmentsCompleted(false)}</div></p>
        <p><div>Best topic</div><div className="right">{getStudentBestTopic()}</div></p>
        <p><div>Weakest topic</div><div className="right">{getStudentPoorestTopic()}</div></p>
      </button>
    );
  }

  //Handles input change of search assignments text input 
  const handleAssignmentSearchChange = e => {
    setSearchKeyWord(e.target.value);
  }

  //Handles input change of joining code text input 
  const handleJoiningSearchChange = e => {
    setJoiningCode(e.target.value);
  }

  //Handles onclick for join class button
  const joinClass = async e => {
    e.preventDefault(); //Stops the page from reloading

    //Checking if a joining code has been input
    if (joiningCode.replaceAll(' ', '') !== '') {
      try {
        //Make join class API call
        const classResult = await ClassService.joinClass(joiningCode.replaceAll(' ', ''), authContext.token);

        if (classResult) {
          modalContext.updateModal({
            title: 'Success',
            content: <p>{classResult.name} successfully joined</p>
          });

          await authContext.updateUser();
          //refreshes the page so the new class data can be seen
        } else {
          modalContext.updateModal({
            title: 'Error',
            content: <p>Something went wrong, try again.</p>
          });
        }
      } catch (error) {
        throw error;
      }
    } else {
      modalContext.updateModal({
        title: 'Error',
        content: <p>Please input a class joining code.</p>
      });
    }
  }

  //Getting the css class for the assignment select buttons currently selected 
  //button will be darkened
  const getAssignmentSearchClass = type => {
    let base = 'btn'; //the base class for all buttons

    //if the type of the button is the selected type add the selected class
    if (type === assignmentType) {
      return base + ' selected';
    }

    //if not the type then just return the base class
    return base;
  }

  //handles onclick for see all results button, opening a modal with a graph of 
  //all results and a class selector
  const openResultsModal = () => {
    //Setting the graph modal to open so the content will reload if the selector 
    //value changes
    setGraphModelOpen(true);

    //Checking if there are any assignments to display
    const isValid = (returnBool = true) => {
      //Initially all classes will be used
      let classes = [...authContext.user.classes];

      //If a specific class selected filter it out
      //all classes is 0 so if the value is above 1 a class is selected
      if (modalSelectedClass >= 0) {
        classes = [classes[modalSelectedClass]];
      }

      //If there are no classes left no graph can be displayed
      if (classes.length === 0) return false;

      //Store all results linked to the selected class(es) in this array
      let results = [];

      classes.forEach(class_ => {
        //stores all the results that are from this class
        const linkedResults = [...authContext.user.results].filter(result => {
          return (result.assignment.class._id === class_._id && result.completed)
        });

        //Adding the new linked results to the current results array
        results = results.concat(linkedResults);
      })

      //If there are no results there is no data to show in the graph
      if (results.length === 0) return false;

      //If here there is a list of results to return 
      if (returnBool) {
        return true;
      }

      //If return bool is false then the results array should be returned
      return results;
    }

    let content;

    //if the user has no results to display...
    if (authContext.user.results.length === 0) {
      content = <p>You have no results yet...</p>
    } else {
      //If the user does have results - get all their classes
      const options = authContext.user.classes.map((class_, index) => {
        //Extracting data from the class
        const { name, qualification, subject } = class_;

        return { label: `${name} (${qualification} ${subject})`, value: index }
      })

      //Adding an all option to the class selector options
      options.unshift({ label: 'All', value: -1 });

      //Generates a random rgb colour
      const randomColour = (alpha = 'FF') => {
        let n = (Math.random() * 0xfffff * 1000000).toString(16);
        return '#' + n.slice(0, 6) + alpha;
      }

      //Checking if there are results to display
      const results = isValid(false);
      let labels, colours, data;

      //Returns the label formatted so short, if text length reduced ellipsis added
      const snipLabel = label => {
        let snipped = label.slice(0, 18);

        if (snipped.length !== label.length) {
          snipped = snipped + '...';
        }

        return snipped;
      }

      //If there are a list of results to present then extract the data from them
      if (results) {
        //Each bar will represent an assignment
        labels = results.map(result => snipLabel(result.assignment.title));

        //A random colour for each assignment
        colours = results.map(() => randomColour('73'));

        //Each bar's length will be the percentage result achieved
        data = results.map(result => {
          return Number((result.marks / result.assignment.maxMarks).toFixed(2)) * 100;
        })
      }

      content = <>
        <Select className="selector" options={options} onChange={selectorChange} />

        {isValid() ?
          <Graph
            type="Bar" labels={labels} colours={colours} data={data}
            yaxis={true} xtitle={'Result (%)'}
          /> :
          <p>No results to display...</p>}
      </>
    }

    //Opening the modal to display the graph
    modalContext.updateModal({
      title: 'Your results',
      content:
        <div id="results-modal">
          {content}
        </div>
    })
  }

  const selectorChange = e => {
    //Setting the selected class to the index of the class in the student's class list
    setModalSelectedClass(e.value);
  }

  //whenever the modal selector value changes the modal rerender so the correct class
  //data is shown
  useEffect(() => {
    //only rerender the modal if it is open, if it is closed then no need to rerender
    if (graphModalOpen) {
      openResultsModal();
    }
  }, [modalSelectedClass]);

  return (
    <div id="student-homepage">
      <div id="student-homepage-header">
        <p id="welcome-msg">Welcome {authContext.user.firstname}</p>
        <button className="btn" onClick={openResultsModal}>See all results</button>
      </div>

      <div id="shp-main">
        <div id="assignments">
          <p className="title">Your assignments</p>

          <div id="search-assignments">
            <div className="form-control">
              <input type="text" name="keyword" autoComplete="off"
                onChange={handleAssignmentSearchChange} required />
              <label htmlFor="keyword">Filter assignments...</label>
            </div>

            <div id="search-buttons">
              <button
                className={getAssignmentSearchClass('completed')}
                onClick={() => setAssignmentType('completed')}
              >
                Completed
              </button>
              <button
                className={getAssignmentSearchClass('incomplete')}
                onClick={() => setAssignmentType('incomplete')}
              >
                Still to do
              </button>
              <button
                className={getAssignmentSearchClass('all')}
                onClick={() => setAssignmentType('all')}
              >
                All
              </button>
            </div>
          </div>

          <div id="assignment-cards">
            {renderAssignmentCards()}
          </div>
        </div>

        <div id="classes">
          <p className="title">Your classes</p>

          <div id="join-class">
            <div className="form-control">
              <input type="text" name="joiningCode" autoComplete="off"
                onChange={handleJoiningSearchChange} value={joiningCode} required />
              <label htmlFor="joiningCode">Joining code</label>
            </div>

            <button className="btn" onClick={joinClass}>Join class</button>
          </div>

          <div id="class-cards">
            {renderClassCards()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentHomepage;
//when student_homepage.js is imported in other files the
//StudentHomepage functional component is what is accessed
