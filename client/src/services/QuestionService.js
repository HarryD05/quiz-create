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
  }
}