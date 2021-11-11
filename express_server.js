const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')







app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieParser());

//return the id value in the Db from a matching email;
const findDbId = function(email){
  for(let userRandomId in users) {
    if(users[userRandomId].email === email){
      return users[userRandomId].id;
    }
  }
  return null;
}

const users = { 
  'userRandomID': {
    id: 'userRandomID', 
    email: 'user@example.com', 
    password: '123'
  },
 'user2RandomID': {
    id: 'user2RandomID', 
    email: 'user2@example.com', 
    password: '123'
  }
}

const urlDatabase = {
  b6UTxQ: {
      longURL: 'https://www.tsn.ca',
      userID: 'userRandomID'
  },
  i3BoGr: {
      longURL: 'https://www.google.ca',
      userID: 'user2RandomID'
  },
  i3B98e: {
    longURL: 'https://www.pinkbars.ca',
    userID: 'userRandomID'
}
};


const findUserUrls = function(urlDatabase, userId){
  const newObj = {};
  for (shortURL in urlDatabase) {
    if(urlDatabase[shortURL].userID === userId){
      newObj[shortURL] = urlDatabase[shortURL];
    }
  }
  return newObj;
} 

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


app.get('/urls', (req, res) => {
  if(!req.cookies['user_id']){
    return res.send(`Please login first`);
  } 
  const userId = req.cookies['user_id'];
  const templateVars = {
    user: users[userId],
    urls: findUserUrls(urlDatabase,userId)
  };
  console.log(`from GET /urls`,urlDatabase);
  res.render('urls_index',templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  if(!req.cookies['user_id']){
    return res.redirect('/login');
  } 

  res.render('urls_new',templateVars);
  
}); 

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {

  // extract the information that was Submitted with the form
  const {email, password} = req.body;

  const newRandomId = Math.random().toString(36).substring(2,8);
  if(!email || !password){
    return res.sendStatus(400);
  }
  const found = findDbId(email);
  if(found) {
    return res.sendStatus(400);
  }
  // Add it to the database 
  users[newRandomId] = {
    id: newRandomId, 
    email: email, 
    password: password
  };

  res.cookie('user_id', newRandomId );
  // redirect
  // ask the browser to perform get /jokes
  res.redirect('/urls');


})

app.post('/urls/new', (req, res) => {

  if(!req.cookies['user_id']){
    res.sendStatus(403);
  } 
  // extract the information that was Submitted with the form
  const longURL = req.body.longURL;

  const newKey = Math.random().toString(36).substring(2,8);

  // Add it to the database (jsJokesDb)
  urlDatabase[newKey] = {
    longURL,
    user_id: req.cookies['user_id']
  }

  // redirect
  // ask the browser to perform get /jokes
  console.log(urlDatabase);
  res.redirect('/urls');


})

app.post('/login', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const found = findDbId(email);
  if(!found) {
    res.sendStatus(403);
  }
  if(users[found].password !== password) {
    res.sendStatus(403);
  }
  
  res.cookie('user_id', found);
  res.redirect('/urls');    
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');

  res.redirect('/urls');    
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if(!req.cookies['user_id']){
    return res.sendStatus(403);
  } 

  const shortURL = req.params.shortURL;  
  delete urlDatabase[shortURL];  
  res.redirect('/urls');    
});

app.post('/urls/:shortURL/', (req, res) => {
  if(!req.cookies['user_id']){
    return res.sendStatus(403);
  } 
 // extract the id
  const shortURL = req.params.shortURL;

 // extract the question and anwer
  const longURL= req.body.longURL;

 // update the db

  urlDatabase[shortURL].longURL = longURL;

 // redirect
  res.redirect('/urls');  
});

app.get('/u/:shortURL', (req, res) => {
  if(!urlDatabase[req.params.shortURL]){
    return res.sendStatus(404);
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  if(!req.cookies['user_id']){
    return res.send(`Please login first`);
  } 

  if(urlDatabase[req.params.shortURL].userID !== req.cookies['user_id'] ) {
    return res.send(`This link doesn't exist in your collection`)
  }
  const templateVars = { user: users[req.cookies['user_id']],
  shortURL: req.params.shortURL, 
  longURL: urlDatabase[req.params.shortURL].longURL  };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
