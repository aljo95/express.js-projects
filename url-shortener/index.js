require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser');

const dns = require('dns');

const urlParser = require('url');

var mongoose = require('mongoose'); 
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });



var Schema = mongoose.Schema;

var urlSchema = new Schema({
  url: String,
  short_url: Number
});

let Url;
Url = mongoose.model("Url", urlSchema);

/*     TRUNCATING 
Url.deleteMany({}).then(function() {
  console.log("Data deleted"); // Success
}).catch(function(error) {
  console.log(error); // Failure
});
*/


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Basic Configuration
//const port = process.env.PORT || 3000;
const port = process.env.PORT;
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});



app.use(bodyParser.json());




console.log("hello");
app.post('/api/shorturl', function(req, res) {
  console.log(req.body);

  let urlBody = req.body.url;
  //if req.body is ex: 'https://www.google.com/something'
  //then we need to parse it in order to do dns.lookup and get the ip address
  //dns lookup will only look up "www.google.com", does not work with the other url parts
  //must remove https:// and any following paths, queries etc!
  if (urlBody[0] === "w") {
    urlBody = "https://" + urlBody;
  }
  let hostNameOnly = urlParser.parse(urlBody).host;
  console.log(hostNameOnly);

  const dnsLookup = dns.lookup(hostNameOnly, async (err, urlAddress) => {
    console.log(urlAddress);
    if (!urlAddress) {
      res.json({ error: "Invalid URL" });
    } else {
      const documentCount = await Url.countDocuments();
      console.log("document amount:", documentCount);
      
      const documentToInsert = {
        url: urlBody,
        short_url: documentCount
      };

      console.log(documentToInsert);
      const result = await Url.create(documentToInsert);

      console.log("result: ", result);

      res.json({ original_url: urlBody, short_url: documentCount });
    }
  })
});


// Find url corresponding with the integer value :short_url and redirect to it
app.get('/api/shorturl/:short_url', async (req, res) => {
  
  const shorturl = req.params.short_url;
  const result = await Url.findOne({ short_url: +shorturl });
  
  res.redirect(result.url);
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
