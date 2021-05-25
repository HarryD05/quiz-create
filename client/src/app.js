//React dependencies 
import React, { useContext } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

//Context imports
import { AuthContext } from './context/AuthContext';

//Pages
import Authentication from './pages/authentication';
import TeacherHomepage from './pages/teacher_homepage';
import QuizCreation from './pages/quiz_creation';
import StudentHomepage from './pages/student_homepage';
import Quiz from './pages/quiz';

//Components
import Navbar from './components/navbar/navbar';

//App functional component
const App = () => {
  const authContext = useContext(AuthContext);

  const returnSwitch = () => {
    if (!authContext.user) {
      //An unauthorized user

      return (
        <Switch> {'Allows for displaying of different pages'}
          <Route path='/auth' component={Authentication} exact />
          <Redirect to='/auth' />
        </Switch>
      )
    } else {
      if (!authContext.user.role) {
        return (
          <Switch> {'Allows for displaying of different pages'}
            <Route path='/auth' component={Authentication} />
            <Redirect to='/auth' />
          </Switch>
        )
      } else if (authContext.user.role === 'teacher') {
        return (
          <Switch> {'Allows for displaying of different pages'}
            <Route path='/teacher/home' component={TeacherHomepage} exact />
            <Route path='/teacher/create' component={QuizCreation} exact />
            <Redirect to='/teacher/home' />
          </Switch>
        )
      } else if (authContext.user.role === 'student') {
        return (
          <Switch> {'Allows for displaying of different pages'}
            <Route path='/student/home' component={StudentHomepage} exact />
            <Route path='/student/quiz' component={Quiz} exact />
            <Redirect to='/student/home' />
          </Switch>
        )
      }
    }
  }

  return (
    <div id="main">
      <Navbar />

      {returnSwitch()}
    </div>
  );
}

export default App;
//when App.js is imported in other files the
//App functional component is what is accessed