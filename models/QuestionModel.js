//IMPORTING DEPENDENCIES
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//CREATING QUESTION SCHEMA (an object of the Schema class)
const QuestionSchema = new Schema({
  question: {
    type: String,
    required: [true, 'Question required']
  },
  imageURL: {
    type: String
  },
  hint: {
    type: String
  },
  explanation: {
    type: String,
    required: [true, 'Explanation required']
  },
  qtype: {
    type: String,
    enum: [
      'multichoice',
      'short'
    ]
  },
  wrong: {
    type: [String]
  },
  correct: {
    type: String,
    required: [true, 'Correct answer required']
  },
  marks: {
    type: Number,
    required: [true, 'Marks required']
  },
  qualification: {
    type: String,
    required: [true, 'Qualification required']
  },
  subject: {
    type: String,
    required: [true, 'Subject required']
  },
  topic: {
    type: String,
    required: [true, 'Topic required']
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = Question = mongoose.model('Question', QuestionSchema);