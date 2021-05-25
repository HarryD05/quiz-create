//React dependencies 
import React from 'react';

//Importing styling
import './pages.scss';

//Authentication functional component
const Authentication = props => {

  return (
    <div id="auth">
      <form className="auth-form">
        <h3>Signup or Login</h3>

        <div className="form-control">
          <label htmlFor="username">Username:</label>
          <input type="username" name="username" required />
        </div>

        <div className="form-control">
          <label htmlFor="password">Password:</label>
          <input type="password" name="password" required />
        </div>

        <div className="form-control">
          <label htmlFor="role">Role:</label>
          <div className="radioBtn">
            <label htmlFor="student">Student</label>
            <input type="radio" name="role" value="student" />
          </div>
          <div className="radioBtn">
            <label htmlFor="teacher">Teacher</label>
            <input type="radio" name="role" value="teacher" />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" id="switch" className="btn">Switch</button>
          <button type="submit" id="submit" className="btn">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default Authentication;
//when authentication.js is imported in other files the
//Authentication functional component is what is accessed
