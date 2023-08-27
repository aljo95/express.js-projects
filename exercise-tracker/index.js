const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

var bodyParser = require('body-parser')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.json());

var mongoose = require('mongoose');

mongoose.connect(process.env.DB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true });



var Schema = mongoose.Schema;

var nameSchema = new Schema({
  username: String
});

let Name;
Name = mongoose.model("Name", nameSchema);

/*     TRUNCATING 
Url.deleteMany({}).then(function() {
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

  const result = await Name.create(usernameDocument);

  res.json({ username: result.username });
});



app.get('/api/users', (req, res) => {
  Name.find({}).then((users) => {
    res.json(users);
  });
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
