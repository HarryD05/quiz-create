//Importing react so JSX can be exported
import React from 'react';

const getInfoText = path => {
  let title, content; //variable will hold the outputted info

  switch (path) {
    case '/auth':
      title = 'Authenication page';
      content = (<ul>
        <li>select if you want to login or signup using the 2 options at the top of the box</li>
        <li>you have to fill in all input boxes</li>
        <li>if you input login data for a user in the database you will be  logged in and redirected to the homepage(teacher or student)</li>
        <li>if you input signup data which is valid(the user doesn'talready exist) the account will be stored then you will be logged in and redirected to the homepage</li>
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
