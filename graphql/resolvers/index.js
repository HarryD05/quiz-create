const userResolver = require("./user");
const classResolver = require("./class");
const questionResolver = require("./question");
const assignmentResolver = require("./assignment");
const assignmentResultResolver = require("./assignmentResult");

const rootResolver = {
  ...userResolver,
  ...classResolver,
  ...questionResolver,
  ...assignmentResolver,
  ...assignmentResultResolver
};

module.exports = rootResolver;