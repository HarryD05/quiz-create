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

  return (
    <div id="student-homepage">
      <h3>Welcome {authContext.user.username}</h3>
    </div>
  );
}

export default StudentHomepage;
//when student_homepage.js is imported in other files the
//StudentHomepage functional component is what is accessed
