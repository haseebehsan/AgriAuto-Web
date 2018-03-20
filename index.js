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
  } else if(!user) {


  }
});

//Checks if user is logged in
//
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
  firebase.database().ref('/users/' + firebase.auth().currentUser.uid).once('value').then(function (snapshot) {
   

   // console.log(snapshot.val());
    if (snapshot != null) {
   return true;

    } else {
      return false;
    }
    
  });
}

//////////////////////////////
// ROUTES
/////////////////////////////

app.get('/',function(req,res){

  res.render('index');
});


app.get('/chart',function(req,res){

  res.render('index-hamza');
});


////// @hamza
//Renders the login page
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
    (user.emailVerified) ? console.log('Email is verified') : res.redirect("/verifyEmail")
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
//
//Creates new user acccount, tehn send verification email, then updates the user information 
//
//Output: A new user account is created and redirected to the dashboad, 
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

          console.log('Email is verified') :

          user.sendEmailVerification();
      });

    }).then(function () {
      //Add rest of the information in the users profile
      firebase.database().ref('/users/' + firebase.auth().currentUser.uid).set({

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
      res.render('login',{err:errorMessage});
    });


  console.log(req.body.u_email);
  res.send("Signed up \n" + req.body.u_email + "--" + req.body.password + "   ");


});

////////
// checks if the user's email address is verified or not, 
//if it is not verified a new verififcation email is sent to the user
///////
app.post('/resendVerificationEmail', upload.array(), function (req, res) {

  firebase.auth().onAuthStateChanged(function (user) {
    (user.emailVerified) ? console.log('Email is verified') : user.sendEmailVerification();
  });
  res.redirect('/verifyEmail');
});

//redirects the user to the signup page
app.get('/signup', function (req, res) {
  // res.status(200).json({ status: 'working' });
  res.redirect('signup');
});

//redirects the user to the signup page
app.get('/forgotPassword', function (req, res) {
  // res.status(200).json({ status: 'working' });
  res.render('forgotPassword');
});

app.post('/forgotpassword', function (req, res) {

  firebase.auth().sendPasswordResetEmail(req.body.u_email.toString());

  res.send("Password reset email sent");
});

//redirects the user to the signup page
app.get('/setFarm', function (req, res) {
  // res.status(200).json({ status: 'working' });
  res.render('setFarm');
});

app.get('/changePassword', function (req, res) {
  // res.status(200).json({ status: 'working' });
  res.redirect('changePassword');
});

app.get('/irrigation', function (req, res) {
  // res.status(200).json({ status: 'working' });
  res.render('irrigation');
});

app.get('/settings', function (req, res) {
  // res.status(200).json({ status: 'working' });
  res.render('settings');
});


////////////////---------------------------------------------------------------
// All API POST requests
////////////////---------------------------------------------------------------  


/////////////
//inputs:
//  farmid: 0000-9999 
//  siteid
//  startdate: yyyy-mm-dd
//  enddate: yyyy-mm-dd
//output
//  sensor data in JSON
/////////////
app.post('/api/getSensorData', function (req, res) {

  console.log(req.body.farmid);
  console.log(req.body.siteid);
  console.log(req.body.startdate);
  console.log(req.body.enddate);

  var startDate = req.body.startdate;
  var endDate = req.body.enddate;
  var returnData = "{ ";
  var count = 0;

  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + '/sensor/').once('value').then(function (snapshot) {
    var childstring;
    snapshot.forEach(function (childSnapshot) {
      // console.log("key: "+childSnapshot.key);

      if (childSnapshot.key >= startDate && childSnapshot.key <= endDate) {
        // console.log("key: "+childSnapshot.key);
        childstring = JSON.stringify(childSnapshot.val());
        // console.log(childstring);
        // childstring = childstring.substring(1, childstring.length -1);
        childstring = "\"" + childSnapshot.key + "\":" + childstring;
        if (count == 0) {

          count = 1
        }
        else {
          childstring = "," + childstring;
        }

        returnData += childstring;
        console.log(returnData);

      }

    });

    returnData += " }";

    console.log(snapshot.val());
    res.json(JSON.parse(returnData));
    //var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    // ...
  });


  res.status(200);
  // res.render('index');
});




/////////////
//inputs:
//  farmid: 0000-9999 
//  siteid
//output
//  sensor data in JSON
/////////////
app.post('/api/getLatestSensorData', function (req, res) {

  console.log(req.body.farmid);
  console.log(req.body.siteid);

 
 
 

  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + '/sensor/').orderByKey().limitToLast(1).on("child_added",function (snapshot) {
    var childstring;
    var highest = '';
    console.log(JSON.stringify(snapshot));  
    console.log(snapshot.key+" - "+JSON.stringify(snapshot));
    res.json(snapshot);
  });


  res.status(200);
  // res.render('index');
});






/////////////
//inputs:
//  farmid
//output
//  sites data in JSON
/////////////
app.post('/api/getFarmSites', function (req, res) {

  console.log(req.body.farmid);


  var returnData = "{ ";
  var count = 0;

  firebase.database().ref('/farms/' + req.body.farmid + '/').once('value').then(function (snapshot) {
    var childstring;
    snapshot.forEach(function (childSnapshot) {
      // console.log("key: "+childSnapshot.key);



      // console.log("key: "+childSnapshot.key);
      childstring = JSON.stringify(childSnapshot.child('info').val());
      console.log("childstring: " + childstring);
      // childstring = childstring.substring(1, childstring.length -1);
      childstring = "\"" + childSnapshot.key + "\":" + childstring;
      if (count == 0) {

        count = 1
      }
      else {
        childstring = "," + childstring;
      }

      returnData += childstring;
      console.log(returnData);



    });

    returnData += " }";

    console.log(snapshot.val());
    res.json(JSON.parse(returnData));
    //var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    // ...
  });


  res.status(200);
  // res.render('index');
});









/////////////
//inputs:
//  farmid
//  siteid: 0000-9999 
//  time: hour:minutes
//  date: year-month-day
//  temperature
//  humidity
//  soilmoisture
//  output
//  status
/////////////
app.post('/api/setSensorData', function (req, res) {
  console.log(req.body.farmid);
  console.log(req.body.date);
  console.log(req.body.time);
  console.log(req.body.siteid);
  console.log(req.body.temp);
  console.log(req.body.hum);
  console.log(req.body.sm);

  // Set Sample Data
  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + '/sensor/' + req.body.date + '/' + req.body.time).set({
    hum: req.body.hum,
    sm: req.body.sm,
    temp: req.body.temp
  });


  res.status(200).json({
    status: "1"
  });
  // res.render('index');
});


/////////////
//inputs:
//  farmid
//  siteid
//  irrigation status: 0,1
//output
//  status
/////////////
app.post('/api/setIrrigationStatus', function (req, res) {


  console.log(req.body.status);
  if (req.body.status == '0' || req.body.status == '1') {
    firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + '/irrigation/manual/').set({
      status: req.body.status
    });
    console.log("inside.");
  }

  res.status(200).json({
    status: '1'
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
// app.post('/api/getIrrigationStatus', function (req, res) {

//   firebase.database().ref('/farms/'+req.body.farmid+'/'+ req.body.fieldid + '/irrigation/manual').once('value').then(function (snapshot) {
//     // snapshot.forEach(function(childSnapshot) {
//     //     console.log(JSON.stringify(childSnapshot.val()));
//     //   });

//     console.log(snapshot.val());
//     if (snapshot != null) {
//       res.json(snapshot.val());

//     } else {
//       res.json({
//         status: -1
//       });
//     }
//     //var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
//     // ...
//   });


//   res.status(200)
//   // res.render('index');
// });

/////////////
//inputs
// farmid
//  siteid: 0000-9999
//
//output
// status: 0,1, -1 (-1 shows there is no data on server)
/////////////
app.post('/api/getIrrigationStatus', function (req, res) {

  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + '/irrigation/manual').once('value').then(function (snapshot) {
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
// farmid
//  siteid: 0000-9999
//
//output
// status: 0,1, -1 (-1 shows there is no data on server)
/////////////
app.post('/api/getStatus', function (req, res) {

  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + '/irrigation/manual').once('value').then(function (snapshot) {
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
  console.log(req.body.siteid);
  console.log(req.body.sensor);
  console.log(req.body.value);

  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + "/irrigation/auto/" + req.body.sensor).update({
    min: req.body.value
  });

  res.status(200).json({
    status: '1'
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
  console.log(req.body.siteid);
  console.log(req.body.sensor);
  console.log(req.body.value);

  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + "/irrigation/auto/" + req.body.sensor).update({
    max: req.body.value
  });

  res.status(200).json({
    status: '1'
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
  console.log(req.body.siteid);


  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + '/irrigation/auto').once('value').then(function (snapshot) {
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



  res.status(200).json({
    status: '1'
  });
  // res.render('index');
});


/////////////
//
//username
//siteid
//
//
//
/////////////
app.post('/api/setSiteId', function (req, res) {



  firebase.database().ref('/users/' + req.body.userid).update({
    site: req.body.siteid
  });



  res.status(200).json({
    status: '1'
  });
  // res.render('index');
});



/////////////
//
//farmid
//siteid
//croptype
//
//
/////////////
app.post('/api/setCropType', function (req, res) {



  firebase.database().ref('/farms/' + req.body.farmid+'/'+req.body.siteid+'/info/').update({
    croptype: req.body.croptype
  });



  res.status(200).json({
    status: '1'
  });
  // res.render('index');
});

/////////////
//
//farmid
//siteid
//
//
//
/////////////
app.post('/api/getCropType', function (req, res) {



  firebase.database().ref('/farms/' + req.body.farmid+'/'+req.body.siteid+'/info/').once('value').then(function (snapshot) {
    // snapshot.forEach(function(childSnapshot) {
    //     console.log(JSON.stringify(childSnapshot.val()));
    //   });

    console.log(snapshot.child("croptype").val());
    if (snapshot != null && snapshot.child("croptype" != null)) {
      res.json({ croptype : snapshot.child("croptype").val()});

    } else {
      res.json({
        croptype: -1
      });
    }
    //var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    // ...
  });



  res.status(200)
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
// farmid
// siteid: 0000-9999
//scheduletime: DateTimeStamp
//addtime: DateTimeStamp
//
//output: okay
/////////////
app.post('/api/addSchedule', function (req, res) {
  // res.status(200).json({ status: 'working' });
  console.log(req.body.status);

  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + '/irrigation/schedules/' + req.body.scheduletime).set({
    addtime: req.body.addtime
  });



  res.status(200).json({
    status: '1'
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
app.post('/api/addUser', function (req, res) {




  firebase.database().ref('/users/' + req.body.username).set({

    firstName: req.body.firstname,
    middleName: req.body.middlename,
    lastName: req.body.lastname,
    phone: req.body.phonenumber
  })

  res.status(200).json({
    status: '1'
  });
});




/////////////
//remove schedule
//inputs:
// farmid
// siteid: 0000-9999
//scheduletime: DateTimeStamp
//
//output: okay
/////////////
app.post('/api/removeSchedule', function (req, res) {
  console.log(req.body.status);

  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + '/irrigation/schedules/' + req.body.scheduletime).remove();



  res.status(200).json({
    status: '1'
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


/////////////
//inputs
//  farmid
//  siteid: 0000-9999
//
//output
// 
/////////////
app.post('/api/getAllSchedules', function (req, res) {

  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + '/irrigation/schedules').once('value').then(function (snapshot) {
    // snapshot.forEach(function(childSnapshot) {
    //     console.log(JSON.stringify(childSnapshot.val()));
    //   });

    console.log(JSON.stringify(snapshot.val()));
    if (snapshot.val() != null) {
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
//  farmid
//  siteid: 0000-9999
//
//output
// 
/////////////
app.post('/api/getIrrigationMode', function (req, res) {

  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + '/irrigation/mode').once('value').then(function (snapshot) {
    // snapshot.forEach(function(childSnapshot) {
    //     console.log(JSON.stringify(childSnapshot.val()));
    //   });

    console.log(JSON.stringify(snapshot.val()));
    if (snapshot.val() != null) {
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
//inputs: 
//  farmid
//  siteid
//  mode
//
//
///////////// 
app.post('/api/setIrrigationMode', function (req, res) {
  // res.status(200).json({ status: 'working' });
  console.log(req.body.status);

  firebase.database().ref('/farms/' + req.body.farmid + '/' + req.body.siteid + '/irrigation/mode/').set({
    mode: req.body.mode
  });



  res.status(200).json({
    status: '1'
  });
  // res.render('index');
});

//Start Appliation on the given PORT number
app.listen(PORT, () => console.log(`Listening on ${PORT}`));