import Service from './index';

export default {
  createAssignment: async (assignmentInfo, token) => {
    const { title, description, dueDate, maxMarks, recordTime, questions, classID } = assignmentInfo;

    const requestBody = {
      query: `
        mutation createAssignment ($title: String!, $description: String!, $dueDate: String!, $maxMarks: Int!, $recordTime: Boolean!, $questions: [ID]!, $classID: ID!) {
          createAssignment (initAssignmentInput: {title: $title, description: $description, dueDate: $dueDate, maxMarks: $maxMarks, recordTime: $recordTime, questions: $questions, classID: $classID}) {
            _id
            title
            description
            dueDate
            maxMarks
            recordTime
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
        classID
      }
    };

    return await Service.sendRequest('createAssignment', requestBody, token);
  }
}
