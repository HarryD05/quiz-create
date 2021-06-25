const Question = require('../../models/QuestionModel');

const { transformQuestions, transformQuestionById } = require('./helper');

module.exports = {
  questions: async (args, req) => {
    try {
      const allQuestions = await Question.find();

      return transformQuestions(allQuestions);
    } catch (error) {
      throw error;
    }
  },
  createQuestion: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('NOT AUTHENTICATED');
      }

      //Extracting input data from request
      const {
        question, qualification, subject, topic, hint, imageURL, explanation, qtype, wrong, correct, marks
      } = args.initQuestionInput;

      const newQuestion = new Question({
        question,
        qualification,
        subject,
        topic,
        hint,
        imageURL,
        explanation,
        qtype,
        wrong,
        correct,
        marks,
        creator: req.userId
      });

      const result = await newQuestion.save(); //Saving question to database

      return transformQuestionById(result._id);
    } catch (error) {
      throw error;
    }
  }
}
