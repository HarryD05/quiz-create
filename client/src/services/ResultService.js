import Service from './index';

export default {
  completeAssignment: async (resultInfo, token) => {
    const { marks, timeTaken, answers, hints, assignment } = resultInfo;

    const requestBody = {
      query: `
        mutation completeAssignment ($marks: Int!, $timeTaken: Int, $answers: [String]!, $hints: [Boolean]!, $assignment: ID!) {
          completeAssignment (initResultInput: {marks: $marks, timeTaken: $timeTaken, answers: $answers, hints: $hints, assignment: $assignment}) {
            _id
            marks
          }
        }
      `,
      variables: {
        marks,
        timeTaken,
        answers,
        hints,
        assignment
      }
    };

    return await Service.sendRequest('completeAssignment', requestBody, token);
  }
}