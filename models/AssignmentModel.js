//IMPORTING DEPENDENCIES
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//CREATING CLASS SCHEMA (an object of the Schema class)
const AssignmentSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title required']
  },
  description: {
    type: String
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date required']
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks required']
  },
  recordTime: {
    type: Boolean,
    require: [true, 'Record time is required']
  },
  expectedResults: {
    type: [Number]
  },
  questions: {
    type: [Schema.Types.ObjectId],
    ref: 'Question',
    required: [true, 'Questions required']
  },
  class: {
    type: Schema.Types.ObjectId,
    req: 'Class',
    required: [true, 'Class required']
  }
})

module.exports = Assignment = mongoose.model('Assignment', AssignmentSchema);
