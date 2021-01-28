const Assignment = require('../../models/AssignmentModel');
const Class = require('./../../models/ClassModel');

const { transformAssignmentById } = require('./helper');

module.exports = {
  createAssignment: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('NOT AUTHENTICATED');
      }

      //Extracting input data from request
      const {
        title, description, dueDate, maxMarks, questions, classID
      } = args.initAssignmentInput;

      const newAssignment = new Assignment({
        title,
        description,
        dueDate: new Date(dueDate),
        maxMarks,
        questions,
        class: classID
      });

      const result = await newAssignment.save(); //Saving assignment to database

      //Adding the assignment to the class' assignment list
      const currentClass = Class.findById(classID);
      currentClass.assignments.push(result._id);
      await currentClass.save();
      //Saving the class with the assignment to the database

      return transformAssignmentById(result._id);
    } catch (error) {
      throw error;
    }
  }
}
