import React, { createContext, useState } from 'react';

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

  return (
    <div>
      <AuthContext.Provider value={{ token, setToken, user, setUser, login, logout }}>
        {children}
      </AuthContext.Provider>
    </div>
  )
}
