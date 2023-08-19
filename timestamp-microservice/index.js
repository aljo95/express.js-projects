// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// When date is passed. ex: url/api/1451001600000 for unix time
// or: url/api/2015-12-25 for normal time format
app.get("/api/:date", function (req, res) {
  
  let urlDate = new Date(req.params.date);

  // if api/date is invalid. Parse and try again
  if (urlDate.toUTCString() === "Invalid Date") {
    urlDate = new Date(parseInt(req.params.date));
  }

  // Trying again after parsing date to int
  // if still invalid respond with error
  if (urlDate.toUTCString() === "Invalid Date") {
    res.json({ error: "Invalid Date" });
    return;
  }

  res.json ({
    unix: urlDate.getTime(),
    utc: urlDate.toUTCString()
  });
  
});

// When no date is passed. Just url/api
app.get("/api", function (req, res) {
  
  res.json({
    unix: new Date().getTime(),
    utc: new Date().toUTCString()
  })
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
