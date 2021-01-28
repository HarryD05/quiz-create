//IMPORTING DEPENDENCIES
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//CREATING CLASS SCHEMA (an object of the Schema class)
const ClassSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Class name required']
  },
  subject: {
    type: String,
    required: [true, 'Subject required']
  },
  qualification: {
    type: String,
    required: [true, 'Qualification required']
  },
  joiningCode: {
    type: String,
    required: [true, 'Joining code required'],
    unique: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher required']
  },
  students: {
    type: [Schema.Types.ObjectId],
    ref: 'Student'
  },
  assignments: {
    type: [Schema.Types.ObjectId],
    ref: 'Assignment'
  },
  results: {
    type: [Schema.Types.ObjectId],
    ref: 'Assignment-result'
  }
})

module.exports = Class = mongoose.model('Class', ClassSchema);