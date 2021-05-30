//Importing react so JSX can be exported
import React from 'react';

const getInfoText = path => {
  let title, content; //variable will hold the outputted info

  switch (path) {
    case '/auth':
      title = 'Authenication page';
      content = (<ul>
        <li>select if you want to login or signup using the 2 option buttons at the top of the input box.</li>
        <li>you have to fill in all input boxes (and choose either student or teacher when signing up so your account is setup correctly).</li>
        <li>if you input valid login details you will be  logged in and redirected to the student or teacher homepage depending on the type of account.</li>
        <li>if you input valid signup details (the user doesn't already exist) the account will be stored then you will be logged in and redirected to the student or teacher homepage depending on the type of account.</li>
      </ul>);
      break;

    default:
      title = 'Unknown';
      content = (<p>No info for this page!</p>);
      break;
  }

  return { title, content };
}

export default getInfoText;
