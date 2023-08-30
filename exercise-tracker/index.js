const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.json());

const mongoose = require('mongoose');
//mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://anonkekker:V7VEjKE5LVtd1SzD@cluster0.wrkcxvc.mongodb.net/exerciseTracker?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true });



const Schema = mongoose.Schema;

const nameSchema = new Schema({
  username: String
});
const username = mongoose.model("username", nameSchema);

const exerciseSchema = new Schema({
  user_id: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date
});
const Exercise = mongoose.model("Exercise", exerciseSchema);

//TRUNCATING 
/*
Name.deleteMany({}).then(function() {
  console.log("Data deleted"); // Success
}).catch(function(error) {
  console.log(error); // Failure
});
*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/api/users', async (req, res) => {

  const usernameDocument = {
    username: req.body.username
  };

  try {
    const result = await username.create(usernameDocument);
    console.log(result);
    res.json(result);
  } catch (err) {
    console.log(err);
  }
  //res.json({ username: result.username });
});



app.post('/api/users/:_id/exercises', async (req, res) => {
  const userID = req.params._id;
  const { description, duration, date } = req.body;

  try {
    const userFind = await username.findById(userID);
    console.log(userFind);
    if (!userFind) {
      res.send("No user found");
    }
    else {
      const exerciseInfoDocument = new Exercise({
        user_id: userFind._id,
        description: description,
        duration: duration,
        date: date ? new Date(date) : new Date() //empty = today's date
      });
      const exerciseSave = await exerciseInfoDocument.save();
      res.json({
        _id: userFind._id,
        username: userFind.username,
        description: exerciseSave.description,
        duration: exerciseSave.duration,
        date: new Date(exerciseSave.date).toDateString()
      });
    }
  } catch (err) {
    console.log(err);
    res.send("Error saving exercise info");
  }
});




app.get('/api/users', async (req, res) => {
  await username.find({}).then((users) => {
    res.json(users);
  });
})

app.get('/api/users/:_id/logs', async (req, res) => {
  const userID = req.params._id;
  const { from, to, limit } = req.query;
  const userFind = await username.findById(userID);
  if (!userFind) {
    res.send("User not found");
    return;
  }
  let dateObj = {};
  if (from) dateObj["$gte"] = new Date(from);  //maximum date search
  if (to) dateObj["$lte"] = new Date(to);      //minimum date search
  console.log(dateObj);  
  let filter = {
    user_id: userID
  }
  if (from || to) filter.date = dateObj; // now has correct format (date: {'$gte': dateZ })

  console.log(filter);
  const exercises = await Exercise.find(filter);

  
  let log = [];
  for (const objectIndex in exercises) {
    
    log.push({
    description: exercises[objectIndex].description,
    duration: exercises[objectIndex].duration,
    date: exercises[objectIndex].date.toDateString()
    });

  };
  

  res.json({
    username: userFind.username,
    count: exercises.length,
    _id: userFind._id,
    log
  });

  
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
