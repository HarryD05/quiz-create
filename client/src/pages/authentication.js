//React dependencies 
import React, { useState, useContext } from 'react';
import Select from 'react-select';

//Importing context and services
import AuthService from '../services/AuthService';
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';

//Importing styling
import './styling/index.scss';
import './styling/auth.scss';

//Authentication functional component
const Authentication = props => {
  //Setting up state
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState({
    firstname: '', surname: '', prefix: '', username: '', password: '', role: ''
  });

  //Setting up context
  const authContext = useContext(AuthContext);
  const modalContext = useContext(ModalContext);

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

  const handleSelectChange = e => {
    //Selecting which attribute to update
    if (e.value === 'teacher' || e.value === 'student') {
      setUser({
        ...user,
        role: e.value
      });
    } else {
      setUser({
        ...user,
        prefix: e.value
      });
    }
  }

  const login = async (user, isFromSignup) => {
    try {
      const loginResult = await AuthService.login(user);

      if (loginResult) {
        const { token } = loginResult;

        const currentUser = await AuthService.currentUser(token);

        if (currentUser) {
          await authContext.login(token, currentUser);
        } else {
          if (isFromSignup) {
            modalContext.updateModal({
              title: 'Error', content: (
                <>
                  <p>There was an error logging you in, but your account has been created so you can now login.</p>
                </>
              )
            });
          }
        }
      } else {
        modalContext.updateModal({
          title: 'Error', content: (
            <>
              <p>There was an error logging you in - your username and/or password was incorrect.</p>
            </>
          )
        });
      }
    } catch (error) {
      modalContext.updateModal({
        title: 'Error', content: (
          <>
            <p>Your login didn't process correctly, please refresh the page and log in again.</p>
          </>
        )
      });

      throw error;
    }
  }

  //Sending api calls for login and signup functionality
  const handleSubmit = async e => {
    e.preventDefault(); //stops the normal submit button functionality

    //If signing up make sure that the prefix and role values aren't empty
    if (!isLogin) {
      if (user.role === '' || user.prefix === '') {
        modalContext.updateModal({
          title: 'Error',
          content: <p>Must select an account type (and prefix if you're a teacher)</p>
        });
        return;
      }
    }

    //try/catch will handle the error if the api call fails
    try {
      //Send request to backend
      if (isLogin) {
        await login({ username: user.username, password: user.password }, false);
      } else {
        const signupData = await AuthService.signup(user);

        if (signupData) {
          await login({ username: user.username, password: user.password, role: user.role }, true);
        } else {
          modalContext.updateModal({
            title: 'Error', content: (
              <>
                <p>Your signup didn't process correctly, your username already exists.</p>
              </>
            )
          });
        }
      }
    } catch (error) {
      modalContext.updateModal({
        title: 'Error', content: (
          <>
            <p>Your sign up didn't process correctly, please refresh the page and sign up again.</p>
          </>
        )
      });

      throw error;
    }
  }

  //Render role form control function (only needed if signup)
  const renderRole = () => {
    let options = [
      { label: 'Student', value: 'student' },
      { label: 'Teacher', value: 'teacher' }
    ]

    return (
      <div className="form-control dropdown">
        <Select name="role" options={options} onChange={handleSelectChange}
          className="select" placeholder="Select account type..." required />
      </div>
    )
  }

  const renderFirstname = () => {
    return (
      <div className="form-control">
        <input type="firstname" name="firstname" onChange={handleChange} autoComplete="off" required />
        <label htmlFor="firstname">First name</label>
      </div>
    )
  }

  const renderSurname = () => {
    return (
      <div className="form-control">
        <input type="surname" name="surname" onChange={handleChange} autoComplete="off" required />
        <label htmlFor="surname">Surname</label>
      </div>
    )
  }
  const renderPrefix = () => {
    let options = [
      { label: 'Mr', value: 'Mr' },
      { label: 'Mrs', value: 'Mrs' },
      { label: 'Miss', value: 'Miss' },
      { label: 'Ms', value: 'Ms' },
      { label: 'Mx', value: 'Mx' }
    ]

    return (
      <div className="form-control dropdown">
        <Select name="prefix" options={options} onChange={handleSelectChange}
          className="select" placeholder="Select prefix..." required />
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

        {isLogin ? null : renderFirstname()}

        {isLogin ? null : renderSurname()}

        <div className="form-control">
          <input type="password" name="password" onChange={handleChange} required />
          <label htmlFor="password">Password</label>
        </div>

        {isLogin ? null : renderRole()}

        {isLogin ? null : user.role === 'teacher' ? renderPrefix() : null}

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
