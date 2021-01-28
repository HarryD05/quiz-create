//IMPORTING DEPENDENCIES
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//CREATING USER SCHEMA (an object of the Schema class)
const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username required'],
    unique: [true, 'Username must be unique']
  },
  password: {
    type: String,
    required: [true, 'Password required']
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: [true, 'Role required']
  },
  classes: {
    type: [Schema.Types.ObjectId],
    ref: 'Class'
  },
  results: {
    type: [Schema.Types.ObjectId],
    ref: 'Assignment-result'
  }
})

module.exports = User = mongoose.model('User', UserSchema);