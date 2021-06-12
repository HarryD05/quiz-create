//React dependencies 
import React, { useContext, useState } from 'react';
import Select from 'react-select';

//Importing the contexts
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';

//Importing services (for api calls)
import ClassService from '../services/ClassService';

//Teacher homepage functional component
const TeacherHomepage = props => {
  //Setting up the authcontext so the details of the teacher
  //user can be accessed
  const authContext = useContext(AuthContext);

  //Settuping up modal context so modal/popups can be used
  const modalContext = useContext(ModalContext);

  //Setting up state to store current class/student
  const [currentClass, setCurrentClass] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [newClassInfo, setNewClassInfo] = useState(
    { name: '', qualification: '', subject: '', joiningCode: '' }
  );

  const getClassNames = user => {
    if (user === null) {
      return null;
    } //Stop if user variable empty

    const names = [];//array to hold class names

    //looping through teacher's classes to extract the names
    for (let i = 0; i < user.classes.length; i++) {
      const classI = user.classes[i]; //details of the class at index i in the user's class list
      names.push({ label: `${classI.name} (${classI.qualification} ${classI.subject})`, value: i });
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
    if (currentClass === null) return 'N/A';

    let nextAssignment = null;
    let smallestDiff = 100000000000000000;

    for (let assignment of currentClass.assignments) {
      const diff = Number(assignment.dueDate) - Number(new Date());
      if (diff < smallestDiff && diff > 0) {
        nextAssignment = assignment.title;
        smallestDiff = diff;
      }
    }

    return (nextAssignment === null ? 'N/A' : nextAssignment);
  }

  //Gets average from all class' assignment results
  const getClassAverage = () => {
    if (currentClass === null) return 'N/A';
    if (currentClass.results.length === 0) return 'No results yet';

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
    if (currentClass === null) return 'N/A';

    const totalAssignments = currentClass.assignments.length * currentClass.students.length;

    return (totalAssignments - currentClass.results.length) + "/" + totalAssignments;
  }

  //Getting results that are from the current student
  const getStudentResults = () => {
    return [...currentClass.results].filter(result => result.student.username === currentStudent.username);
  }

  //Gets average from student's results
  const getStudentAverage = () => {
    if (currentStudent === null) return 'N/A';

    //Get results which are from the selected student
    let studentResults = getStudentResults();
    if (studentResults.length === 0) return 'No results yet';

    //addup percentages of each result then find average percentage
    let total = 0;
    let count = 0;
    for (let result of studentResults) {
      total += result.marks / result.assignment.maxMarks;
      count++;
    }

    return `${((total / count) * 100).toFixed(0)}%`;
  }

  //Counts number of assignments student completed
  const getStudentCompleted = () => {
    if (currentStudent === null) return 'N/A';

    //Get results which are from the selected student
    let studentResults = getStudentResults();
    if (studentResults.length === 0) return 'No results yet';

    const totalAssignments = currentClass.assignments.length;

    return studentResults.length + "/" + totalAssignments;
  }

  //Counts number of assignments student missing
  const getStudentMissing = () => {
    if (currentStudent === null) return 'N/A';

    //Get results which are from the selected student
    let studentResults = getStudentResults();
    if (studentResults.length === 0) return 'No results yet';

    const totalAssignments = currentClass.assignments.length;

    return `${(totalAssignments - studentResults.length)}/${totalAssignments}`;
  }

  //Returns the average time taken for student's assignments
  const averageTime = () => {
    if (currentStudent === null) return 'N/A';

    //Get results which are from the selected student
    let studentResults = getStudentResults();
    if (studentResults.length === 0) return 'No results yet';

    let totalTime = 0;
    let count = 0;
    for (let result of studentResults) {
      if (result.timeTaken !== null) {
        totalTime += result.timeTaken;
        count++;
      }
    }

    if (count === 0) return 'No times recorded';
    return `${((totalTime / count) * 100).toFixed(0)} seconds`;
  }

  //Works out the percentage of questions hints used by student
  const hintsUsed = () => {
    if (currentStudent === null) return 'N/A';

    //Get results which are from the selected student
    let studentResults = getStudentResults();
    if (studentResults.length === 0) return 'No results yet';

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
    if (currentStudent === null) return 'N/A';

    //Get results which are from the selected student
    let studentResults = getStudentResults();
    if (studentResults.length === 0) return 'No results yet';

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
        if (answer === question.correct) {
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
    if (currentClass === null) return 'N/A';
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
    if (currentClass === null) return 'N/A';
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
    if (currentStudent === null) return 'N/A';

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
    if (currentStudent === null) return 'N/A';

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

  //Button onClick functions
  //Redirects teacher to quiz creation page
  const toQuizCreation = () => {
    props.history.push('/teacher/create');
    //changes path of url 
  }

  const handleChange = e => {
    setNewClassInfo({
      ...newClassInfo,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async e => {
    e.preventDefault(); //stops page reloading

    //making the create class api call
    try {
      //Input sanitation
      const classInput = {
        name: newClassInfo.name.toUpperCase(),
        subject:
          newClassInfo.subject[0].toUpperCase() +
          newClassInfo.subject.slice(1).toLowerCase(),
        qualification: newClassInfo.qualification.toUpperCase(),
        joiningCode: newClassInfo.joiningCode
      }

      const classResult = await ClassService.createClass(classInput, authContext.token);

      modalContext.clearModal();

      if (classResult) {
        modalContext.updateModal({
          title: 'Success',
          content: <p>Class successfully made</p>
        });

        document.getElementById('class-form').reset(); //clears form
        await authContext.updateUser();
        //refreshes the page so the class is selectable in the above selector

      } else {
        modalContext.updateModal({
          title: 'Error',
          content: <p>Something went wrong, try again (your joining code needs to be unique).</p>
        });
      }
    } catch (error) {
      throw error;
    }
  }

  //Opens modal showing classes assignments
  const showAssignmentsModal = () => {
    //Function returns the results linked to the assignment passed into the function
    const getAssignmentResults = (results, assignmentTitle) => {
      return [...results].filter(result => result.assignment.title === assignmentTitle);
    }

    //Function returns the students that have completed the assignment passed into the function
    const missingStudents = assignment => {
      const completedAssignments = getAssignmentResults(currentClass.results, assignment.title);
      if (completedAssignments.length === 0) return 'No results yet';

      let students = [...currentClass.students];
      students = students.map(student => student.username);

      completedAssignments.forEach(completed => {
        students.splice(students.indexOf(completed.student.username), 1);
      });

      return students.toString().replaceAll(',', ', ');
    }

    //Function returns the average score from the results of the assignment passed into the function
    const getAverageResult = assignment => {
      const completedAssignments = getAssignmentResults(currentClass.results, assignment.title);
      if (completedAssignments.length === 0) return 'No results yet';

      //addup percentages of each result then find average percentage
      let total = 0;
      let count = 0;
      for (let result of completedAssignments) {
        total += result.marks / assignment.maxMarks;
        count++;
      }

      return `${((total / count) * 100).toFixed(0)}%`;
    }

    //Returns all scores ranked (as list items)
    const scoresRanked = assignment => {
      const completedAssignments = getAssignmentResults(currentClass.results, assignment.title);
      if (completedAssignments.length === 0) return <li>No results yet</li>;

      let students = [];

      //loop through all results
      for (let result of completedAssignments) {
        students.push({
          username: result.student.username,
          mark: result.marks,
          score: Number(((result.marks / assignment.maxMarks) * 100).toFixed(0))
        });
      }

      students.sort((a, b) => b.score - a.score);

      return students.map(student => {
        return <li key={student.username}>{student.username} - {student.mark}/{assignment.maxMarks} ({student.score}%)</li>
      });
    }

    //Returns all questions with their average (as list items)
    const questionsSummarised = assignment => {
      const completedAssignments = getAssignmentResults(currentClass.results, assignment.title);
      if (completedAssignments.length === 0) return <li>No results yet</li>;

      let questions = [];
      let index = 1;
      completedAssignments[0].assignment.questions.forEach(q => {
        questions.push({
          index,
          question: q.question,
          maxMarks: q.marks,
          total: 0
        });
        index++;
      })

      //loop through all results
      for (let result of completedAssignments) {
        for (let i = 0; i < questions.length; i++) {
          if (result.answers[i] === result.assignment.questions[i].correct) {
            questions[i].total += result.assignment.questions[i].marks;
          }
        }
      }

      return questions.map(question => {
        return <li key={question.index}>{question.question} - {Math.round((question.total / completedAssignments.length) * 100) / 100}/{question.maxMarks}</li>
      });
    }

    if (currentClass === null) {
      modalContext.updateModal({
        title: 'Class assignments/results',
        content: <p>Please select a class...</p>
      });
    } else {
      modalContext.updateModal({
        title: `${currentClass.name}'s assignments/results`,
        content: <div id="class-assignments">
          {currentClass.assignments.map(assignment => {
            return (<div className="class-assignment-card" key={assignment._id}>
              <h3>{assignment.title}</h3>
              <ul>
                <li><b>Due date</b> - {new Date(Number(assignment.dueDate)).toLocaleString()}</li>
                <li><b>Average</b> - {getAverageResult(assignment)}</li>
                <li><b>Not completed</b> - {missingStudents(assignment)}</li>
                <li><b>Completed</b></li>
                <ol>
                  {scoresRanked(assignment)}
                </ol>
                <li><b>Questions (and average mark)</b></li>
                <ol>
                  {questionsSummarised(assignment)}
                </ol>
              </ul>
            </div>)
          })}
        </div>
      });
    }
  }

  //Opens modal to show selected students assignments
  const showStudentAssignmentsModal = () => {
    //Function returns the student's result for the assignment
    const getResult = assignment => {
      let studentResults = getStudentResults();
      if (studentResults.length === 0) return null;

      //Check if a result is linked to the passes in assignment
      const completedResult = studentResults.filter(result => result.assignment.title === assignment.title);

      if (completedResult.length === 0) return null;
      return completedResult[0];
    }

    //Works out if the assignment passed in is completed
    const isCompleted = assignment => {
      //Get results which are from the selected student
      const completedResult = getResult(assignment);
      if (completedResult === null) return 'NO';

      return 'YES'
    }

    //Gets the student's score for the assignment
    const getScore = assignment => {
      //Get results which are from the selected student
      const completedResult = getResult(assignment);
      if (completedResult === null) return 'N/A';

      return (completedResult ?
        `${completedResult.marks}/${completedResult.assignment.maxMarks} (${((completedResult.marks / completedResult.assignment.maxMarks).toFixed(2) * 100)}%)` :
        'N/A'
      );
    }

    //Gets the student's time taken from the assignment
    const getTimeTaken = assignment => {
      //Get results which are from the selected student
      const completedResult = getResult(assignment);

      console.log(completedResult);

      if (completedResult === null) return 'N/A';
      else if (completedResult.timeTaken === null) return 'Not recorded';
      return `${completedResult.timeTaken} seconds`;
    }

    //Gets the student's hints taken from the assignment
    const getHintsUsed = assignment => {
      //Get results which are from the selected student
      const completedResult = getResult(assignment);
      if (completedResult === null) return 'N/A';

      let hints = [];
      let index = 1;
      completedResult.hints.forEach(usedHint => {
        if (usedHint) hints.push(`Q${index}`);

        index++;
      });

      if (hints.length === 0) return 'No hints used';
      return hints.toString().replaceAll(',', ', ');
    }

    //Returns the students answers to the questions as list items
    const getQuestions = assignment => {
      //Get results which are from the selected student
      const completedResult = getResult(assignment);
      if (completedResult === null) return 'N/A';

      console.log(completedResult);

      let index = -1;
      return completedResult.answers.map(answer => {
        index++;
        if (answer === completedResult.assignment.questions[index].correct) {
          return <li key={index}>{answer} - CORRECT {(completedResult.hints[index] ? '(Hint used)' : '')}</li>
        } else {
          return <li key={index}>{answer} - INCORRECT {(completedResult.hints[index] ? '(Hint used)' : '')}</li>
        }
      });
    }

    if (currentClass === null || currentStudent === null) {
      modalContext.updateModal({
        title: 'Student assignments/results',
        content: <p>Please select a student...</p>
      });
    } else {
      modalContext.updateModal({
        title: `${currentStudent.username}'s assignments/results`,
        content: <div id="student-assignments">
          {currentClass.assignments.map(assignment => {
            return (<div className="student-assignment-card" key={assignment._id}>
              <h3>{assignment.title}</h3>
              <ul>
                <li><b>Completed</b> - {isCompleted(assignment)}</li>
                <li><b>Score</b> - {getScore(assignment)}</li>
                <li><b>Time taken</b> - {getTimeTaken(assignment)}</li>
                <li><b>Hints used</b> - {getHintsUsed(assignment)}</li>
                <li><b>Answers</b></li>
                <ol >
                  {getQuestions(assignment)}
                </ol>
              </ul>
            </div>)
          })}
        </div>
      });
    }
  }

  return (
    <div id="teacher-homepage" >
      <p id="welcome-msg">Welcome {authContext.user.username}</p>

      <div id="thp-tables">
        <div id="classes">
          <p>Your Classes</p>

          <Select options={getClassNames(authContext.user)} placeholder='Select class...' onChange={selectClass} />

          <table className="table">
            <tbody >
              <tr>
                <td className="left">Joining code</td>
                <td className="right">{currentClass ? currentClass.joiningCode : 'N/A'}</td>
              </tr>
              <tr>
                <td className="left">Num. of students</td>
                <td className="right">{(currentClass ? currentClass.students.length : 'N/A')}</td>
              </tr>
              <tr>
                <td className="left">Num. of assignments</td>
                <td className="right">{currentClass ? currentClass.assignments.length : 'N/A'}</td>
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
            </tbody>
          </table>

          <div id="class-buttons">
            <button className="btn" onClick={showAssignmentsModal}>See all assignments</button>
            <button className="btn" onClick={toQuizCreation}>Set new assignment</button>
          </div>
        </div>

        <div id="students">
          <p>Your Students</p>

          <Select options={getStudentNames(authContext.user)} placeholder='Select student...' onChange={selectStudent} />

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
            <button className="btn" onClick={showStudentAssignmentsModal}>See all student's assignments</button>
          </div>
        </div>
      </div>

      <div id="create-class">
        <h3>Create new class</h3>
        <form id="class-form" onSubmit={handleSubmit}>
          <div className="form-control">
            <input type="text" name="name" onChange={handleChange} autoComplete="off" required />
            <label htmlFor="name">Class name</label>
          </div>

          <div className="form-control">
            <input type="text" name="qualification" onChange={handleChange} autoComplete="off" required />
            <label htmlFor="qualification">Qualification</label>
          </div>

          <div className="form-control">
            <input type="text" name="subject" onChange={handleChange} autoComplete="off" required />
            <label htmlFor="subject">Subject</label>
          </div>

          <div className="form-control">
            <input type="text" name="joiningCode" onChange={handleChange} autoComplete="off" required />
            <label htmlFor="joiningCode">Joining code</label>
          </div>

          <div className="form-actions">
            <button type="submit" id="submit" className="btn">Create class</button>
          </div>
        </form>
      </div>

    </div >
  );
}

export default TeacherHomepage;
//when teacher_homepage.js is imported in other files the
//TeacherHomepage functional component is what is accessed
