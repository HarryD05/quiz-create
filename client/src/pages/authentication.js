//React dependencies 
import React from 'react';

//Authentication functional component
const Authentication = props => {
  return (
    <div id="auth">
      <h2> Authentication page</h2>
      <p>This page with have a login or signup form</p>
    </div>
  );
}

export default Authentication;
//when authentication.js is imported in other files the
//Authentication functional component is what is accessed
