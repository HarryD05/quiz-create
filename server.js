//IMPORTING DEPENDENCIES
const express = require('express'); //allows for creation of a backend server
const mongoose = require('mongoose'); //allows for connection to a database
const cors = require('cors'); //allows for api calls from different origins
const { graphqlHTTP } = require('express-graphql'); //allows for graphql as middleware
const path = require('path');

require('dotenv').config() //allows you to retrieve variables form the .env file

//IMPORTING THE GRAPHQL SCHEMA AND RESOLVERS 
const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');


//CREATING THE EXPRESS SERVER
const app = express();
app.use(express.json()); //allows the server to recieve json files as arguements
app.use(cors()); //allows the server to use the cors library

//MIDDLEWARE
app.use(require('./middleware/is-auth')); //uses the is-auth middleware

//Setting up the graphql middleware
app.use('/graphql', graphqlHTTP({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: true
}));

//linking the front and backend for production (when the webpage is hosted)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

//SETTING UP MONGOOSE
//process.env.MONGODB_URI is the uri where the database is hosted
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    //SETTING UP SERVER
    const PORT = process.env.PORT || 5000;
    //If there is a port in the environment variables (once hosted) it will be set to 
    //that if not the PORT is set to 5000

    app.listen(PORT, () => {
      console.log(`Connected to the database succesfully, server started on port ${PORT}`);
    });
  })
  .catch(error => {
    //This is executed if connecting to the database failed
    console.error(error);
  });

