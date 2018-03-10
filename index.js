const express = require('express');
const firebase = require("firebase");
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;
const app = express();

app.use('/assets', express.static('assets'));

app.use(bodyParser.urlencoded({extended: true}));


app.use(bodyParser.json());

var config = {
  apiKey: "AIzaSyACMgec6EghmqZ5eRZGKablbh5LXvGz4Cw",
  authDomain: "narc-agriauto.firebaseapp.com",
  databaseURL: "https://narc-agriauto.firebaseio.com/",
  storageBucket: "narc-agriauto.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();


app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('pages/index'));


////// @hamza
app.get('/api/test', function(req, res){
  // res.status(200).json({ status: 'working' });
  res.render('index');
});

app.get('/login', function(req, res){
  // res.status(200).json({ status: 'working' });
  res.render('login');                           
});

app.get('/login#', function(req, res){
  // res.status(200).json({ status: 'working' });
  res.render('login');                           
});
//Asynchronously signs in using an email and password.
app.post('/login', upload.array(), function(req, res,next){
  // res.status(200).json({ status: 'working' });
 // console.log(req.body.username);

 firebase.auth().signInWithEmailAndPassword(req.body.u_email, req.body.password).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  console.log(errorCode+"  "+errorMessage);
  // ...
});



 console.log(req.body.u_email);
if (firebase.auth.currentuser)
 res.send("Logged in"+ req.body.u_email+"--"+req.body.password +"   ");
});

app.post('/signup', upload.array(), function(req, res){
  // res.status(200).json({ status: 'working' });
 // console.log(req.body.username);
 
 
 firebase.auth().createUserWithEmailAndPassword(req.body.u_email.toString(), req.body.password).catch(function(error) {
 
  // Handle Errors here.
 
  var errorCode = error.code;
  var errorMessage = error.message;
  console.log(errorCode+"  "+errorMessage);
  // ...
});

app.get()

 console.log(req.body.u_email);
  res.send("Signed up"+ req.body.u_email+"--"+req.body.password +"   ");
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





  app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
