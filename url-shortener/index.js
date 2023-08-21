require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();



//const urlparser = require('url');
const dns = require('dns');
let counter = 0;
/** ************************************* */
/*
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb+srv://anonkekker:V7VEjKE5LVtd1SzD@cluster0.wrkcxvc.mongodb.net/urlshortener?retryWrites=true&w=majority');
const db = client.db("urlshortener");
const urls = db.collections("urls");
*/




const urlParser = require('url');

var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://anonkekker:V7VEjKE5LVtd1SzD@cluster0.wrkcxvc.mongodb.net/urlshortener?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  name: String,
  age: Number
});

let Url;
Url = mongoose.model("Url", urlSchema);







app.use(express.json());
app.use(express.urlencoded({ extended: true }));






/** ******************************************* **/

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});




console.log("hello");
// Your first API endpoint
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


  //const dnsLookup = dns.lookup(urlparser.parse(req.body.url).hostname, (err, urlAddress) => {
  const dnsLookup = dns.lookup(hostNameOnly, async (err, urlAddress) => {
    console.log(urlAddress);
    if (!urlAddress) {
      res.json({ error: "Invalid URL" });
    } else {
      counter++;

      const documentToInsert = {
        url: req.body.url,
        short_url: counter
      };

      await Url.create(documentToInsert);

      //const result = await urls.create(documentToInsert);
      res.json({ original: req.body.url, short_url: counter });
    }
  })
});

app.get('/api/shorturl/:short_url', (req, res) => {
  //if :short_url variable is in document in db, then res.website

  console.log(req.params.short_url);
  Url.findOne({ short_url: req.params.short_url }, function(err,obj) { 
    console.log(obj.toObject()); 
  });
  
  
  //console.log(shortUrl.original);
  
});










app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
