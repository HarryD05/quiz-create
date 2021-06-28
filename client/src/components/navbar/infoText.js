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
          <li>The 'set new assignment' button will redirect you to the quiz creation page of the website, where you can create an assignment using questions from a bank of questions (all questions other teachers have made in your subject) or your own question then assign them to the selected class or print the quiz out instead.</li>
          <li>The 'export class data' button will download a .csv file of the currently selected class' results.</li>
          <li>The 'see class graphs' button will open a popup with a few graphs analysing the currently selected class's assignments and results.</li>
        </ul>
        <li>Your Students</li>
        <ul>
          <li>Use the dropdown menu above the table to select one of your classes.</li>
          <li>The table below will update with the data linked to the selected student.</li>
          <li>The percentage next to the poorest/best topic is the average score this student achieves on questions of that topic.</li>
          <li>The 'see all student's assignments' button will bring up a popup displaying each assignment you have set for this student which whether or not they have completed the assignment, their score, the time it took them (if you set the assignment to record the time), on which questions they used hints and their answers. The popup has a dropdown menu where you can select which assignment you want to see, you can also select to see all assignments</li>
          <li>The attainment level is used to categorise the class into levels especially useful for mixed ability groups, use the dropdown selector to update the currently selected student's attainment level (high, mid or low) by pressing the 'change attainment level' button below the dropdown menu.</li>
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
        <li>On the left side of the page there are 4 inputs: the assignment title, the description of the assignment, record time taken (blue tick is yes, blank is no) and the due date of the assignment (the exact time is ignored).</li>
        <li>On the right side there are 3 pieces of information about the assignment: the class it is for, the number of questions in the assignment currently and the current total marks of the assignment.</li>
        <li>Adding questions - there are 2 buttons to add questions...</li>
        <ul>
          <li>Add question from bank - this will open a popup where all the questions ever made that are the same subject as the current class selected will be displayed, you can use the topright text input to search for key words in the question (including the topic, explanation and hint of the question) and if you click on a question it will be added to the current questions of the assignment.</li>
          <li>Create and add new question - this will open sub-page with a text form where you can input data to create a new question (the hint is optional) if you press back the question won't be saved and you will return to the main create assignment page or if you press add question the question will be saved to the database and added to you current questions of the assignment.</li>
        </ul>
        <li>Below horizontal lines all the current questions in the assignment are displayed, if you click on a question it will be removed from the list.</li>
        <li>Then if you press the publish assignment button and all the inputs are filled and there are some questions selected the assignment will be published to all your students and you will be redirected back to the teacher homepage.</li>
        <li>The questions are colour-coded: multiple choice is purple and short answer is green</li>
      </ul>);
      break;

    case '/student/home':
      title = 'Student homepage';
      content = (<ul>
        <li>There are 2 main sections of the student homepage: the assignments section and the classes section.</li>
        <li>Your assignments</li>
        <ul>
          <li>The left side of the homepage displays a list of all your assignments in order of due date.</li>
          <li>If an assignment is red then you haven't completed it and the due date has passed so you need to complete it quickly.</li>
          <li>You can use the search bar below the 'Your assignments' heading to search for specific assignments, the word/phrase you input is checked against lots of data about each assignment including the assignment title and description, the questions etc.</li>
          <li>Pressing the 'See results' button will open a popup giving some details about your result for that assignment including your answers and below an explanation of the correct answer.</li>
          <li>Pressing the 'Complete assignment' button will redirect you to the quiz completion page where you can complete the quiz.</li>
        </ul>
        <li>Your classes</li>
        <ul>
          <li>The right side of the homepage displays a list of all the classes you are in with some information about each class.</li>
          <li>You can use the text input below the 'Your classes' heading to input a class joining code given to you by a teacher allowing you to join a class, once you press join class the class will be added to your list and all the class' assignments will appear on the left side of the homepage.</li>
        </ul>
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
