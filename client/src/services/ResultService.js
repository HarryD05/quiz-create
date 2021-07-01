import Service from './index';

export default {
  completeAssignment: async (resultInfo, token) => {
    const { initResult, completed, marks, timeTaken, answers, hints, assignment } = resultInfo;

    const requestBody = {
      query: `
        mutation completeAssignment ($initResult: Boolean!, $completed: Boolean!, $marks: Int!, $timeTaken: Int, $answers: [String]!, $hints: [Boolean]!, $assignment: ID!) {
          completeAssignment (initResultInput: {initResult: $initResult, completed: $completed, marks: $marks, timeTaken: $timeTaken, answers: $answers, hints: $hints, assignment: $assignment}) {
            _id
            marks
          }
        }
      `,
      variables: {
        initResult,
        completed,
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
