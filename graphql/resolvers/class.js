const Class = require('../../models/ClassModel');
const User = require('../../models/UserModel');

const { transformClasses, transformClassById } = require('./helper');

module.exports = {
  classes: async (args, req) => {
    try {
      const allClasses = await Class.find();

      return transformClasses(allClasses);
    } catch (error) {
      throw error;
    }
  },
  createClass: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('NOT AUTHENTICATED');
      }

      //Extracting the user input from the request
      const { name, qualification, subject, joiningCode } = args.initClassInput;

      //Checking if the joiningCode inputted already exists
      const clashes = await Class.findOne({ joiningCode });
      if (clashes) {
        throw new Error('JOINING CODE ALREADY EXISTS, TRY AGAIN');
      }

      const newClass = new Class({
        name,
        qualification,
        subject,
        joiningCode,
        teacher: req.userId,
        high: [],
        mid: [],
        low: []
      });

      const result = await newClass.save(); //adding class to database

      //Saving the class to the teacher's data
      const teacher = await User.findById(req.userId);
      teacher.classes.push(result._id);
      await teacher.save();

      return transformClassById(result._id);
    } catch (error) {
      throw error;
    }
  },
  joinClass: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('NOT AUTHENTICATED');
      }

      //Retrieving the joining code from the request
      const { joiningCode } = args;

      //Finding the linked class
      const targetClass = await Class.findOne({ joiningCode });

      if (!targetClass) {
        throw new Error('INVALID JOINING CODE');
      }

      //Checking if the student is already in the class
      if (targetClass.students.indexOf(req.userId) !== -1) {
        throw new Error('Already in class');
      }

      //Adds student to class' student list
      targetClass.students.push(req.userId);
      const result = await targetClass.save();

      //Add class to student's class list
      const student = await User.findById(req.userId);
      student.classes.push(result._id);
      await student.save();

      return transformClassById(result._id);
    } catch (error) {
      throw error;
    }
  },
  setStudentLevel: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('NOT AUTHENTICATED');
      }

      //Retrieving the class and student ID and desired level from the request
      const { classID, studentID, level } = args.initLevelInput;

      //Finding the linked class
      const targetClass = await Class.findById(classID);

      if (!targetClass) {
        throw new Error('INVALID CLASS ID');
      }

      //Before adding the student into a list, need to check if the student
      //is in a different attainmnet level list and remove them from it
      if (targetClass.high.indexOf(studentID) !== -1) {
        targetClass.high.splice(targetClass.high.indexOf(studentID), 1);
      }

      if (targetClass.mid.indexOf(studentID) !== -1) {
        targetClass.mid.splice(targetClass.mid.indexOf(studentID), 1);
      }

      if (targetClass.low.indexOf(studentID) !== -1) {
        targetClass.low.splice(targetClass.low.indexOf(studentID), 1);
      }

      //Adding the student to the correct attainment level
      switch (level) {
        case 'high':
          targetClass.high.push(studentID);
          break;

        case 'mid':
          targetClass.mid.push(studentID);
          break;

        case 'low':
          targetClass.low.push(studentID);
          break;
      }

      const result = await targetClass.save();

      //Returning the updated class
      return transformClassById(result._id);
    } catch (error) {
      throw error;
    }
  },
  removeStudent: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('NOT AUTHENTICATED');
      }

      //Retrieving the class and student ID and desired level from the request
      const { classID, studentID } = args.removeStudentInput;

      //Finding the linked class
      const targetClass = await Class.findById(classID);

      //If no class then throw error
      if (!targetClass) {
        throw new Error('INVALID CLASS ID');
      }

      //Removing the student from the class' student array
      const targetIndex = targetClass.students.indexOf(studentID);

      //if the student isn't in the class' student array, throw error
      if (targetIndex === -1) {
        throw new Error('STUDENT NOT IN CLASS');
      }

      //Removing the student from the class' student array
      targetClass.students.splice(targetIndex, 1);

      //Removing the student from any attainment array  they are in
      if (targetClass.low.indexOf(studentID) !== -1) {
        targetClass.low.splice(targetClass.low.indexOf(studentID), 1);
      } else if (targetClass.mid.indexOf(studentID) !== -1) {
        targetClass.mid.splice(targetClass.mid.indexOf(studentID), 1);
      } else if (targetClass.high.indexOf(studentID) !== -1) {
        targetClass.high.splice(targetClass.high.indexOf(studentID), 1);
      }

      //Saving the class in the database
      const result = await targetClass.save();

      //Removing the class ID from the student's class array
      const targetStudent = await User.findById(studentID);

      //If no student then the ID is invalid, throw error
      if (!targetStudent) {
        throw new Error('INVALID STUDENT ID');
      }

      //Retrieving the index of the class in the student's class array
      const classIndex = targetStudent.classes.indexOf(classID);

      //If the class isn't in the array throw error
      if (classIndex === -1) {
        throw new Error('CLASS NOT IN STUDENT\'S CLASS ARRAY');
      }

      //Updating the student's class array (removing the class) and saving in DB
      targetStudent.classes.splice(classIndex, 1);
      await targetStudent.save();

      //Returning the updated class
      return transformClassById(result._id);
    } catch (error) {
      throw error;
    }
  }
}
