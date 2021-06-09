//importing react dependencies
import React, { createContext, useState } from 'react';

//importing services to make api calls
import AuthService from '../services/AuthService';

export const AuthContext = createContext();

export default (props) => {
  const { children } = props;

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = (token_, user_) => {
    setToken(token_);
    setUser(user_);
  }

  const logout = () => {
    setToken(null);
    setUser(null);
  }

  const updateUser = async () => {
    if (token === null) return;

    try {
      const currentUser = await AuthService.currentUser(token);
      setUser(currentUser);
    } catch (error) {
      throw error;
    }
  }

  return (
    <div>
      <AuthContext.Provider value={{ token, setToken, user, setUser, login, logout, updateUser }}>
        {children}
      </AuthContext.Provider>
    </div>
  )
}
