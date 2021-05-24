//name is the resolver that is being used
//requestBody is the graphQL request which outlines the data needed and wanted
//token (by default null) can hold the Jsonwebtoken if the user is authorized

export default {
  sendRequest: async (name, requestBody, token = null) => {
    let headers = {
      'Content-Type': 'application/json'
    } //this objects holds the data that will accompany the request

    if (token !== null) {
      headers['Authorization'] = `Bearer ${token}`;
    } //adding the authorization header to the request

    let url = 'http://localhost:5000/graphql';
    if (process.env.NODE_ENV === 'production') {
      url = '/graphql'
    }
    let output;

    //method POST is used as all graphQL requests are POST not GET
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed');
        }

        return res.json();
      })
      .then(result => {
        output = result.data[name];
      })
      .catch(error => {
        console.error(error);
      });

    return output;
  }
}