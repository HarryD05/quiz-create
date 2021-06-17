//React dependencies 
import React from 'react';

//Importing styling
import './pages.scss';

//Quiz creation functional component
const QuizCreation = props => {

  return (
    <div id="quiz-creation" >
      <h2>Create new assignment</h2>

      <form id="assignment-form">
        <div id="assignment-details">

          <div id="left" className="side">
            <div className="form-control">
              <input type="text" name="title" autoComplete="off" required />
              <label htmlFor="title">Title</label>
            </div>

            <div className="form-control text-area">
              <textarea type="text" name="description" autoComplete="off" required />
              <label htmlFor="description">Description</label>
            </div>

            <div className="form-control">
              <input type="text" name="topic" autoComplete="off" required />
              <label htmlFor="topic">Topic</label>
            </div>
          </div>

          <div id="right" className="side">
            <table>
              <tbody>
                <tr>
                  <td>Selected class</td>
                  <td>N/A</td>
                </tr>
                <tr>
                  <td>Questions</td>
                  <td>N/A</td>
                </tr>
                <tr>
                  <td>Total marks</td>
                  <td>N/A</td>
                </tr>
              </tbody>
            </table>

            <div id="question-buttons">
              <button className="btn" type="button">Add question from bank</button>
              <button className="btn" type="button">Create and add new question</button>
            </div>
          </div>
        </div>

        <div id="all-questions">
          <div id="all-questions-header">
            <h3>Current questions</h3>
            <button className="btn" type="submit">Publish assignment</button>
          </div>

          <div id="current-questions"></div>
        </div>
      </form>
    </div>
  )
}

export default QuizCreation;
//when quiz_creation.js is imported in other files the
//QuizCreation functional component is what is accessed
