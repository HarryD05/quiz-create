const AssignmentResult = require('../../models/AssignmentResultModel');
const Assignment = require('../../models/AssignmentModel');
const User = require('../../models/UserModel');
const Class = require('../../models/ClassModel');

const { transformResultById } = require('./helper');

module.exports = {
  completeAssignment: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('NOT AUTHENTICATED');
      }

      //Extracting input data from request
      const { marks, timeTaken, answers, hints, assignment } = args.initResultInput;

      const newResult = new AssignmentResult({
        marks,
        timeTaken,
        date: new Date(),
        answers,
        assignment,
        hints,
        student: req.userId
      });

      const result = await newResult.save(); //Saving result to database

      //Saving the result to the student's data
      const student = await User.findById(req.userId);
      student.results.push(result._id);
      await student.save();

      //Saving the result to the class' data
      //first getting the class ID from the assignment data
      const assignmentData = await Assignment.findById(assignment);

      const currentClass = await Class.findById(assignmentData.class);
      currentClass.results.push(result._id);
      await currentClass.save();

      return transformResultById(result._id);
    } catch (error) {
      throw error;
    }
  }
}
