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
    const { firstname, surname, prefix, username, password, role } = user;

    const requestBody = {
      query: `
        mutation createUser($firstname: String!, $surname: String!, $prefix: String, $username: String!, $password: String!, $role: String!) {
          createUser(initUserInput: {firstname: $firstname, surname: $surname, prefix: $prefix, username: $username, password: $password, role: $role}) {
            _id
            firstname
            surname
            prefix
            username
            password
            role
          }
        }
      `,
      variables: {
        firstname,
        surname,
        prefix,
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
            firstname
            surname 
            prefix
            role
            results {
              _id
              marks
              timeTaken
              date
              answers
              hints
              completed
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
                  hint
                }
                class {
                  _id
                }
              }
            }
            classes {
              _id
              name
              subject
              qualification
              joiningCode
              teacher {
                _id
                username
                firstname
                surname 
                prefix
              }
              students {
                _id
                username
                firstname
                surname
              }
              high {
                _id
                username
                firstname
                surname
              }
              mid {
                _id
                username
                firstname
                surname
              }
              low {
                _id
                username
                firstname
                surname
              }
              results {
                _id
                marks
                timeTaken
                date
                answers
                hints
                completed
                student {
                  _id
                  username
                  firstname
                  surname 
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
                    explanation
                    hint
                  }
                  class {
                    _id
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
                  explanation
                  topic
                  hint
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