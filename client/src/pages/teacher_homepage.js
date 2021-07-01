//React dependencies 
import React, { useContext, useState, useEffect } from 'react';
import Select from 'react-select';
import { CSVLink } from 'react-csv';

//Importing the contexts
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';

//Importing services (for api calls)
import ClassService from '../services/ClassService';

//Importing components
import Graph from '../components/graph/graph';

//Importing styling
import './styling/index.scss';
import './styling/teacherhomepage.scss';

const formatDate = date => {
  const dateParts = date.toDateString().split(' ');

  return `${dateParts[0]} ${dateParts[2]} ${dateParts[1]} ${dateParts[3]}`;
}

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
  const [newClassInfo, setNewClassInfo] = useState({
    name: '', qualification: '', subject: '', joiningCode: ''
  });
  const [attainmentLevel, setAttainmentLevel] = useState(null);
  const [isSmall, setIsSmall] = useState(window.visualViewport.width < 600);

  //variable in state when updated the page re-renders
  const [key, setKey] = useState(0);
  const incrementKey = () => setKey(key + 1);

  //Returns if the screen is less than 600px
  const checkIsSmall = () => {
    setIsSmall(window.visualViewport.width < 600);
    incrementKey();
  }

  window.addEventListener('resize', checkIsSmall);

  //The selected class is set to null when the teacher homepage is loaded
  //as this is often if the teacher is returning from the quiz creation page
  //The user is also updated so the most up to date data is being used
  useEffect(() => {
    authContext.updateUser();
    authContext.resetSelectedClass();
    //eslint-disable-next-line
  }, []);

  //Returns if the submission was made after the dueDate
  const isResultLate = result => {
    const submitDate = new Date(Number(result.date));
    const deadline = new Date(Number(result.assignment.dueDate));

    return (submitDate - deadline > 0);
  }

  //Returns all fully completed results which link to the passed in class
  const returnClassResults = class_ => {
    return [...class_.results].filter(result => {
      return (result.assignment.class._id === class_._id && result.completed);
    })
  }

  //Returns all class names in the correct format from the user 
  const getClassNames = user => {
    if (user === null) {
      return null;
    } //Stop if user variable empty

    let names = [];//array to hold class names

    //If no classes then any empty array returned
    if (user.classes.length === 0) return [];

    //looping through teacher's classes to extract the names
    names = user.classes.map((class_, i) => {
      return { label: `${class_.name} (${class_.qualification} ${class_.subject})`, value: i }
    });

    return names;
  }

  //Returns object with assignments formatted for react-select 
  const getAssignmentNames = assignments_ => {
    if (assignments_ === null) {
      return null;
    } //Stop if user variable empty

    let assignments = [];  //array to hold assignment names

    if (assignments_.length === 0) return [{ label: 'All assignments', value: -1 }];

    //looping through the assignments to extract the names
    assignments = assignments_.map((assignment, i) => {
      return { label: assignment.title, value: i }
    });

    //Return all assignments as well as all, which when selected
    //means all assignments will be displayed
    return [...assignments, { label: 'All assignments', value: -1 }];
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

    //then deselect the currently selected student as they may 
    //not be in the newly selected class
    setCurrentStudent(null); //remove data from state
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

    return (nextAssignment === null ? 'No upcoming assignments' : nextAssignment);
  }

  //Gets average from all class' assignment results
  const getClassAverage = () => {
    if (currentClass === null) return 'N/A';
    if (returnClassResults(currentClass).length === 0) return 'No results yet';

    //addup percentages of each result then find average percentage
    let total = 0;
    let count = 0;
    for (let result of returnClassResults(currentClass)) {
      total += result.marks / result.assignment.maxMarks;
      count++;
    }

    return (count === 0 ? 'No results' : `${((total / count) * 100).toFixed(0)}%`);
  }

  //Counts number of assignments not complete
  const getMissingAssignments = () => {
    if (currentClass === null) return 'N/A';

    const totalAssignments = currentClass.assignments.length * currentClass.students.length;

    return (totalAssignments - returnClassResults(currentClass).length);
  }

  //Counts number of assignments completed
  const getClassSubmitted = () => {
    if (currentClass === null) return 'N/A';

    return returnClassResults(currentClass).length;
  }

  //Counts number of assignments completed by submitted post due date
  const getLateSubmissions = number => {
    if (currentClass === null) return 'N/A';

    const results = returnClassResults(currentClass);

    if (results.length === 0) return 'No results yet';

    //Loop through all results and count late results
    const lateNum = [...results].reduce((accumulator, current) => {
      if (isResultLate(current)) return accumulator + 1;
      return accumulator;
    }, 0);

    if (number === true) {
      return lateNum;
    }

    return `${lateNum}/${results.length}`;
  }

  //Getting results that are from the current student
  const getStudentResults = (specificStudent = null) => {
    if (currentClass === null) return [];

    if (specificStudent === null || specificStudent === undefined) {
      if (currentStudent === null) return [];

      return [...returnClassResults(currentClass)].filter(result => result.student._id === currentStudent._id);
    } else {
      return [...returnClassResults(currentClass)].filter(result => result.student._id === specificStudent._id);
    }
  }

  //Returns the attainment level of a student as a word or number
  const getStudentAttainment = (specificStudent = null, number = false) => {
    //No class selected means that the attainment level of a student can't be returned
    if (currentClass === null) return (number ? -1 : 'N/A');

    //Getting the student from either the paramater or the current student
    let student = (specificStudent === null ? currentStudent : specificStudent);

    //If there is no student then the attainment level of the student can't e returned
    if (student === null) return (number ? -1 : 'N/A');

    //If the data type of student isn't a string then it is an User object so the _id
    //needs to be extracted
    if (typeof (student) !== 'string') student = student._id;

    //Getting the high, mid and low attainment lists from the current class
    const { high, mid, low, } = currentClass;

    //Default case (if student not in any list)
    let level = 'Not set';

    if (high !== null && high !== undefined) {
      if (high.length > 0) {
        //Filtering the high list so only the currentStudent will remain if in list
        const filteredHigh = high.filter(student_ => student_._id === student);

        if (filteredHigh.length === 1) {
          level = 'High';
        }
      }
    }

    if (mid !== null && mid !== undefined) {
      if (mid.length > 0) {
        //Filtering the mid list so only the currentStudent will remain if in list
        const filteredMid = mid.filter(student_ => student_._id === student);

        if (filteredMid.length === 1) {
          level = 'Mid';
        }
      }
    }

    if (low !== null && low !== undefined) {
      if (low.length > 0) {
        //Filtering the low list so only the currentStudent will remain if in list
        const filteredLow = low.filter(student_ => student_._id === student);

        if (filteredLow.length === 1) {
          level = 'Low';
        }
      }
    }

    //If the number parameter the number corresponding to the attainment level
    //is desired instead of the string
    if (number) {
      //if value not high, mid or low then return -1 for no level
      if (level === 'Not set') return -1;

      const levels = ['Low', 'Mid', 'High'];

      return levels.indexOf(level);
    }

    return level;
  }

  //Counts number of results that were greater than a student of their attainment
  //level was expected to get
  const expectedClassResults = () => {
    if (currentClass === null) return 'N/A';

    if (returnClassResults(currentClass).length === 0) return 'No results yet';

    if (currentClass.assignments.length === 0) return 'No assignments yet';

    //Looping through all assignments to check if they have expected results
    //If they do check if any results for that assignment have students with
    //attainment levels if they do check if they have gotten below the mark expected
    let failed = 0;
    let totalValid = 0;
    currentClass.assignments.forEach(assignment => {
      //Check if assignment has expected results
      if (assignment.expectedResults.length === 3) {
        //Find any results linking to the current assignment
        const assignmentResults = [...returnClassResults(currentClass)].filter(result => {
          return result.assignment._id === assignment._id;
        });

        //Check if student has an attainment level, if they do check if they failed
        assignmentResults.forEach(result => {
          const level = getStudentAttainment(result.student._id, true);

          if (level !== -1) {
            totalValid += 1;

            if (result.marks < assignment.expectedResults[level]) {
              failed += 1;
            }
          }
        })
      }
    })

    if (totalValid === 0) return 'No assignments with expected results';
    return `${failed}/${totalValid}`;
  }

  //Counts number of results that were greater than a student of their attainment
  //level was expected to get
  const expectedStudentResults = () => {
    if (currentClass === null || currentStudent === null) return 'N/A';

    //Gets all results that are linked to the current user
    const results = getStudentResults();

    if (results.length === 0) return 'No results yet';

    //Getting the attainment level of the current student
    const level = getStudentAttainment(currentStudent._id, true);
    if (level === -1) {
      //The student has no attainment level 
      return 'Attainment level not set';
    }

    //Looping through all results then checking if the assignment has an expectedResult,
    //If it does check if the student has an attainment level, if they do check if the 
    //result is lower than the expected result
    let failed = 0;
    let totalValid = 0;
    results.forEach(result => {
      //Check if assignment has expected results
      if (result.assignment.expectedResults.length === 3) {
        totalValid += 1;

        if (result.marks < result.assignment.expectedResults[level]) {
          failed += 1;
        }
      }
    })

    if (totalValid === 0) return 'No assignments with expected results completed';
    return `${failed}/${totalValid}`;
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

  //Counts number of assignments submitted that were late 
  //submitted by the selected student
  const getLateAssignments = () => {
    if (currentStudent === null) return 'N/A';

    const results = getStudentResults();
    if (results.length === 0) return 'No results yet';

    //Loop through all results and count late results
    const lateNum = [...results].reduce((accumulator, current) => {
      if (isResultLate(current)) return accumulator + 1;
      return accumulator;
    }, 0);

    return `${lateNum}/${results.length}`;
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
        count += result.assignment.questions.length;
      }
    }

    if (count === 0) return 'No times recorded';
    return `${(totalTime / count).toFixed(0)} seconds`;
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

  //Gets the lowest scoring topic for the selected class
  const getClassPoorestTopic = () => {
    if (currentClass === null) return 'N/A';
    if (returnClassResults(currentClass).length === 0) return 'No results yet';

    const topicList = getTopicsRanked(returnClassResults(currentClass));

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
    if (returnClassResults(currentClass).length === 0) return 'No results yet';

    const topicList = getTopicsRanked(returnClassResults(currentClass));

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
  //Redirects teacher to quiz creation page when 'Set
  //new assignment' button is pressed
  const toQuizCreation = () => {
    //Checking if a class is currently selected
    if (currentClass === null) {
      //Modal to show if the user tries to set a new assignment
      //when no class is selected
      modalContext.updateModal({
        title: 'Error',
        content:
          <p>To set an assignment you must have a class selected. Please select a class...</p>
      });

      return null; //Stops the user being redirected to the quiz creation page
    }

    props.history.push('/teacher/create');
    //changes path of url 

    //Then set the selectedClass in authContext to the 
    //current class so the correct class data is available
    //in the quiz creation page
    authContext.setSelectedClass(currentClass);
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
    const getAssignmentResults = (results, assignmentID) => {
      return [...results].filter(result => result.assignment._id === assignmentID);
    }

    //Function returns the students that have completed the assignment passed into the function
    const missingStudents = assignment => {
      const completedAssignments = getAssignmentResults([...currentClass.results].filter(result => {
        return (result.assignment.class._id === currentClass._id);
      }), assignment._id);
      if (completedAssignments.length === 0) return 'No results yet';

      let students = [...currentClass.students];
      students = students.map(student => student.username);

      completedAssignments.forEach(completed => {
        students.splice(students.indexOf(completed.student.username), 1);
      });

      if (students.length === 0) return <ul><li>No students</li></ul>;

      return <ul><li>{students.toString().replaceAll(',', ', ')}</li></ul>;
    }

    //Function returns the average score from the results of the assignment passed into the function
    const getAverageResult = assignment => {
      const completedAssignments = getAssignmentResults(returnClassResults(currentClass), assignment._id);
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

    //Returns all the results of partially completed assignments
    const startedScores = assignment => {
      //Getting all the incomplete assignments 
      const incompleteAssignments = getAssignmentResults([...currentClass.results].filter(result => {
        return (result.assignment.class._id === currentClass._id && result.completed === false);
      }), assignment._id);

      //If there are no incomplete assignments then explain that
      if (incompleteAssignments.length === 0) {
        return <ul><li>No students</li></ul>;
      }

      //Display all incomplete results
      return (<ul>
        {incompleteAssignments.map(result => {
          return <li>{result.student.username} - Questions completed: {result.answers.length}/{assignment.questions.length}</li>
        })}
      </ul>)
    }

    //Returns all scores ranked (as list items)
    const scoresRanked = assignment => {
      const completedAssignments = getAssignmentResults(returnClassResults(currentClass), assignment._id);
      if (completedAssignments.length === 0) return <p>No results yet</p>;

      let students = [];

      //loop through all results
      for (let result of completedAssignments) {
        const isLate = isResultLate(result);

        students.push({
          _id: result.student._id,
          username: result.student.username,
          mark: result.marks,
          score: Number(((result.marks / assignment.maxMarks) * 100).toFixed(0)),
          date: formatDate(new Date(Number(result.date))),
          isLate
        });
      }

      students.sort((a, b) => b.score - a.score);

      const renderAsList = () => {
        return (<ol>
          {students.map(student => {
            return <li key={student.username}>
              {student.username} - {student.mark}/{assignment.maxMarks} ({student.score}%)
              - {student.date} {student.isLate ? '[LATE]' : '[ON TIME]'}
            </li>
          })}
        </ol>)
      }

      //Returns whether the score is below, at or above the expected result
      const getExpectedScore = (assignment, student) => {
        const level = getStudentAttainment(student, true);

        if (level === -1) return 'N/A';

        if (assignment.expectedResults.length !== 3) return 'Expected results not set';

        if (student.mark < assignment.expectedResults[level]) {
          return `Below (${assignment.expectedResults[level]}/${assignment.maxMarks})`;
        } else if (student.mark === assignment.expectedResults[level]) {
          return `Yes (${assignment.expectedResults[level]}/${assignment.maxMarks})`;
        } else {
          return `Above (${assignment.expectedResults[level]}/${assignment.maxMarks})`;
        }
      }

      const getBelow = student => {
        const level = getStudentAttainment(student._id, true);

        if (level === -1) return '';

        if (assignment.expectedResults.length !== 3) return '';

        if (student.mark < assignment.expectedResults[level]) {
          return 'below';
        }
      }

      const renderAsTable = () => {
        return (<table id="class-results-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Level</th>
              <th>Score</th>
              <th>At expected?</th>
              <th>Date</th>
              <th>On time?</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => {
              return (<tr key={index} className={getBelow(student)}>
                <td>{index + 1}</td>
                <td>{student.username}</td>
                <td>{getStudentAttainment(student)}</td>
                <td>{`${student.mark}/${assignment.maxMarks}`}</td>
                <td>{getExpectedScore(assignment, student)}</td>
                <td>{student.date}</td>
                <td>{student.isLate ? 'LATE' : 'ON TIME'}</td>
              </tr>)
            })}
          </tbody>
        </table>)
      }

      return (isSmall ? renderAsList() : renderAsTable());
    }

    //Returns all questions with their average (as list items)
    const questionsSummarised = assignment => {
      const completedAssignments = getAssignmentResults(returnClassResults(currentClass), assignment._id);
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
          if (result.answers[i].toLowerCase() === result.assignment.questions[i].correct.toLowerCase()) {
            questions[i].total += result.assignment.questions[i].marks;
          }
        }
      }

      return <ol>
        {questions.map(question => {
          return <li key={question.index}>{question.question} - {(question.total / completedAssignments.length).toFixed(2)}/{question.maxMarks}</li>
        })}
      </ol>
    }

    //returns the average time taken for the assignment
    const getAverageTime = assignment => {
      if (assignment.recordTime === false) {
        return 'Times not recorded';
      } else {
        //Getting all the results of the passed in assignment
        const completedAssignments = getAssignmentResults(returnClassResults(currentClass), assignment._id);

        let total = 0;
        let count = 0;
        completedAssignments.forEach(result => {
          if (result.timeTaken !== null) {
            total += result.timeTaken;
            count++;
          }
        })

        if (count === 0) return 'No times recorded yet';

        return `${Math.round(total / count)}s`;
      }
    }

    const renderAssignment = assignment => {
      return (<div className="class-assignment-card" key={assignment._id}>
        <h3>{assignment.title}</h3>
        <ul>
          <li><b>Due date</b> - {formatDate(new Date(Number(assignment.dueDate)))}</li>
          <li><b>Not started</b></li>
          {missingStudents(assignment)}
          <li><b>Started (but incomplete)</b></li>
          {startedScores(assignment)}
          <li><b>Completed</b></li>
          {scoresRanked(assignment)}
          <li><b>Questions (and average mark)</b></li>
          {questionsSummarised(assignment)}
          <li><b>Average score</b> - {getAverageResult(assignment)}</li>
          <li><b>Average time</b> - {getAverageTime(assignment)}</li>
        </ul>
      </div>)
    }

    const renderAssignmentList = type => {
      if (type === 'All assignments' || type === undefined) {
        return currentClass.assignments.map(assignment => {
          return renderAssignment(assignment);
        })
      } else {
        //A specific assignment has been selected so find its details
        const selectedAssignment = [...currentClass.assignments].filter(assignment => assignment.title === type)[0];
        return renderAssignment(selectedAssignment);
      }
    }

    //Updates the modalState state, can be called from 
    //the modal component
    const changeModalState = state => {
      modalContext.updateModal({
        title: `${currentClass.name}'s assignments/results`,
        content: <div id="class-assignments">
          <Select className="modal-selector" options={getAssignmentNames(currentClass.assignments)}
            onChange={handleClassAssignmentSelectorChange} updateModal={changeModalState} defaultValue={'All assignments'} />

          {renderAssignmentList(state.classAssignment)}
        </div>
      });
    }

    //Have to use a normal function instead of an arrow function
    //So this. can be accessed
    function handleClassAssignmentSelectorChange(e) {
      this.updateModal({ classAssignment: e.label });
    }

    if (currentClass === null) {
      modalContext.updateModal({
        title: 'Class assignments/results',
        content: <p>Please select a class...</p>
      });
    } else {
      if (currentClass.assignments.length === 0) {
        modalContext.updateModal({
          title: `${currentClass.name}'s assignments/results`,
          content: <p>No assignments set...</p>
        });
      } else {
        modalContext.updateModal({
          title: `${currentClass.name}'s assignments/results`,
          content: <div id="class-assignments">
            <Select className="modal-selector" options={getAssignmentNames(currentClass.assignments)}
              onChange={handleClassAssignmentSelectorChange} updateModal={changeModalState} defaultValue={'All assignments'} />

            {renderAssignmentList('All assignments')}
          </div>
        });
      }
    }
  }

  //Opens modal to show selected students assignments
  const showStudentAssignmentsModal = () => {
    //Function returns the student's result for the assignment
    const getResult = (assignment, returnResult = true) => {
      //Getting all the student's results
      const studentResults = [...currentClass.results].filter(result => {
        return result.student._id === currentStudent._id;
      })

      if (studentResults.length === 0) return null;

      //Check if a result is linked to the passes in assignment
      const completedResult = [...studentResults].filter(result => result.assignment._id === assignment._id);

      if (returnResult) {
        if (completedResult.length === 0) return null;
      } else {
        if (completedResult.length === 0) return 'missing';
      }

      if (returnResult) {
        return completedResult[0];
      }

      return (completedResult[0].completed ? 'complete' : 'incomplete');
    }

    //Works out if the assignment passed in is completed
    const isCompleted = assignment => {
      //Getting all the student's results
      const studentResults = [...currentClass.results].filter(result => {
        return result.student._id === currentStudent._id;
      });

      //Get results which are from the selected student
      const completedResult = getResult(assignment, false);
      if (completedResult === 'missing') return 'NO';

      //Checking is the assignment that was completed was late
      if (completedResult === 'complete') {
        if (isResultLate([...studentResults].filter(result => {
          return result.assignment._id === assignment._id;
        })[0])) {
          return 'YES [LATE]';
        } else {
          return 'YES [ON TIME]'
        }
      }

      //Checking if the assignment is incomplete
      if (completedResult === 'incomplete') return 'Started';
    }

    //Gets the student's score for the assignment
    const getScore = assignment => {
      //Get results which are from the selected student
      const completedResult = getResult(assignment);
      if (completedResult === null) return 'N/A';

      if (completedResult.completed) {
        return (completedResult !== null ?
          `${completedResult.marks}/${assignment.maxMarks} (${((completedResult.marks / assignment.maxMarks).toFixed(2) * 100)}%)` :
          'N/A'
        );
      } else {
        //Getting the highest possible total marks 
        let total = 0;
        for (let i = 0; i < completedResult.answers.length; i++) {
          total += assignment.questions[i].marks;
        }

        return (completedResult !== null ?
          `${completedResult.marks}/${total} (${((completedResult.marks / total).toFixed(2) * 100)}%)` :
          'N/A'
        );
      }
    }

    //Gets the date the student completed the assignment
    const getDate = assignment => {
      //Get results which are from the selected student
      const completedResult = getResult(assignment);

      if (completedResult === null) return 'N/A';
      return formatDate(new Date(Number(completedResult.date)));
    }


    //Gets the student's time taken from the assignment
    const getTimeTaken = assignment => {
      //Get results which are from the selected student
      const completedResult = getResult(assignment);

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

      let index = -1;
      return completedResult.answers.map(answer => {
        index++;
        if (answer.toLowerCase() === completedResult.assignment.questions[index].correct.toLowerCase()) {
          return <li key={index}>{answer} - CORRECT {(completedResult.hints[index] ? '(Hint used)' : '')}</li>
        } else {
          return <li key={index}>{answer} - INCORRECT {(completedResult.hints[index] ? '(Hint used)' : '')}</li>
        }
      });
    }

    //Returns whether the result is greater than the expected result
    const getExpected = assignment => {
      //Get results which are from the selected student
      const completedResult = getResult(assignment);
      if (completedResult === null) return 'N/A';

      //If the expected result array doesn't have 3 items then the expected result isn't set
      if (assignment.expectedResults.length !== 3) return 'Expected result not set';

      //Getting the attainment level of the student as a number
      const level = getStudentAttainment(currentStudent, true);

      //If level is -1 then the attainment level isn't set yet
      if (level === -1) return 'Attainment level not set';

      //Checking if the result is greater than the expected standard
      if (completedResult.marks < assignment.expectedResults[level]) {
        return `Below, expected is: ${assignment.expectedResults[level]}/${assignment.maxMarks}`;
      } else if (completedResult.marks === assignment.expectedResults[level]) {
        return `Yes`;
      } else {
        return `Above, expected is: ${assignment.expectedResults[level]}/${assignment.maxMarks}`;
      }
    }

    //Returns the assignment card for the inputted assignment
    const renderAssignment = assignment => {
      return (<div className="student-assignment-card" key={assignment._id}>
        <h3>{assignment.title}</h3>
        <ul>
          <li><b>Completed</b> - {isCompleted(assignment)}</li>
          <li><b>Date</b> - {getDate(assignment)}</li>
          <li><b>Score</b> - {getScore(assignment)}</li>
          <li><b>At expected?</b> - {getExpected(assignment)}</li>
          <li><b>Time taken</b> - {getTimeTaken(assignment)}</li>
          <li><b>Hints used</b> - {getHintsUsed(assignment)}</li>
          <li><b>Answers</b></li>
          <ol >
            {getQuestions(assignment)}
          </ol>
        </ul>
      </div>)
    }

    //Returns the assignments selected by the teacher
    const renderAssignmentList = type => {
      //Render all assignments if all selected or nothing selected yet
      if (type === 'All assignments' || type === undefined) {
        return currentClass.assignments.map(assignment => {
          return renderAssignment(assignment);
        })
      } else {
        //A specific assignment has been selected so find its details
        const selectedAssignment = [...currentClass.assignments].filter(assignment => assignment.title === type)[0];
        return renderAssignment(selectedAssignment);
      }
    }

    //Updates the modalState state, can be called from 
    //the modal component
    const changeModalState = state => {
      modalContext.updateModal({
        title: `${currentStudent.username}'s assignments/results`,
        content: <div id="student-assignments">
          <Select className="modal-selector" options={getAssignmentNames(currentClass.assignments)}
            onChange={handleStudentAssignmentSelectorChange} updateModal={changeModalState} defaultValue={'All assignments'} />

          {renderAssignmentList(state.studentAssignment)}
        </div>
      });
    }

    //Have to use a normal function instead of an arrow function
    //So this. can be accessed
    function handleStudentAssignmentSelectorChange(e) {
      this.updateModal({ studentAssignment: e.label });
    }

    if (currentClass === null || currentStudent === null) {
      modalContext.updateModal({
        title: 'Student assignments/results',
        content: <p>Please select a student...</p>
      });
    } else {
      if (currentClass.assignments.length === 0) {
        modalContext.updateModal({
          title: `${currentStudent.username}'s assignments/results`,
          content: <p>No assignments set...</p>
        });
      } else {
        modalContext.updateModal({
          title: `${currentStudent.username}'s assignments/results`,
          content: <div id="student-assignments">
            <Select className="modal-selector" options={getAssignmentNames(currentClass.assignments)}
              onChange={handleStudentAssignmentSelectorChange} updateModal={changeModalState} defaultValue={'All assignments'} />

            {renderAssignmentList('All assignments')}
          </div>
        });
      }
    }
  }

  //Returns the headers (first row of file) for the csv or the data (all student data)
  const getClassExportData = isHeaders => {
    //Return an empty array of csv data if no assignments or no class selected
    if (currentClass === null || currentClass.assignments.length === 0) return [];

    let headers, data = [];

    //Helper function to format a percentage takes in mark and maximum available
    const convertToPercentage = (mark, max) => {
      return `${((mark / max).toFixed(2) * 100)}%`
    }

    //Helper function to get the percentage of hints used in an assignment
    const getHints = result => {
      let hints = result.hints.filter(hint => hint === true).length;
      let questions = result.assignment.questions.length;

      return convertToPercentage(hints, questions);
    }

    if (isHeaders) {
      //If isHeader parameter is true then the headers of 
      //the csv are being requested

      headers = ["student", "attainment level"]
      //Student name is always the first column and attainment level second

      //3 columns for each assignment 
      currentClass.assignments.forEach(assignment => {
        headers.push(`${assignment.title} - result`);
        headers.push(`${assignment.title} - expected percentage (based on attainment level)`);
        headers.push(`${assignment.title} - time taken`);
        headers.push(`${assignment.title} - hints used`);
      })
    } else {
      //If isHeader parameter is false then the data of 
      //the csv is being requested

      //Looping through all students
      currentClass.students.forEach(student => {
        const results = getStudentResults(student); //Getting all the students results

        let output = [student.username, getStudentAttainment(student._id)];
        //First items in row should be student's name and attainment level

        //Getting the student's attainment level
        const level = getStudentAttainment(student._id, true);

        //Looping through all assignments (3 columns per assignment)
        currentClass.assignments.forEach(assignment => {
          //Getting the student's result for the current assignment
          let assignmentResult = results.filter(result => result.assignment._id === assignment._id);

          if (assignmentResult === null || assignmentResult.length === 0) {
            //If no result found state that the assignment is missing
            output = [...output, 'Missing', 'Missing', 'Missing', 'Missing'];
          } else {
            //Extracting the found result for the current assignment
            const result = assignmentResult[0];

            let expectedResult = '';
            //Getting the expected result for the current assignment
            if (level === -1) {
              expectedResult = 'Attainment level not set';
            } else if (assignment.expectedResults.length !== 3) {
              expectedResult = 'Expected results not set';
            } else {
              expectedResult = convertToPercentage(assignment.expectedResults[level], assignment.maxMarks);
            }

            //Calculating the results data for the current assignment
            const percentage = convertToPercentage(result.marks, assignment.maxMarks);
            const timeTaken = (result.timeTaken === null ? 'Not recorded' : `${result.timeTaken}s`);
            const hints = (result.hints === null ? 'N/A' : `${getHints(result)}`);

            //Adding result data to data list
            output = [
              ...output, percentage, expectedResult, timeTaken, hints
            ];
          }
        });

        data = [...data, output];
      })
    }

    return (isHeaders ? headers : data);
  }

  //Handles onClick for Export class data, if there is no class selected or the class
  //selected has no assignments the file isn't downloaded if there is then the file downloads
  const downloadClassData = e => {
    if (currentClass === null || currentClass.assignments.length === 0) {
      modalContext.updateModal({
        title: 'Error',
        content: <p>Please select a class...</p>
      });

      return false;
    }

    return true;
  }

  //Generates a random rgb colour
  const randomColour = (alpha = 'FF') => {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return '#' + n.slice(0, 6) + alpha;
  }

  //Functions to display charts of results in modal
  //current class results graphs 
  const showClassGraphs = () => {
    //Returns the array for statuses
    //[ontime, late, missing]
    const getStatuses = () => {
      const results = returnClassResults(currentClass).length;
      const late = getLateSubmissions(true);
      const ontime = results - late;
      const total = currentClass.assignments.length * currentClass.students.length;
      const missing = total - results;

      return [ontime, late, missing];
    }

    //Returns a 2D array of all the students results
    //Each array is a student then each item in the array is there result for an assignment
    const getResults = () => {
      const output = [];
      let i = 0;
      for (const student of currentClass.students) {
        let results = getStudentResults(student);

        let j = 0;
        for (const assignment of currentClass.assignments) {
          //Getting the student's result that links to the current assignment
          let assignmentResult = results.filter(result => result.assignment._id === assignment._id);

          if (i === 0) {
            output.push([]); //Making an array for each assignment to hold their assignment results
          }

          //If no result found then their result is 0 (not completed)
          if (assignmentResult.length === 0) {
            output[j][i] = 0;
          } else {
            //Getting their result as a percentage
            output[j][i] = Number((assignmentResult[0].marks / assignment.maxMarks).toFixed(2)) * 100;
          }
          j++;
        }
        i++;
      }

      return output;
    }

    //Returns the amount of students in each attainment level
    const getLevels = () => {
      //Getting the attainment level lists
      const { high, mid, low } = currentClass;

      return [high.length, mid.length, low.length];
    }

    //Returns the amount of below, at, above expected results for 
    //each attainment level
    const getAttainmentResults = () => {
      const data = [
        [0, 0, 0], [0, 0, 0], [0, 0, 0]
      ];

      //Getting all results
      const results = returnClassResults(currentClass);

      //Looping through all results
      for (const result of results) {
        const studentLevel = getStudentAttainment(result.student._id, true);

        //If the student has an attainment level add their result
        if (studentLevel !== -1) {
          //Check if result is below, at or above expected result
          if (result.marks < result.assignment.expectedResults[studentLevel]) {
            data[0][studentLevel] += 1;
          } else if (result.marks === result.assignment.expectedResults[studentLevel]) {
            data[1][studentLevel] += 1;
          } else {
            data[2][studentLevel] += 1;
          }
        }
      }

      return data;
    }

    if (currentClass === null) {
      //Cannot display graphs about a class if there is no clas selected so show an error
      modalContext.updateModal({
        title: 'Error',
        content: <p>Please select a class...</p>
      });
    } else {
      //If there is a class selected display the graphs for the selected class
      modalContext.updateModal({
        title: `${currentClass.name}'s assignments/results analysis`,
        content: <div id="classGraphs">
          <h3>Assignment statuses</h3>
          <i>The number of assignments that are...</i>
          <Graph
            type="Bar"
            data={getStatuses()}
            colours={['#44ffb473', '#7a53fc73', '#fc535373']}
            labels={['Submitted on time', 'Submitted Late', 'Missing']}
          />

          <h3>Attainment levels</h3>
          <i>Proportion of students in each attainment level</i>
          <Graph
            type="Pie"
            data={getLevels()}
            colours={['#44ffb473', '#7a53fc73', '#fc535373']}
            labels={['High', 'Mid', 'Low']}
          />

          <h3>Attainment level results</h3>
          <i>Amount of below, at and above expected result for assignments</i>
          <Graph
            type="GroupedBar"
            data={getAttainmentResults()}
            colours={['#fc535373', '#7a53fc73', '#44ffb473']}
            labels={['Low', 'Mid', 'High']}
            secondaryLabels={['Below expected', 'At expected', 'Above expected']}
            xtitle={'Attainment level'}
            ytitle={'Number of results'}
          />

          <h3>All results</h3>
          <Graph
            type="GroupedBar"
            data={getResults()}
            labels={currentClass.students.map(student => {
              const level = getStudentAttainment(student);
              let addition = '';
              if (level === 'High' || level === 'Mid' || level === 'Low') {
                addition = `(${level})`;
              }

              return `${student.username} ${addition}`;
            })}
            colours={currentClass.students.map(() => randomColour('73'))}
            secondaryLabels={currentClass.assignments.map(assignment => assignment.title)}
            yaxis={true}
            xtitle={'Result (%)'}
            ytitle={'Assignments'}
          />
        </div>
      });
    }
  }

  //Handles change of attainment level selector
  const handleAttainmentSelectorChange = e => {
    setAttainmentLevel(e.label);
  }

  //Handles onclick for change attainment level, using normal function definition
  //so can use .bind 
  async function submitAttainmentChange() {
    //If the attainment level isn't set then don't send the api call to set the 
    //attainment level of the current studens
    if (attainmentLevel === '' || attainmentLevel === null) return;

    try {
      //Formatting the data correctly to send the API request
      const info = {
        classID: currentClass._id,
        studentID: currentStudent._id,
        level: attainmentLevel.toLowerCase()
      }

      const updatedClass = await ClassService.setStudentLevel({
        ...info
      }, authContext.token);

      if (updatedClass) {
        setAttainmentLevel('');
        authContext.updateUser();
        setCurrentClass(null);
        setCurrentStudent(null);
        incrementKey();
      } else {
        modalContext.updateModal({
          title: 'Error',
          content: <p>There was an error updating the attainment level, please try again.</p>
        });
      }
    } catch (error) {
      throw error;
    }
  }

  const attainmentOptions = [
    { label: 'High', value: 0 },
    { label: 'Mid', value: 1 },
    { label: 'Low', value: 2 }
  ]

  return (
    <div id="teacher-homepage" key={key}>
      <p id="welcome-msg">Welcome {authContext.user.username}</p>

      <div id="thp-tables">
        <div id="classes">
          <p>Your Classes</p>

          <Select options={getClassNames(authContext.user)}
            placeholder='Select class...' onChange={selectClass} />

          <table className="table">
            <tbody >
              <tr>
                <td className="left">Joining code</td>
                <td className="right">{currentClass ? currentClass.joiningCode : 'N/A'}</td>
              </tr>
              <tr>
                <td className="left">Students</td>
                <td className="right">{(currentClass ? currentClass.students.length : 'N/A')}</td>
              </tr>
              <tr>
                <td className="left">Assignments</td>
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
                <td className="left">Assignments submitted</td>
                <td className="right">{(getClassSubmitted())}</td>
              </tr>
              <tr>
                <td className="left">Late submissions</td>
                <td className="right">{getLateSubmissions()}</td>
              </tr>
              <tr>
                <td className="left">Results below expected</td>
                <td className="right">{expectedClassResults()}</td>
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
            <a className="btn" onClick={showAssignmentsModal}>See all assignments</a>
            <a className="btn" onClick={showClassGraphs}>See class graphs</a>
            <a className="btn" onClick={toQuizCreation}>Set new assignment</a>
            <CSVLink
              headers={getClassExportData(true)}
              data={getClassExportData(false)}
              filename={(currentClass ? `${currentClass.name}Data.csv` : '')}
              className="btn"
              target="_blank"
              onClick={downloadClassData}
            >Export class data</CSVLink>
          </div>
        </div>

        <div id="students">
          <p>Your Students</p>

          <Select id="student-selector" options={getStudentNames(authContext.user)}
            placeholder='Select student...' onChange={selectStudent} />

          <table className="table">
            <tbody >
              <tr>
                <td className="left">Attainment level</td>
                <td className="right">{getStudentAttainment()}</td>
              </tr>
              <tr>
                <td className="left">Average result</td>
                <td className="right">{getStudentAverage()}</td>
              </tr>
              <tr>
                <td className="left">Missing assignments</td>
                <td className="right">{getStudentMissing()}</td>
              </tr>
              <tr>
                <td className="left">Completed assignments</td>
                <td className="right">{getStudentCompleted()}</td>
              </tr>
              <tr>
                <td className="left">Late submissions</td>
                <td className="right">{getLateAssignments()}</td>
              </tr>
              <tr>
                <td className="left">Average time per question</td>
                <td className="right">{averageTime()}</td>
              </tr>
              <tr>
                <td className="left">Hints used</td>
                <td className="right">{hintsUsed()}</td>
              </tr>
              <tr>
                <td className="left">Questions left blank</td>
                <td className="right">{blankAnswers()}</td>
              </tr>
              <tr>
                <td className="left">Results below expected</td>
                <td className="right">{expectedStudentResults()}</td>
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

          <Select className="modal-selector" options={attainmentOptions} onChange={handleAttainmentSelectorChange} placeholder='Select attainment level...' />

          <div id="student-buttons">
            <a className="btn" onClick={submitAttainmentChange}>Change attainment level</a>
            <a className="btn" onClick={showStudentAssignmentsModal}>See all student's assignments</a>
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
