import Service from './index';

export default {
  createAssignment: async (assignmentInfo, token) => {
    const { title, description, dueDate, maxMarks, recordTime, questions, classID, expectedResults } = assignmentInfo;

    const requestBody = {
      query: `
        mutation createAssignment ($title: String!, $description: String!, $dueDate: String!, $maxMarks: Int!, $recordTime: Boolean!, $expectedResults: [Int], $questions: [ID]!, $classID: ID!) {
          createAssignment (initAssignmentInput: {title: $title, description: $description, dueDate: $dueDate, maxMarks: $maxMarks, recordTime: $recordTime, expectedResults: $expectedResults, questions: $questions, classID: $classID}) {
            _id
            title
            description
            dueDate
            maxMarks
            recordTime
            expectedResults
            questions {
              _id
              question
            }
            class {
              _id 
              name
            }
          }
        }
      `,
      variables: {
        title,
        description,
        dueDate,
        maxMarks,
        recordTime,
        questions,
        expectedResults,
        classID
      }
    };

    return await Service.sendRequest('createAssignment', requestBody, token);
  }
}
