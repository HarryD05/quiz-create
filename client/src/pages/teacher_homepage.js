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

  const getClassNames = user => {
    if (user === null) {
      return null;
    } //Stop if user variable empty

    const names = [];//array to hold class names

    //looping through teacher's classes to extract the names
    let index = 0;
    for (let class_ of user.classes) {
      names.push({ label: class_.name, value: index });
      index++;
    }

    return names;
  }

  const getStudentNames = user => {
    if (user === null) {
      return null;
    } //Stop if user variable empty

    const names = [];//array to hold class names

    //looping through teacher's classes to extract the names
    let index = 0;
    for (let class_ of user.classes) {
      for (let student of class_.students) {
        if (names.indexOf(student.username) !== null) {
          names.push({ label: student.username, value: index });
          index++;
        }
      }
    }

    return names;
  }

  //Sets the class data to the newly selected class
  const selectClass = e => {
    //e.value is the index of the class is the user's class list
    setCurrentClass(authContext.user.classes[e.value]);
  }

  const getNextAssignment = class_ => {
    let nextAssignment = null;
    let smallestDiff = null;

    for (let assignment of class_.assignments) {
      const diff = Number(assignment.dueDate) - Number(new Date());
      //negative diff means due date passed, positive means upcoming

      if (diff >= 0) {
        if (diff < smallestDiff) {
          nextAssignment = assignment;
          smallestDiff = diff;
        }
      }
    }

    if (nextAssignment === null) {
      return 'Not yet set';
    } else {
      return nextAssignment.title;
    }
  }

  return (
    <div id="teacher-homepage">
      <p id="welcome-msg">Welcome {authContext.user.username}</p>

      <div id="thp-tables">
        <div id="classes">
          <Select options={getClassNames(authContext.user)} placeholder='Select class...' onChange={selectClass} isSearchable />

          <table className="table">
            <tbody >
              <tr>
                <td className="left">Number of students</td>
                <td className="right">{currentClass !== null ? currentClass.students.length : 'NA'}</td>
              </tr>

              <tr>
                <td className="left">Next assignment due</td>
                <td className="right">{currentClass !== null ? getNextAssignment(currentClass) : 'NA'}</td>
              </tr>

              <tr>
                <td className="left">Average result</td>
                <td className="right">0</td>
              </tr>

              <tr>
                <td className="left">Missing assignments</td>
                <td className="right">0</td>
              </tr>

              <tr>
                <td className="left">Topic of concern</td>
                <td className="right">0</td>
              </tr>

              <tr>
                <td className="left">Best topic</td>
                <td className="right">0</td>
              </tr>

              <tr>
                <td className="left">Joining code</td>
                <td className="right">0</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div id="students">
          <Select options={getStudentNames(authContext.user)} placeholder='Select student...' isSearchable />
        </div>
      </div>
    </div >
  );
}

export default TeacherHomepage;
//when teacher_homepage.js is imported in other files the
//TeacherHomepage functional component is what is accessed
