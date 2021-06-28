//importing react dependencies
import React, { createContext, useState } from 'react';

//importing services to make api calls
import AuthService from '../services/AuthService';

export const AuthContext = createContext();

export default (props) => {
  const { children } = props;

  //Setting up the state, variables which will be stored
  //in the context (accessible by other components)
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [assignment, setAssignment] = useState(null);

  //Authentication functions
  //Updates the current user details 
  const login = (token_, user_) => {
    setToken(token_);
    setUser(user_);
  }

  //Resets the current user details
  const logout = () => {
    setToken(null);
    setUser(null);
  }

  //Retrieves the updated data from the database about the current user
  const updateUser = async () => {
    if (token === null) return;

    try {
      const currentUser = await AuthService.currentUser(token);
      setUser(currentUser);
    } catch (error) {
      throw error;
    }
  }

  //Sets the selected class to null 
  const resetSelectedClass = () => {
    setSelectedClass(null);
  }

  //Sets the current assignment
  const updateAssignment = assignment_ => {
    setAssignment(assignment_);
  }

  //Sets the current assignment to null
  const clearAssignment = () => {
    setAssignment(null);
  }

  return (
    <div>
      <AuthContext.Provider value={
        {
          token, setToken, user, setUser, login, logout, updateUser,
          selectedClass, setSelectedClass, resetSelectedClass,
          assignment, updateAssignment, clearAssignment
        }
      }>
        {children}
      </AuthContext.Provider>
    </div>
  )
}
