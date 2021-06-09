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
  }
}