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

    case '/teacher/home':
      title = 'Teacher homepage';
      content = (<ul>
        <li>There are 3 parts to the teacher homepage: the classes section, the student section and the create a class section.</li>
        <li>Your Classes</li>
        <ul>
          <li>Use the dropdown menu above the table to select one of your classes.</li>
          <li>The table below will update with the data linked to the selected class.</li>
          <li>The percentage next to the poorest/best topic is the average score this class achieves on questions of that topic.</li>
          <li>The 'see all assignments' button will bring up a popup displaying each assignment you have for the selected class which outlines the due date, average score achieved, students who haven't completed the assignment, students who have completed the assignment (and their mark) and each question is displayed with the average mark achieved. The popup has a dropdown menu where you can select which assignment you want to see, you can also select to see all assignments.</li>
          <li>The 'set new assignment' button will redirect you to the quiz creation page of the website.</li>
        </ul>
        <li>Your Students</li>
        <ul>
          <li>Use the dropdown menu above the table to select one of your classes.</li>
          <li>The table below will update with the data linked to the selected student.</li>
          <li>The percentage next to the poorest/best topic is the average score this student achieves on questions of that topic.</li>
          <li>The 'see all student's assignments' button will bring up a popup displaying each assignment you have set for this student which whether or not they have completed the assignment, their score, the time it took them (if you set the assignment to record the time), on which questions they used hints and their answers. The popup has a dropdown menu where you can select which assignment you want to see, you can also select to see all assignments</li>
        </ul>
        <li>Create a new class</li>
        <ul>
          <li>Below the 2 tables there is a form/input area to create a new class.</li>
          <li>There are 4 inputs needed to create a new class: class name, qualification (KS3, GCSE, A-level etc.), subject and joining code (which has to be unique so if it is already taken you will be asked try to again).</li>
          <li>You will then see a modal once you press create class stating whether the process of creating the class was successful.</li>
          <li>In order for students to join the class you will need to share the joining code with them.</li>
        </ul>
      </ul>);
      break;

    case '/teacher/create':
      title = 'Quiz creation page';
      content = (<ul>
        <li>Use this page to create a quiz for the class you had selected (you can check which class this is as it is displayed on the right of the page)</li>
        <li>On the left side of the page there are 3 inputs: the assignment title, the description of the assignment and the due date (unfortunately the timezones are slightly wrong so if it isn't GMT+0 it will be slightly off e.g. 1 hour earlier if BST).</li>
        <li>On the right side there are 3 pieces of information about the assignment: the class it is for, the number of questions in the assignment currently and the current total marks of the assignment.</li>
        <li>Adding questions - there are 2 buttons to add questions...</li>
        <ul>
          <li>Add question from bank - this will open a popup where all the questions ever made that are the same topic as the current class selected will be displayed, you can use the topright text input to search for key words in the question and if you click on a question it will be added to the current questions of the assignment.</li>
          <li>Create and add new question - this will open sub-page with a text form where you can input data to create a new question (the hint is optional) if you press back the question won't be saved and you will return to the main create assignment page or if you press add question the question will be saved to the database and added to you current questions of the assignment.</li>
        </ul>
        <li>Below horizontal lines all the current questions in the assignment are displayed, if you click on a question it will be removed from the list.</li>
        <li>Then if you press the publish assignment button and all the inputs are filled and there are some questions selected the assignment will be published to all your students and you will be redirected back to the teacher homepage.</li>
        <li>The questions are colour-coded: multiple choice is purple and short answer is green</li>
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
