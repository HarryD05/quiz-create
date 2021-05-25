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
          }
        }
      `
    };

    return await Service.sendRequest('currentUser', requestBody, token);
  }
}