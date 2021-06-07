//React dependencies 
import React, { useContext } from 'react';

//Importing the contexts
import { AuthContext } from './../context/AuthContext';

//Teacher homepage functional component
const TeacherHomepage = props => {
  //Setting up the authcontext so the details of the teacher
  //user can be accessed
  const authContext = useContext(AuthContext);

  return (
    <div id="teacher-homepage">
      <p id="welcome-msg">Welcome {authContext.user.username}</p>

      <div id="thp-tables">
        <div id="classes">
          <h3>Classes placeholder</h3>
        </div>

        <div id="students">
          <h3>Students placeholder</h3>
        </div>
      </div>
    </div>
  );
}

export default TeacherHomepage;
//when teacher_homepage.js is imported in other files the
//TeacherHomepage functional component is what is accessed
