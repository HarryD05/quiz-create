//React dependencies 
import React, { useContext } from 'react';

//Importing authContext so data about the current user can be accessed
import { AuthContext } from '../context/AuthContext';

//Importing styling
import './styling/index.scss';
import './styling/studenthomepage.scss';

//Student homepage functional component
const StudentHomepage = () => {
  //Setting up the authContext
  const authContext = useContext(AuthContext);

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
    const isCompleted = assignment => {
      //Filtering all the student's results to check for results that are for the 
      //passed in assignment
      const results = [...authContext.user.results].filter(result => {
        return result.assignment._id === assignment._id
      });

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
        if (new Date() - new Date(Number(assignment.dueDate)) > 0) {
          return 'Missing';
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
    const checkMissing = assignment => {
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

    return (
      <div id="assignment-card" className={checkMissing(assignment)}>
        <div className="heading">{assignment.title}</div>
        <p><div>Status</div><div>{getStatus(assignment)}</div></p>
        <p><div>Questions</div><div>{assignment.questions.length}</div></p>
        <p><div>Marks</div><div>{totalMarks(assignment)}</div></p>
        <p>
          <div>Class</div>
          <div>{assignment.class.name} ({assignment.class.qualification} {assignment.class.subject})</div>
        </p>
        <p><div>Due date</div><div>{formatDate(assignment.dueDate)}</div></p>
        <div className="footer">
          <button className="btn">{isCompleted(assignment) ? 'See result' : 'Start assignment'}</button>
        </div>
      </div>
    );
  }

  return (
    <div id="student-homepage">
      <p id="welcome-msg">Welcome {authContext.user.username}</p>

      <div id="shp-main">
        <div id="assignments">
          <p className="title">Your assignments</p>

          <div id="search-assignments">
            <div className="form-control">
              <input type="text" name="keyword" autoComplete="off" required />
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
              <input type="text" name="joiningCode" autoComplete="off" required />
              <label htmlFor="joiningCode">Joining code</label>
            </div>

            <button className="btn">Join class</button>
          </div>

          <div id="class-cards">
            <div id="class-card">
              <div className="heading">Class name</div>
              <p><div>Completed assignments</div><div>0</div></p>
              <p><div>Missing assignments</div><div>0</div></p>
              <p><div>Best topic</div><div>0</div></p>
              <p><div>Weakest topic</div><div>0</div></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentHomepage;
//when student_homepage.js is imported in other files the
//StudentHomepage functional component is what is accessed
