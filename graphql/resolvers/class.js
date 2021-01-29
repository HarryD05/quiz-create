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
        teacher: req.userId
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
  }
}
