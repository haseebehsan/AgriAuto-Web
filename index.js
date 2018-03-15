const express = require('express');
const firebase = require("firebase");
const bodyParser = require('body-parser');
//const flash = require('connect-flash');
const PORT = process.env.PORT || 5000;
const app = express();
const morgan = require('morgan');
const multer = require('multer'); // v1.0.5
const upload = multer(); // for parsing multipart/form-data
app.use(morgan('dev'));

app.use('/assets', express.static('assets'));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

var emailSent = false;

//app.use(express.cookieParser('keyboard cat'));

//app.use(express.session({ cookie: { maxAge: 60000 }}));

app.use(bodyParser.urlencoded({
  extended: true
}));
//using connect-flash to flasj error messages to user
//app.use(flash());

var config = {
  apiKey: "AIzaSyACMgec6EghmqZ5eRZGKablbh5LXvGz4Cw",
  authDomain: "narc-agriauto.firebaseapp.com",
  databaseURL: "https://narc-agriauto.firebaseio.com/",
  storageBucket: "narc-agriauto.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();


app.set('view engine', 'ejs');


app.get('/', (req, res) => res.render('index'));



//Firebase user state observer
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
    // ...
  } else {

  }
});

//Check if user is logged in
function loggedIn() {
  var user = firebase.auth().currentUser;
  if (user) {
    return true;

  } else {
    return false;
  }
}

function isFarmSet() {
  //Use API
}

////// @hamza
app.get('/api/test', function (req, res) {
  // res.status(200).json({ status: 'working' });
  res.render('index');
});

app.get('/login', function (req, res) {
  // res.status(200).json({ status: 'working' });
  res.render('login');
});


//Asynchronously signs in using an email and password.
app.post('/login', upload.array(), function (req, res, next) {
  // res.status(200).json({ status: 'working' });
  // console.log(req.body.username);

  firebase.auth().signInWithEmailAndPassword(req.body.u_email, req.body.password).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode + "  " + errorMessage);
    // ...
  });

  firebase.auth().onAuthStateChanged(function (user) {
    (user.emailVerified) ? console.log('Email is verified'): res.redirect("/verifyEmail")
  });

  console.log(req.body.u_email);

  res.redirect('index');
});



app.get('/verifyEmail', function (req, res) {
  // res.status(200).json({ status: 'working' });
  res.render('verifyEmail');
});


///////////////
//Inputs: firstname,lastname, middlename, phoneNumber,email,password
//Creates new user acccount, tehn send verification email, then updates the user information 
//output: A new user account is created and redirected to the dashboad, 
//       in case of error the signup page is loaded
/////////////
app.post('/signup', upload.array(), function (req, res) {
  // res.status(200).json({ status: 'working' });
  // console.log(req.body.username);


  firebase.auth().createUserWithEmailAndPassword(req.body.u_email.toString(), req.body.password)

    .then(function (user) {
      //Send verification email to user
      firebase.auth().onAuthStateChanged(function (user) {
        (user.emailVerified) ?

        console.log('Email is verified'):

          user.sendEmailVerification();
      });

    }).then(function () {
      //Add rest of the information in the users profile
      var user = firebase.auth().currentUser;
      //   user.updateProfile({
      //     user.email:  
      //     {firstname: req.body.firstName,
      //       middlename: req.body.middleName,
      //       lastname: req.body.lastName,
      //       phone: req.body.phoneNumber}
      // })
      var uemail = escape(user.email.toString());

      uemail = uemail.replace(".", "");

      uemail_array = uemail.split("@");

      key = uemail_array[0];
      firebase.database().ref('/users/' + key).set({

          firstname: req.body.firstName,
          middlename: req.body.middleName,
          lastname: req.body.lastName,
          phone: req.body.phoneNumber
        }


      )
    })
    .catch(function (error) {

      // Handle Errors 

      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode + "\n Messsage: " + errorMessage);
      // ...
      //req.flash('error', errorMessage);
      res.redirect('signup');
    });


  console.log(req.body.u_email);
  res.send("Signed up \n" + req.body.u_email + "--" + req.body.password + "   ");


});



///////////
// checks if the user's email address is verified or not, 
//if it is not verified a new verififcation email is sent to the user
///////
app.post('/resendVerificationEmail', upload.array(), function (req, res) {

  firebase.auth().onAuthStateChanged(function (user) {
    (user.emailVerified) ? console.log('Email is verified'): user.sendEmailVerification();
  });
  res.redirect('/verifyEmail');
});

//redirects the user to the signup page
app.get('/signup', function (req, res) {
  // res.status(200).json({ status: 'working' });
  res.redirect('signup');
});


//redirects the user to the signup page
app.get('/setFarm', function (req, res) {
  // res.status(200).json({ status: 'working' });
  res.redirect('setFarm');
});

app.post('/setFarm', function (req, res) {
  // res.status(200).json({ status: 'working' });

});


app.get('/changePassword', function (req, res) {
  // res.status(200).json({ status: 'working' });
  res.redirect('changePassword');
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
app.post('/api/getSensorData', function (req, res) {


  firebase.database().ref('/fields/' + req.body.fieldid + '/sensor/').once('value').then(function (snapshot) {
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
app.post('/api/setSensorData', function (req, res) {
  console.log(req.body.time)
  console.log(req.body.fieldid);
  console.log(req.body.temperature);
  console.log(req.body.humidity);
  console.log(req.body.soilmoisture);

  // Set Sample Data
  firebase.database().ref('/fields/' + req.body.fieldid + '/sensor/' + req.body.time + '/').set({
    humidity: req.body.humidity,
    soilMoisture: req.body.soilmoisture,
    temperature: req.body.temperature
  });

  res.send(
    '<form action="/upload" method="post" enctype="multipart/form-data">' +
    '<input type="file" name="source">' +
    '<input type="submit" value="Upload">' +
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
app.post('/api/setIrrigationStatus', function (req, res) {


  console.log(req.body.status);
  if (req.body.status == '0' || req.body.status == '1') {
    firebase.database().ref('/fields/' + req.body.fieldid + '/irrigation/manual/').set({
      status: req.body.status
    });
    console.log("inside.");
  }

  res.status(200).json({
    output: '1'
  });
  // res.render('index');
});

/////////////
//inputs
//  fieldid: 0000-9999
//
//output
// status: 0,1, -1 (-1 shows there is no data on server)
/////////////
app.post('/api/getIrrigationStatus', function (req, res) {

  firebase.database().ref('/fields/' + req.body.fieldid + '/irrigation/manual').once('value').then(function (snapshot) {
    // snapshot.forEach(function(childSnapshot) {
    //     console.log(JSON.stringify(childSnapshot.val()));
    //   });

    console.log(snapshot.val());
    if (snapshot != null) {
      res.json(snapshot.val());

    } else {
      res.json({
        status: -1
      });
    }
    //var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    // ...
  });


  res.status(200)
  // res.render('index');
});

/////////////
//inputs
//  fieldid: 0000-9999
//
//output
// status: 0,1, -1 (-1 shows there is no data on server)
/////////////
app.post('/api/getIrrigationStatus', function (req, res) {

  firebase.database().ref('/fields/' + req.body.fieldid + '/irrigation/manual').once('value').then(function (snapshot) {
    // snapshot.forEach(function(childSnapshot) {
    //     console.log(JSON.stringify(childSnapshot.val()));
    //   });

    console.log(snapshot.val());
    if (snapshot != null) {
      res.json(snapshot.val());

    } else {
      res.json({
        status: -1
      });
    }
    //var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    // ...
  });


  res.status(200)
  // res.render('index');
});

/////////////
//
//
//
//
//
//
/////////////
app.post('/api/setMin', function (req, res) {
  console.log(req.body.fieldid);
  console.log(req.body.sensor);
  console.log(req.body.value);
  
  firebase.database().ref('/fields/' + req.body.fieldid+"/irrigation/auto/"+req.body.sensor).update({
    min: req.body.value
  });

  res.status(200).json({
    status: 'working'
  });
  // res.render('index');
});


/////////////
//
//
//
//
//
//
/////////////
app.post('/api/setMax', function (req, res) {
  console.log(req.body.fieldid);
  console.log(req.body.sensor);
  console.log(req.body.value);

  firebase.database().ref('/fields/' + req.body.fieldid+"/irrigation/auto/"+req.body.sensor).update({
    max: req.body.value
  });

  res.status(200).json({
    status: 'working'
  });
  // res.render('index');
});

/////////////
//
//
//
//
//
//
/////////////
app.post('/api/getMinMax', function (req, res) {

  console.log(req.body.farmid);
  console.log(req.body.fieldid);
  

  firebase.database().ref('/fields/' + req.body.fieldid + '/irrigation/auto').once('value').then(function (snapshot) {
    // snapshot.forEach(function(childSnapshot) {
    //     console.log(JSON.stringify(childSnapshot.val()));
    //   });

    console.log(snapshot.val());
    if (snapshot != null) {
      res.json(snapshot.val());

    } else {
      res.json({
        status: -1
      });
    }
    //var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    // ...
  });


  
  // res.render('index');
});


/////////////
//
//
//
//
//
//
/////////////
app.post('/api/setFarm', function (req, res) {


  
  firebase.database().ref('/users/' + req.body.userid).update({
    farm: req.body.farmid
  });
  


  res.status(200).json({ status: 'working' });
  // res.render('index');
});


// /////////////
// app.post('/api/setIrrigationStatus', function(req, res){
//   res.status(200).json({ status: 'working' });
//   // res.render('index');
// });

/////////////
//add schedule
//inputs:
// fieldid: 0000-9999
//scheduletime: DateTimeStamp
//addtime: DateTimeStamp
//
//output: okay
/////////////
app.post('/api/addSchedule', function (req, res) {
  // res.status(200).json({ status: 'working' });
  console.log(req.body.status);

  firebase.database().ref('/fields/' + req.body.fieldid + '/irrigation/schedules/' + req.body.scheduletime).set({
    addtime: req.body.addtime
  });



  res.status(200).json({
    output: '1'
  });
  // res.render('index');
});

/////////////
//remove schedule
//inputs:
// fieldid: 0000-9999
//scheduletime: DateTimeStamp
//
//output: okay
/////////////
app.post('/api/removeSchedule', function (req, res) {
  console.log(req.body.status);

  firebase.database().ref('/fields/' + req.body.fieldid + '/irrigation/schedules/' + req.body.scheduletime).remove();



  res.status(200).json({
    output: '1'
  });
});

// app.post('/', function (req, res) {

//   console.log(req.body.time)
//   console.log(req.body.fieldid);
//   console.log(req.body.temperature);
//   console.log(req.body.humidity);
//   console.log(req.body.soilmoisture);

//   // Set Sample Data
//   firebase.database().ref('/fields/' + req.body.fieldid + '/sensor/' + req.body.time + '/').set({
//     humidity: req.body.humidity,
//     soilMoisture: req.body.soilmoisture, temperature: req.body.temperature
//   });

//   res.send(
//     '<form action="/upload" method="post" enctype="multipart/form-data">' +
//     '<input type="file" name="source">' +
//     '<input type="submit" value="Upload">' +
//     '</form>'
//   );
// });

//Start Appliation on the given PORT number
app.listen(PORT, () => console.log(`Listening on ${PORT}`))