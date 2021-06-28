import Service from './index';

export default {
  createClass: async (classInfo, token) => {
    const { name, subject, qualification, joiningCode } = classInfo;

    const requestBody = {
      query: `
        mutation createClass ($name: String!, $subject: String!, $qualification: String!, $joiningCode: String!) {
          createClass (initClassInput: {name: $name, subject: $subject, qualification: $qualification, joiningCode: $joiningCode}) {
            _id
            name
            subject
            qualification 
            joiningCode
          }
        }
      `,
      variables: {
        name,
        subject,
        qualification,
        joiningCode
      }
    };

    return await Service.sendRequest('createClass', requestBody, token);
  },
  joinClass: async (joiningCode, token) => {
    const requestBody = {
      query: `
        mutation joinClass ($joiningCode: String!) {
          joinClass (joiningCode: $joiningCode) {
            _id
            name
          }
        }
      `,
      variables: {
        joiningCode
      }
    };

    return await Service.sendRequest('joinClass', requestBody, token);
  },
  setStudentLevel: async (info, token) => {
    //Extracting the required data for the API call from the input
    const { classID, studentID, level } = info;

    //Creating the graphQL call
    const requestBody = {
      query: `
        mutation setStudentLevel ($classID: ID!, $studentID: ID!, $level: String!) {
          setStudentLevel (initLevelInput: {classID: $classID, studentID: $studentID, level: $level}) {
            _id
            name
            high {
              username
            }
            mid {
              username
            }
            low {
              username
            }
          }
        }
      `,
      variables: {
        classID,
        studentID,
        level
      }
    }

    return await Service.sendRequest('setStudentLevel', requestBody, token);
  }
}