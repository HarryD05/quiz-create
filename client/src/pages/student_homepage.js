//React dependencies 
import React, { useContext, useState } from 'react';

//Importing authContext so data about the current user can be accessed
//and modalContext so modals can be displayed
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';

//Importing services to make class API calls
import ClassService from '../services/ClassService';

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

    //Returns if the passed in assignment has been completed by the current student
    const isCompleted = (assignment, returnResult = false) => {
      //Filtering all the student's results to check for results that are for the 
      //passed in assignment
      const results = [...authContext.user.results].filter(result => {
        return result.assignment._id === assignment._id
      });

      //If the return result parameter is passed in check if the result is available
      //and if it is return the result
      if (returnResult) {
        if (results.length === 1) return results[0];
      }

      //If the result is for the passed in assignment then there will be 1 result in the 
      //array so the statement is true if not the statement is flase (assignment not compete)
      return (results.length === 1);
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
        return 'Not completed yet';
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

        //Update the authContext to have the currentAssignment
        authContext.updateAssignment(assignment);
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
            return (answer !== assignment.questions[index].correct ? 'wrong' : 'correct');
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

    //Returns the assignment card with all the assignment data 
    return (
      <div id="assignment-card" className={checkMissing(assignment)}>
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
            {isCompleted(assignment) ? 'See result' : 'Start assignment'}
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
        return result.assignment.class._id === class_._id
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
          if (answer.toLowerCase() === question.correct.toLowerCase()) {
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
        return result.assignment.class._id === class_._id
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
        return result.assignment.class._id === class_._id
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

    return (
      <div id="class-card">
        <div className="heading">{class_.name} ({class_.qualification} {class_.subject})</div>
        <p><div>Teacher</div><div>{class_.teacher.username}</div></p>
        <p><div>Completed assignments</div><div className="right">{assignmentsCompleted(true)}</div></p>
        <p><div>Assignments still to do</div><div className="right">{assignmentsCompleted(false)}</div></p>
        <p><div>Best topic</div><div className="right">{getStudentBestTopic()}</div></p>
        <p><div>Weakest topic</div><div className="right">{getStudentPoorestTopic()}</div></p>
      </div>
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

  return (
    <div id="student-homepage">
      <p id="welcome-msg">Welcome {authContext.user.username}</p>

      <div id="shp-main">
        <div id="assignments">
          <p className="title">Your assignments</p>

          <div id="search-assignments">
            <div className="form-control">
              <input type="text" name="keyword" autoComplete="off"
                onChange={handleAssignmentSearchChange} required />
              <label htmlFor="keyword">Search assignments...</label>
            </div>

            <button className="btn">Join class</button>
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
