const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app = express();

  app.set('view engine', 'ejs');
  app.get('/', (req, res) => res.render('pages/index'));


  app.get('/api/login', (req, res) => res.render('pages/login'));





  app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
