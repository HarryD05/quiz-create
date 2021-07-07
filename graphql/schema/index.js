const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type User {
    _id: ID!
    username: String!
    firstname: String!
    surname: String!
    prefix: String
    password: String
    role: String!
    classes: [Class]
    results: [AssignmentResult]
  }
  
  type Class {
    _id: ID!
    name: String!
    subject: String!
    qualification: String!
    joiningCode: String!
    teacher: User!
    students: [User]
    assignments: [Assignment]
    results: [AssignmentResult]
    high: [User]!
    mid: [User]!
    low: [User]!
  }

  type Question {
    _id: ID!
    question: String!
    qualification: String!
    subject: String! 
    topic: String!
    hint: String
    imageURL: String
    explanation: String!
    qtype: String!
    wrong: [String]!
    correct: [String]!
    marks: Int!
    creator: User!
  }

  type Assignment {
    _id: ID!
    title: String!
    description: String
    dueDate: String!
    maxMarks: Int!
    recordTime: Boolean!
    questions: [Question]!
    class: Class!
    expectedResults: [Int]
  }

  type AssignmentResult {
    _id: ID!
    completed: Boolean!
    marks: Int!
    date: String!
    answers: [String]!
    hints: [Boolean]!
    timeTaken: Int
    student: User!
    assignment: Assignment!
  }
  
  type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
  }


  input InitUserInput {
    firstname: String!
    surname: String!
    prefix: String
    username: String!
    password: String!
    role: String!
  }

  input LoginData {
    username: String!
    password: String!
  }

  input InitClassInput {
    name: String!
    subject: String!
    qualification: String!
    joiningCode: String!
  }

  input InitQuestionInput {
    question: String!
    qualification: String!
    subject: String!
    topic: String!
    hint: String
    imageURL: String
    explanation: String!
    qtype: String!
    wrong: [String]
    correct: [String]!
    marks: Int!
  }
  
  input InitAssignmentInput {
    title: String!
    description: String
    dueDate: String!
    maxMarks: Int!
    recordTime: Boolean!
    questions: [ID]!
    classID: ID!
    expectedResults: [Int]
  }

  input InitResultInput {
    initResult: Boolean!
    completed: Boolean!
    marks: Int!
    timeTaken: Int
    answers: [String]!
    hints: [Boolean]!
    assignment: ID!
  }

  input InitLevelInput {
    classID: ID!
    studentID: ID!
    level: String!
  }

  type RootQuery {
    users: [User]
    currentUser: User
    login(loginData: LoginData!): AuthData
    questions: [Question]
  }
  
  type RootMutation {
    createUser(initUserInput: InitUserInput!): User
    createClass(initClassInput: InitClassInput!): Class
    joinClass(joiningCode: String!): Class
    setStudentLevel(initLevelInput: InitLevelInput!): Class
    createQuestion(initQuestionInput: InitQuestionInput!): Question
    createAssignment(initAssignmentInput: InitAssignmentInput!): Assignment
    completeAssignment(initResultInput: InitResultInput!): AssignmentResult
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
