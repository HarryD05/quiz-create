//IMPORTING DEPENDENCIES
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//CREATING QUESTION SCHEMA (an object of the Schema class)
const QuizSchema = new Schema({
  questions: {
    type: [Schema.Types.ObjectId],
    ref: 'Question'
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks required']
  }
})

module.exports = Quiz = mongoose.model('Quiz', QuizSchema);