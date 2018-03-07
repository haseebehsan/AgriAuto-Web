const express = require('express')
const app = express();
const path = require('path')
const firebase = require("firebase");
const bodyParser = require('body-parser');
// parsing json data
app.use(bodyParser.json());

app.use('/assets', express.static('assets'));




app.use(bodyParser.urlencoded({extended: true}));

const PORT = process.env.PORT || 5000


var config = {
  apiKey: "AIzaSyACMgec6EghmqZ5eRZGKablbh5LXvGz4Cw",
  authDomain: "narc-agriauto.firebaseapp.com",
  databaseURL: "https://narc-agriauto.firebaseio.com/",
  storageBucket: "narc-agriauto.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();

////// @hamza
app.get('/api/test', function(req, res){
  // res.status(200).json({ status: 'working' });
  res.render('index');
});
app.get('/api/login', function(req, res){
  // res.status(200).json({ status: 'working' });
  res.render('login');
});

app.get('/api/dashboard', function(req, res){
  // res.status(200).json({ status: 'working' });
  res.render('dashboard',urlencoded);
});





////////////////---------------------------------------------------------------
// All API POST requests
////////////////---------------------------------------------------------------  


/////////////
//inputs:
//  fieldid: 0000-9999 
//output
//  sensor data in JSON
/////////////
app.post('/api/getSensorData', function(req, res){


  firebase.database().ref('/fields/'+req.body.fieldid+'/sensor/').once('value').then(function(snapshot) {
      // snapshot.forEach(function(childSnapshot) {
      //     console.log(JSON.stringify(childSnapshot.val()));
      //   });

      console.log(snapshot.val());
      res.json(snapshot.val());
      //var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
      // ...
    });


  res.status(200);
  // res.render('index');
});


/////////////
//inputs:
//  fieldid: 0000-9999 
//  time
//  temperature
//  humidity
//  soilmoisture
//output
//  status
/////////////
app.post('/api/setSensorData', function(req, res){
  console.log(req.body.time)
  console.log(req.body.fieldid);
  console.log(req.body.temperature);
  console.log(req.body.humidity);
  console.log(req.body.soilmoisture);

  // Set Sample Data
  firebase.database().ref('/fields/'+req.body.fieldid+'/sensor/'+req.body.time+'/').set({
  humidity: req.body.humidity,
  soilMoisture: req.body.soilmoisture, temperature: req.body.temperature
  });

  res.send(
      '<form action="/upload" method="post" enctype="multipart/form-data">'+
      '<input type="file" name="source">'+
      '<input type="submit" value="Upload">'+
      '</form>'
  );
  res.status(200);
  // res.render('index');
});


/////////////
//inputs:
//  irrigation status: 0,1 
//  fieldid: 0000-9999
//output
//  status
/////////////
app.post('/api/setIrrigationStatus', function(req, res){

  
  console.log(req.body.status);
  if(req.body.status == '0' || req.body.status == '1'){
      firebase.database().ref('/fields/'+req.body.fieldid+'/irrigation/manual/').set({
          status: req.body.status
          });
          console.log("inside.");
  }

  res.status(200).json({output:'1'});
  // res.render('index');
});

/////////////
//inputs
//  fieldid: 0000-9999
//
//output
// status: 0,1, -1 (-1 shows there is no data on server)
/////////////
app.post('/api/getIrrigationStatus', function(req, res){

  firebase.database().ref('/fields/'+req.body.fieldid+'/irrigation/manual').once('value').then(function(snapshot) {
      // snapshot.forEach(function(childSnapshot) {
      //     console.log(JSON.stringify(childSnapshot.val()));
      //   });

      console.log(snapshot.val()); 
      if(snapshot != null){
          res.json(snapshot.val());
          
      }
      else{
          res.json({ status: -1 });
      }
      //var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
      // ...
    });


  res.status(200)
  // res.render('index');
});


/////////////
app.post('/api/setMin', function(req, res){
  res.status(200).json({ status: 'working' });
  // res.render('index');
});


/////////////
app.post('/api/setIrrigationStatus', function(req, res){
  res.status(200).json({ status: 'working' });
  // res.render('index');
});

/////////////
app.post('/api/addSchedule', function(req, res){
  res.status(200).json({ status: 'working' });
  // res.render('index');
});

/////////////
app.post('/api/removeSchedule', function(req, res){
  res.status(200).json({ status: 'working' });
  // res.render('index');
});

app.post('/', function(req, res){
  
  console.log(req.body.time)
  console.log(req.body.fieldid);
  console.log(req.body.temperature);
  console.log(req.body.humidity);
  console.log(req.body.soilmoisture);

  // Set Sample Data
  firebase.database().ref('/fields/'+req.body.fieldid+'/sensor/'+req.body.time+'/').set({
  humidity: req.body.humidity,
  soilMoisture: req.body.soilmoisture, temperature: req.body.temperature
  });

  res.send(
      '<form action="/upload" method="post" enctype="multipart/form-data">'+
      '<input type="file" name="source">'+
      '<input type="submit" value="Upload">'+
      '</form>'
  );
});


express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
