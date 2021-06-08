//React dependencies 
import React, { useContext, useState } from 'react';
import Select from 'react-select';

//Importing the contexts
import { AuthContext } from './../context/AuthContext';

//Teacher homepage functional component
const TeacherHomepage = props => {
  //Setting up the authcontext so the details of the teacher
  //user can be accessed
  const authContext = useContext(AuthContext);

  //Setting up state to store current class/student
  const [currentClass, setCurrentClass] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);


  const getClassNames = user => {
    if (user === null) {
      return null;
    } //Stop if user variable empty

    const names = [];//array to hold class names

    //looping through teacher's classes to extract the names
    for (let i = 0; i < user.classes.length; i++) {
      names.push({ label: user.classes[i].name, value: i });
    }

    return names;
  }

  //get the student list from the selected class
  const getStudentNames = user => {
    if (user === null || currentClass === null) {
      return null;
    } //Stop if user variable empty

    const names = []; //array to hold class names

    //looping through class' students to extract the usernames
    for (let i = 0; i < currentClass.students.length; i++) {
      names.push({ label: currentClass.students[i].username, value: i });
    }

    return names;
  }

  //Sets the class data to the newly selected class
  const selectClass = e => {
    //e.value is the index of the class is the user's class list
    setCurrentClass(authContext.user.classes[e.value]);
  }

  //Sets the student data to the newly selected student
  const selectStudent = e => {
    //e.value is the index of the class is the user's class list
    setCurrentStudent(currentClass.students[e.value]);
  }

  //Retrieves the next assignment due in 
  const getNextAssignment = () => {
    if (currentClass === null) return 'NA';

    let nextAssignment = null;
    let smallestDiff = 100000000000000000;

    for (let assignment of currentClass.assignments) {
      const diff = Number(assignment.dueDate) - Number(new Date());
      if (diff < smallestDiff && diff > 0) {
        nextAssignment = assignment.title;
        smallestDiff = diff;
      }
    }

    return (nextAssignment === null ? 'NA' : nextAssignment);
  }

  //Gets average from all class' assignment results
  const getClassAverage = () => {
    if (currentClass === null) return 'NA';

    //addup percentages of each result then find average percentage
    let total = 0;
    let count = 0;
    for (let result of currentClass.results) {
      total += result.marks / result.assignment.maxMarks;
      count++;
    }

    return (count === 0 ? 'No results' : `${((total / count) * 100).toFixed(0)}%`);
  }

  //Counts number of assignments not complete
  const getMissingAssignments = () => {
    if (currentClass === null) return 'NA';

    const totalAssignments = currentClass.assignments.length * currentClass.students.length;

    return (totalAssignments - currentClass.results.length) + "/" + totalAssignments;
  }

  //Getting results that are from the current student
  const getStudentResults = () => {
    return [...currentClass.results].filter(result => result.student.username === currentStudent.username);
  }

  //Gets average from student's results
  const getStudentAverage = () => {
    if (currentStudent === null) return 'NA';

    //Get results which are from the selected student
    let studentResults = getStudentResults();

    //addup percentages of each result then find average percentage
    let total = 0;
    let count = 0;
    for (let result of studentResults) {
      total += result.marks / result.assignment.maxMarks;
      count++;
    }

    return (count === 0 ? 'No results' : `${((total / count) * 100).toFixed(0)}%`);
  }

  //Counts number of assignments student completed
  const getStudentCompleted = () => {
    if (currentStudent === null) return 'NA';

    //Get results which are from the selected student
    let studentResults = getStudentResults();

    const totalAssignments = currentClass.assignments.length;

    return studentResults.length + "/" + totalAssignments;
  }

  //Counts number of assignments student missing
  const getStudentMissing = () => {
    if (currentStudent === null) return 'NA';

    //Get results which are from the selected student
    let studentResults = getStudentResults();

    const totalAssignments = currentClass.assignments.length;

    return `${(totalAssignments - studentResults.length)}/${totalAssignments}`;
  }

  //Returns the average time taken for student's assignments
  const averageTime = () => {
    if (currentStudent === null) return 'NA';

    //Get results which are from the selected student
    let studentResults = getStudentResults();

    let totalTime = 0;
    let count = 0;
    for (let result of studentResults) {
      if (result.timeTaken !== null) {
        totalTime += result.timeTaken;
        count++;
      }
    }

    return (count === 0 ? 'No data for time taken' : `${((totalTime / count) * 100).toFixed(0)} seconds`);
  }

  //Works out the percentage of questions hints used by student
  const hintsUsed = () => {
    if (currentStudent === null) return 'NA';

    //Get results which are from the selected student
    let studentResults = getStudentResults();

    let hints = 0;
    let total = 0;
    for (let result of studentResults) {
      for (let hint of result.hints) {
        if (hint === true) hints++;

        total++;
      }
    }

    return (total === 0 ? 'No data for hints' : `${hints}/${total}`);
  }

  const blankAnswers = () => {
    if (currentStudent === null) return 'NA';

    //Get results which are from the selected student
    let studentResults = getStudentResults();

    let blank = 0;
    let total = 0;
    for (let result of studentResults) {
      for (let answer of result.answers) {
        if (answer.replaceAll(' ', '') === '') blank++;
        total++;
      }
    }

    return `${blank}/${total}`;
  }

  //Ranks topics based on their average result
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
        if (answer == question.correct) {
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

  //Gets the lowest scoring topic for the selected class
  const getClassPoorestTopic = () => {
    if (currentClass === null) return 'NA';
    if (currentClass.results.length === 0) return 'No results yet';

    const topicList = getTopicsRanked(currentClass.results);

    let poorestTopic = null;
    let worstPercentage = 101;
    for (let topic in topicList) {
      if (topicList[topic].percentage <= worstPercentage) {
        worstPercentage = topicList[topic].percentage;
        poorestTopic = topic;
      }
    }

    return `${poorestTopic} (${worstPercentage}%)`;
  }

  //Gets the highest scoring topic for the current class
  const getClassBestTopic = () => {
    if (currentClass === null) return 'NA';
    if (currentClass.results.length === 0) return 'No results yet';

    const topicList = getTopicsRanked(currentClass.results);

    let bestTopic = null;
    let bestPercentage = -1;
    for (let topic in topicList) {
      if (topicList[topic].percentage >= bestPercentage) {
        bestPercentage = topicList[topic].percentage;
        bestTopic = topic;
      }
    }

    return `${bestTopic} (${bestPercentage}%)`;
  }

  //Gets the lowest scoring topic for the selected student
  const getStudentPoorestTopic = () => {
    if (currentStudent === null) return 'NA';

    //getting the students results
    const studentResults = getStudentResults();
    if (studentResults.length === 0) return 'No results yet';

    const topicList = getTopicsRanked(studentResults);

    let poorestTopic = null;
    let worstPercentage = 101;
    for (let topic in topicList) {
      if (topicList[topic].percentage <= worstPercentage) {
        worstPercentage = topicList[topic].percentage;
        poorestTopic = topic;
      }
    }

    return `${poorestTopic} (${worstPercentage}%)`;
  }

  //Gets the highest scoring topic for the selected student
  const getStudentBestTopic = () => {
    if (currentStudent === null) return 'NA';

    //getting the students results
    const studentResults = getStudentResults();
    if (studentResults.length === 0) return 'No results yet';

    const topicList = getTopicsRanked(studentResults);

    let bestTopic = null;
    let bestPercentage = -1;
    for (let topic in topicList) {
      if (topicList[topic].percentage >= bestPercentage) {
        bestPercentage = topicList[topic].percentage;
        bestTopic = topic;
      }
    }

    return `${bestTopic} (${bestPercentage}%)`;
  }

  return (
    <div id="teacher-homepage">
      <p id="welcome-msg">Welcome {authContext.user.username}</p>

      <div id="thp-tables">
        <div id="classes">
          <p>Your Classes</p>

          <Select options={getClassNames(authContext.user)} placeholder='Select class...' onChange={selectClass} isSearchable />

          <table className="table">
            <tbody >
              <tr>
                <td className="left">Num. of students</td>
                <td className="right">{(currentClass ? currentClass.students.length : 'NA')}</td>
              </tr>
              <tr>
                <td className="left">Num. of assignments</td>
                <td className="right">{currentClass ? currentClass.assignments.length : 'NA'}</td>
              </tr>
              <tr>
                <td className="left">Next assignment due</td>
                <td className="right">{getNextAssignment()}</td>
              </tr>
              <tr>
                <td className="left">Average result</td>
                <td className="right">{getClassAverage()}</td>
              </tr>
              <tr>
                <td className="left">Missing assignments</td>
                <td className="right">{getMissingAssignments()}</td>
              </tr>
              <tr>
                <td className="left">Poorest topic</td>
                <td className="right">{getClassPoorestTopic()}</td>
              </tr>
              <tr>
                <td className="left">Best topic</td>
                <td className="right">{getClassBestTopic()}</td>
              </tr>
              <tr>
                <td className="left">Joining code</td>
                <td className="right">{currentClass ? currentClass.joiningCode : 'NA'}</td>
              </tr>
            </tbody>
          </table>

          <div id="class-buttons">
            <button className="btn" onClick={alert('not yet setup')}>See all assignments</button>
            <button className="btn" onClick={alert('not yet setup')}>Set new assignment</button>
            <button className="btn" onClick={alert('not yet setup')}>Create new class</button>
          </div>
        </div>

        <div id="students">
          <p>Your Students</p>

          <Select options={getStudentNames(authContext.user)} placeholder='Select student...' onChange={selectStudent} isSearchable />

          <table className="table">
            <tbody >
              <tr>
                <td className="left">Average result</td>
                <td className="right">{getStudentAverage()}</td>
              </tr>
              <tr>
                <td className="left">Completed assignments</td>
                <td className="right">{getStudentCompleted()}</td>
              </tr>
              <tr>
                <td className="left">Missing assignments</td>
                <td className="right">{getStudentMissing()}</td>
              </tr>
              <tr>
                <td className="left">Average time per question</td>
                <td className="right">{averageTime()}</td>
              </tr>
              <tr>
                <td className="left">Num. of hints used</td>
                <td className="right">{hintsUsed()}</td>
              </tr>
              <tr>
                <td className="left">Questions left blank</td>
                <td className="right">{blankAnswers()}</td>
              </tr>
              <tr>
                <td className="left">Poorest topic</td>
                <td className="right">{getStudentPoorestTopic()}</td>
              </tr>
              <tr>
                <td className="left">Best topic</td>
                <td className="right">{getStudentBestTopic()}</td>
              </tr>
            </tbody>
          </table>

          <div id="student-buttons">
            <button className="btn" onClick={alert('not yet setup')}>See all student's assignments</button>
          </div>
        </div>
      </div>
    </div >
  );
}

export default TeacherHomepage;
//when teacher_homepage.js is imported in other files the
//TeacherHomepage functional component is what is accessed
