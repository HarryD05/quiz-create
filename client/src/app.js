//React dependencies 
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

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

      <Switch> {'Allows for displaying of different pages'}
        <Route path='/auth' component={Authentication} />
        <Route path='/teacher/home' component={TeacherHomepage} />
        <Route path='/teacher/create' component={QuizCreation} />
        <Route path='/student/home' component={StudentHomepage} />
        <Route path='/student/quiz' component={Quiz} />
        <Redirect to='/auth' /> {'if none of paths above used, redirected to authentication page'}
      </Switch>
    </>
  );
}

export default App;
//when App.js is imported in other files the
//App functional component is what is accessed
