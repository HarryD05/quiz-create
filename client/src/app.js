//React dependencies 
import React from 'react';

//Pages
import Authentication from './pages/authentication';
import TeacherHomepage from './pages/teacher_homepage';
import QuizCreation from './pages/quiz_creation';
import StudentHomepage from './pages/student_homepage';
import Quiz from './pages/quiz';

//App functional component
const App = () => {
  return (
    <>
      <h1>QuizCreate</h1>

      <Authentication />
      <TeacherHomepage />
      <QuizCreation />
      <StudentHomepage />
      <Quiz />
    </>
  );
}

export default App;
//when App.js is imported in other files the
//App functional component is what is accessed
