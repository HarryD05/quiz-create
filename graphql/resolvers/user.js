//Dependencies
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Models
const User = require('../../models/UserModel');
const Class = require('../../models/ClassModel');

const { transformUserById, transformUsers } = require('./helper');

module.exports = {
  users: async (args, req) => {
    try {
      const allUsers = await User.find();

      return transformUsers(allUsers);
    } catch (error) {
      throw error;
    }
  },
  teachers: async (args, req) => {
    try {
      const allTeachers = await User.find({ role: 'teacher' });

      return transformUsers(allTeachers);
    } catch (error) {
      throw error;
    }
  },
  classStudents: async (args, req) => {
    try {
      const classResult = await Class.findById(args.classId);

      return transformUsers(classResult.students);
    } catch (error) {
      throw error;
    }
  },
  currentUser: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('NOT AUTHENTICATED');
    }

    try {
      return await transformUserById(req.userId);
    } catch (error) {
      throw error;
    }
  },
  login: async (args, req) => {
    //extracting the user inputs from the request
    const { username, password } = args.loginData;

    //Checking if there is a user with the same username
    const userResult = await User.findOne({ username });
    if (!userResult) {
      throw new Error('User does not exist');
    }

    //Checking if the password inputted matched the password linked to the username
    const isEqual = await bcrypt.compare(password, userResult.password);

    //Password doesn't match
    if (!isEqual) {
      throw new Error('Password is incorrect');
    }

    //User & password match - creating the jsonwebtoken with some user details
    const token = jwt.sign(
      { userId: userResult.id, username: userResult.username, role: userResult.role },
      process.env.secretOrKey,
      { expiresIn: '1h' }
    );

    return {
      userId: userResult.id,
      token: token,
      tokenExpiration: 1
    }
  },
  createUser: async (args, req) => {
    //extracting the details from the create user api call
    const { username, password, role } = args.initUserInput;

    try {
      //hashing the inputted password for security in the database
      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        username: username,
        password: hashedPassword,
        role: role
      });

      //adding the new user to the database
      const result = await newUser.save();

      //returning the new user data to the user, not returning the password for security
      return { ...result._doc, password: null };
    } catch (error) {
      throw error;
    }
  }
};