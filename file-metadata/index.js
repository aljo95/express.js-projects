var express = require('express');
var cors = require('cors');
require('dotenv').config()


/*
** using multer as middleware for handling multipart/form-data 
** which is used for the uploading of the files 
*/
const multer = require('multer')
const upload = multer({ dest: 'uploads/' }).single("upfile");

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/fileanalyse", (req, res) => {
  upload(req, res, (err) => {
    //console.log(req);
    //console.log(res);
    if (err) {
      res.status(400).send("Something went wrong!");
      return;
    }
    const { originalname, mimetype, size } = req.file;

    let sendObject = {
      name: originalname,
      type: mimetype,
      size: size
    }

    res.json(sendObject);
  });
});


const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Your app is listening on port ' + port)
});
