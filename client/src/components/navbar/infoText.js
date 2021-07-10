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
          <li>The 'remove student from class' button will remove the currently selected student from the currently selected class, their result's data is still accessible in the see all assignments popup but they will no longer see the assignments you set</li>
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
          <li>Create and add new question - this will open sub-page with a text form where you can input data to create a new question (the hint is optional) if you press back the question won't be saved and you will return to the main create assignment page or if you press add question the question will be saved to the database and added to you current questions of the assignment. If the question has a short answer you can separate all the possible answers by using a semi colon e.g. "earthquake; earthquakes" would allow the 2 inputs to be correct.</li>
        </ul>
        <li>Below horizontal lines all the current questions in the assignment are displayed, if you click on a question it will be removed from the list.</li>
        <li>Then if you press the publish assignment button and all the inputs are filled and there are some questions selected the assignment will be published to all your students and you will be redirected back to the teacher homepage.</li>
        <li>The questions are colour-coded: multiple choice is purple and short answer is green</li>
      </ul>);
      break;

    case '/student/home':
      title = 'Student homepage';
      content = (<ul>
        <li>At the top right hand corner of the page there is the 'See all results' button, this will open a popup with a bar graph of all your results and you can select a to only see results from a specific class using the drop down menu above the graph.</li>
        <li>Below that there are 2 main sections: the assignments section and the classes section.</li>
        <li>Your assignments</li>
        <ul>
          <li>The left side of the homepage (or top half on a smaller device) displays a list of all your assignments in order of due date.</li>
          <li>If an assignment is red then you haven't completed it and the due date has passed so you need to complete it quickly.</li>
          <li>You can use the search bar below the 'Your assignments' heading to filter for specific assignments, the word/phrase you input is checked against lots of data about each assignment including the assignment title and description, the questions etc.</li>
          <li>You can use the 3 buttons below the search bar to select what assignments you want to see: all, completed or still to do (assignments that haven't been completed yet - either not started or partially complete).</li>
          <li>Pressing the 'See results' button will open a popup giving some details about your result for that assignment including your answers and below an explanation of the correct answer.</li>
          <li>Pressing the 'Start assignment' button will redirect you to the quiz completion page where you can complete the quiz.</li>
          <li>Pressing the 'Continue assignment' button will redirect you to the quiz completion page where you can continue the assignment from where you last left it.</li>
        </ul>
        <li>Your classes</li>
        <ul>
          <li>The right side of the homepage (or bottom half on a smaller device) displays a list of all the classes you are in with some information about each class.</li>
          <li>You can use the text input below the 'Your classes' heading to input a class joining code given to you by a teacher allowing you to join a class, once you press join class the class will be added to your list and all the class' assignments will appear on the left side of the homepage.</li>
          <li>If you click on a class card it will select the class so only assignments from that class will be displayed in the 'Your assignments' list, to deselect the class just click on the class card again or click on another class.</li>
        </ul>
      </ul>);
      break;

    case '/student/quiz':
      title = 'Quiz page';
      content = (<ul>
        <li>When you first are redirected to this page you will see the welcome screen which displays the assignment title, description, number of questions, number of marks and whether or not the time it takes you to complete the assignment will be recorded. Here if you decided not to complete the assignment you can press the home button in the top left to return to the student homepage or if you want to start the quiz you press the 'Start' button.</li>
        <li>Once you have pressed the start button the quiz will begin (if the time is being recorded the timer will begin) you will see the assignment title in the top left and your current question and current marks in the top left. Then below that you will see the question and the number of marks it is worth in square brackets e.g. [2]. If the question has a hint you will see the 'Hint' button, if you press that you will see the hint but it will be recorded that you used the hint (you can open the hint as many times as you want).</li>
        <li>Below the question is the answer space which will either be a text input or if the question is multiple choice 2-4 boxed for you to select from, the option you select in multiple choice will be highlighted in blue. </li>
        <li>When you submit a question you will then see immediately if it is correct or incorrect accompanied with an explanation of the correct answer. This answer will be stored so that if you leave the page when you next try to complete the assignment you will start from where you left off.</li>
        <li>Once you submit the last question you will see the 'Complete assignment' button instead of 'Next question' in the bottom right, once you press 'Complete assignment' you result will be stored and you will return to the student homepage.</li>
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
