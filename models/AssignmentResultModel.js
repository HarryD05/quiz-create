//IMPORTING DEPENDENCIES
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//CREATING CLASS SCHEMA (an object of the Schema class)
const AssignmentResultSchema = new Schema({
  marks: {
    type: Number,
    required: [true, 'Marks required']
  },
  date: {
    type: Date,
    required: [true, 'Date required']
  },
  answers: {
    type: [String],
    required: [true, "Answers required"]
  },
  timeTaken: {
    type: Number
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student required']
  },
  assignment: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'assignment required']
  }
})

module.exports = AssignmentResult = mongoose.model('Assignment-result', AssignmentResultSchema);