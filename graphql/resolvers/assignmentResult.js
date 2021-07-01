const AssignmentResult = require('../../models/AssignmentResultModel');
const Assignment = require('../../models/AssignmentModel');
const User = require('../../models/UserModel');
const Class = require('../../models/ClassModel');

const { transformResultById } = require('./helper');

//Returns the current date in correct format for db
const getDate = () => {
  //Getting a date string which is just the date with the time set to 00:00:00 with no timezone offset
  const dateString = new Date().toLocaleDateString();
  const dateParts = dateString.split('/');
  const dateValue = new Date(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]} 00:00:00 GMT+0000`);

  return dateValue;
}

module.exports = {
  completeAssignment: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('NOT AUTHENTICATED');
      }

      //Extracting input data from request
      const { initResult, completed, marks, timeTaken, answers, hints, assignment } = args.initResultInput;

      let resultData;

      //Find out if this is an update or a first time settig the result 
      if (initResult) {
        const newResult = new AssignmentResult({
          completed,
          marks,
          timeTaken,
          date: getDate(),
          answers,
          assignment,
          hints,
          student: req.userId
        });

        resultData = await newResult.save(); //Saving result to database

        //Saving the result to the student's data
        const student = await User.findById(req.userId);
        student.results.push(resultData._id);
        await student.save();

        //Saving the result to the class' data
        //first getting the class ID from the assignment data
        const assignmentData = await Assignment.findById(assignment);

        const currentClass = await Class.findById(assignmentData.class);
        currentClass.results.push(resultData._id);
        await currentClass.save();
      } else {
        //If not just update the fields that have values
        //First find the result being referenced (user from request and assignment) from arguements
        const result = await AssignmentResult.findOne({ assignment, student: req.userId });

        if (result === null || result === undefined) {
          throw new Error('NO RESULT FOR ASSIGNMENT');
        }

        //Updating the values that aren't empty
        result.completed = (completed === null || completed === undefined ? result.completed : completed);
        result.marks = (marks === null || marks === undefined ? result.marks : result.marks + marks);
        result.timeTaken = (timeTaken === null || timeTaken === undefined ? result.timeTaken : result.timeTaken + timeTaken);
        result.answers = (answers === null || answers === undefined ? result.answers : [...result.answers, ...answers]);
        result.hints = (hints === null || hints === undefined ? result.hints : [...result.hints, ...hints]);
        result.completed = (completed === null || completed === undefined ? result.completed : completed);
        result.date = getDate();

        //Saving the changes
        resultData = await result.save();
      }

      return transformResultById(resultData._id);
    } catch (error) {
      throw error;
    }
  }
}