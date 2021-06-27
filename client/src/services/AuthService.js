import Service from './index';

export default {
  login: async user => {
    const { username, password } = user;

    const requestBody = {
      query: `
        query Login($username: String!, $password: String!) {
          login(loginData: {username: $username, password: $password}) {
            userId
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        username,
        password
      }
    };

    return await Service.sendRequest('login', requestBody, null);
  },
  signup: async user => {
    const { username, password, role } = user;

    const requestBody = {
      query: `
        mutation createUser($username: String!, $password: String!, $role: String!) {
          createUser(initUserInput: {username: $username, password: $password, role: $role}) {
            _id
            username
            password
            role
          }
        }
      `,
      variables: {
        username,
        password,
        role
      }
    };

    return await Service.sendRequest('createUser', requestBody, null);
  },
  currentUser: async token => {
    const requestBody = {
      query: `
        query {
          currentUser {
            _id
            username
            role
            results {
              _id
              marks
              timeTaken
              date
              answers
              hints
              assignment {
                _id
                title
                dueDate
                maxMarks
                recordTime
                expectedResults
                questions {
                  question
                  imageURL
                  topic
                  correct
                  marks
                }
              }
            }
            classes {
              _id
              name
              subject
              qualification
              joiningCode
              students {
                _id
                username
              }
              high {
                _id
                username
              }
              mid {
                _id
                username
              }
              low {
                _id
                username
              }
              results {
                _id
                marks
                timeTaken
                date
                answers
                hints
                student {
                  _id
                  username
                }
                assignment {
                  _id
                  title
                  dueDate
                  maxMarks
                  recordTime
                  expectedResults
                  questions {
                    question
                    imageURL
                    topic
                    correct
                    marks
                  }
                }
              }
              assignments {
                _id
                title
                description
                dueDate
                maxMarks
                recordTime
                expectedResults
                questions {
                  question
                  imageURL
                  qtype
                  marks
                  correct
                  wrong
                }
                class {
                  _id 
                  name
                  subject
                  qualification
                }
              }
            }
          }
        }
      `
    };

    return await Service.sendRequest('currentUser', requestBody, token);
  }
}