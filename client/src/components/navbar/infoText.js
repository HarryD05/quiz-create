const getInfoText = path => {
  let text; //variable will hold the outputted info

  switch (path) {
    case '/auth':
      text = `This is the authentication page.
      - select if you want to login or signup using the 2 options at the top of the box
      - you have to fill in all input boxes
      - if you input login data for a user in the database you will be  logged in and redirected to the homepage (teacher or student)
      - if you input signup data which is valid (the user doesn'talready exist) the account will be stored then you will be logged in and redirected to the homepage`
      break;

    default:
      text = `There is no info for this page`
  }

  return text;
}

export default getInfoText;
