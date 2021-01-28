const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type User {
    _id: ID!
    username: String!
    password: String!
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
  }

  type Question {
    _id: ID!
    question: String!
    topic: String!
    hint: String
    explanation: String!
    qtype: String!
    wrong: [String]!
    correct: String!
    marks: Int!
    creator: User!
  }

  type Assignment {
    _id: ID!
    title: String!
    description: String
    dueDate: String!
    maxMarks: Int!
    questions: [Question]!
    class: Class!
  }

  type AssignmentResult {
    _id: ID!
    marks: Int!
    date: String!
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
    hint: String
    explanation: String!
    qtype: String!
    wrong: [String]!
    correct: String!
    marks: Int!
  }
  
  input InitAssignmentInput {
    title: String!
    description: String
    dueDate: String!
    maxMarks: Int!
    questions: [ID]!
    classID: ID!
  }

  input InitResultInput {
    marks: Int!
    timeTaken: Int
    assignment: ID!
  }

  type RootQuery {
    users: [User]
    teachers: [User]
    classStudents(classId: ID!): [User]
    currentUser: User
    login(loginData: LoginData!): AuthData
    classes: [Class]
    questions: [Question]
  }
  
  type RootMutation {
    createUser(initUserInput: InitUserInput!): User
    createClass(initClassInput: InitClassInput!): Class
    joinClass(joiningCode: String!): Class
    createQuestion(initQuestionInput: InitQuestionInput!): Question
    createAssignment(initAssignmentInput: InitAssignmentInput!): Assignment
    completeAssignment(initResultInput: InitResultInput!): AssignmentResult
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
