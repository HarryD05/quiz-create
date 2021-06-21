const User = require("../../models/UserModel");
const Class = require("../../models/ClassModel");
const Question = require("../../models/QuestionModel");
const Assignment = require("../../models/AssignmentModel");
const AssignmentResult = require("../../models/AssignmentResultModel");


//Date helper
const transformDate = date => {
  return (date !== null) ? new Date(date) : null;
}


//User helpers
const transformUser = async userData => {
  return {
    ...userData._doc,
    classes: transformClasses.bind(this, userData._doc.classes),
    results: transformResults.bind(this, userData._doc.results)
  }
}

const transformUserById = async userID => {
  try {
    const userData = await User.findById(userID);

    return transformUser(userData);
  } catch (error) {
    throw error;
  }
}

const transformUsers = async userIDs => {
  try {
    const users = await User.find({ _id: { $in: userIDs } });

    const result = await Promise.all(users.map(async userData => {
      const userResult = await transformUser(userData);
      return userResult;
    }));

    return result;
  } catch (error) {
    throw error;
  }
}


//Class helpers
const transformClass = async classData => {
  return {
    ...classData._doc,
    teacher: transformUserById.bind(this, classData._doc.teacher),
    students: transformUsers.bind(this, classData._doc.students),
    assignments: transformAssignments.bind(this, classData._doc.assignments),
    results: transformResults.bind(this, classData._doc.results)
  }
}

const transformClassById = async classID => {
  try {
    const classData = await Class.findById(classID);

    return transformClass(classData);
  } catch (error) {
    throw error;
  }
}

const transformClasses = async classIDs => {
  try {
    const classes = await Class.find({ _id: { $in: classIDs } });

    const result = await Promise.all(classes.map(async classData => {
      const classResult = await transformClass(classData);
      return classResult;
    }));

    return result;
  } catch (error) {
    throw error;
  }
}


//Question helpers
const transformQuestion = async questionData => {
  return {
    ...questionData._doc,
    creator: transformUserById.bind(this, questionData._doc.creator)
  }
}

const transformQuestionById = async questionID => {
  try {
    const questionData = await Question.findById(questionID);

    return transformQuestion(questionData);
  } catch (error) {
    throw error;
  }
}

const transformQuestions = async questionIDs => {
  try {
    const questions = await Question.find({ _id: { $in: questionIDs } });

    const result = await Promise.all(questions.map(async questionData => {
      const questionResult = await transformQuestion(questionData);
      return questionResult;
    }));

    return result;
  } catch (error) {
    throw error
  }
}


//Assignment helpers
const transformAssignment = async assignmentData => {
  return {
    ...assignmentData._doc,
    dueDate: transformDate(assignmentData._doc.dueDate),
    questions: transformQuestions.bind(this, assignmentData._doc.questions),
    class: transformClassById.bind(this, assignmentData._doc.class)
  }
}

const transformAssignmentById = async assignmentID => {
  try {
    const assignmentData = await Assignment.findById(assignmentID);

    return transformAssignment(assignmentData);
  } catch (error) {
    throw error;
  }
}

const transformAssignments = async assignmentIDs => {
  try {
    const assignments = await Assignment.find({ _id: { $in: assignmentIDs } });

    const result = await Promise.all(assignments.map(async assignmentData => {
      const assignmentResult = await transformQuestion(assignmentData);
      return assignmentResult;
    }));

    return result;
  } catch (error) {
    throw error
  }
}



//Assignment-result helpers
const transformResult = async resultData => {
  return {
    ...resultData._doc,
    date: transformDate(resultData._doc.date),
    student: transformUserById.bind(this, resultData._doc.student),
    assignment: transformAssignmentById.bind(this, resultData._doc.assignment)
  }
}

const transformResultById = async resultID => {
  try {
    const resultData = await AssignmentResult.findById(resultID);

    return transformResult(resultData);
  } catch (error) {
    throw error;
  }
}

const transformResults = async resultIDs => {
  try {
    const results = await AssignmentResult.find({ _id: { $in: resultIDs } });

    const result = await Promise.all(results.map(async resultData => {
      const resultResult = await transformResult(resultData);
      return resultResult;
    }));

    return result;
  } catch (error) {
    throw error
  }
}


//Exporting helpers
exports.transformUsers = transformUsers;
exports.transformUserById = transformUserById;
exports.tranformClasses = transformClasses;
exports.transformClassById = transformClassById;
exports.transformQuestions = transformQuestions;
exports.transformQuestionById = transformQuestionById;
exports.transformAssignments = transformAssignments;
exports.transformAssignmentById = transformAssignmentById;
exports.transformResults = transformResults;
exports.transformResultById = transformResultById;
