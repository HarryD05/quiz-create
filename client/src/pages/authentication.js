//React dependencies 
import React, { useState, useContext } from 'react';

//Importing context and services
import AuthService from '../services/AuthService';
import { AuthContext } from '../context/AuthContext';

//Importing styling
import './pages.scss';

//Authentication functional component
const Authentication = props => {
  //Setting up state
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState({ username: "", password: "", role: "" });

  //Setting up context
  const authContext = useContext(AuthContext);

  //Toggle login/signup
  const toggleLogin = () => {
    setIsLogin(!isLogin);
  }

  //Storing the user input in the state of the component
  const handleChange = e => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  }

  const login = async user => {
    try {
      const loginResult = await AuthService.login(user);

      if (loginResult) {
        alert('Successful');

        const { token } = loginResult;

        const currentUser = await AuthService.currentUser(token);

        if (currentUser) {
          await authContext.login(token, currentUser);
        } else {
          alert('Error with process, try again');
        }
      } else {
        alert('Error with process, try again');
      }
    } catch (error) {
      alert('Error with process, try again');

      throw error;
    }
  }

  //Sending api calls for login and signup functionality
  const handleSubmit = async e => {
    e.preventDefault(); //stops the normal submit button functionality

    //try/catch will handle the error if the api call fails
    try {
      //Send request to backend
      if (isLogin) {
        await login({ username: user.username, password: user.password });
      } else {
        const signupData = await AuthService.signup(user);

        if (signupData) {
          await login({ username: user.username, password: user.password, role: user.role });

          alert('Successful');
        } else {
          alert('Error with process, try again');
        }
      }
    } catch (error) {
      alert('Error with process, try again');

      throw error;
    }
  }

  //Render role form control function (only needed if signup)
  const renderRole = () => {
    return (
      <div className="form-control role">
        <div className="radioBtn">
          <label htmlFor="student">Student</label>
          <input type="radio" name="role" value="student" onChange={handleChange} />
        </div>
        <div className="radioBtn">
          <label htmlFor="teacher">Teacher</label>
          <input type="radio" name="role" value="teacher" onChange={handleChange} />
        </div>
      </div>
    )
  }

  //Render options for signup or login
  const renderLoginTitle = () => {
    return (
      <div id="options">
        <button className="optionBtn current" id="left" disabled>Login</button>
        <button className="optionBtn other" id="right" onClick={toggleLogin}>Signup</button>
      </div>
    )
  }

  const renderSignupTitle = () => {
    return (
      <div id="options">
        <button className="optionBtn other" id="left" onClick={toggleLogin}>Login</button>
        <button className="optionBtn current" id="right" disabled>Signup</button>
      </div>
    )
  }

  return (
    <div id="auth">
      <form className="auth-form" onSubmit={handleSubmit}>
        {isLogin ? renderLoginTitle() : renderSignupTitle()}

        <div className="form-control">
          <input type="username" name="username" onChange={handleChange} autoComplete="off" required />
          <label htmlFor="username">Username</label>
        </div>

        <div className="form-control">
          <input type="password" name="password" onChange={handleChange} required />
          <label htmlFor="password">Password</label>
        </div>

        {isLogin ? null : renderRole()}

        <div className="form-actions">
          <button type="submit" id="submit" className="btn">
            {isLogin ? "Login" : "Signup"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Authentication;
//when authentication.js is imported in other files the
//Authentication functional component is what is accessed
