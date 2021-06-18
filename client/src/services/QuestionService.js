import Service from './index';

export default {
  questions: async () => {
    const requestBody = {
      query: `
        query {
          questions {
            _id
            question
            qualification
            subject
            topic
            hint
            explanation
            qtype
            wrong
            correct
            marks
            creator {
              username
            }
          }
        }
      `
    };

    return await Service.sendRequest('questions', requestBody);
  },
  createQuestion: async (questionInfo, token) => {
    const { question, qualification, subject, topic, hint, explanation, qtype, wrong, correct, marks } = questionInfo;

    const requestBody = {
      query: `
        mutation createQuestion ($question: String!, $qualification: String!, $subject: String!, $topic: String!, $hint: String, $explanation: String!, $qtype: String!, $wrong: [String], $correct: String!, $marks: Int!) {
          createQuestion (initQuestionInput: {question: $question, qualification: $qualification, subject: $subject, topic: $topic, hint: $hint, explanation: $explanation, qtype: $qtype, wrong: $wrong, correct: $correct, marks: $marks}) {
            _id
            question
            qualification
            subject
            topic
            hint
            explanation
            qtype
            wrong
            correct
            marks
            creator {
              username
            }
          }
        }
      `,
      variables: {
        question,
        qualification,
        subject,
        topic,
        hint,
        explanation,
        qtype,
        wrong,
        correct,
        marks
      }
    };

    return await Service.sendRequest('createQuestion', requestBody, token);
  }
}