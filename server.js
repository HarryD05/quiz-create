//IMPORTING DEPENDENCIES
const express = require('express'); //allows for creation of a backend server
const mongoose = require('mongoose'); //allows for connection to a database
const cors = require('cors'); //allows for api calls from different origins
require('dotenv').config() //allows you to retrieve variables form the .env file

//CREATING THE EXPRESS SERVER
const app = express();
app.use(express.json()); //allows the server to recieve json files as arguements
app.use(cors()); //allows the server to use the cors library


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
  .catch((error) => {
    //This is executed if connecting to the database failed
    console.error(error);
  });

