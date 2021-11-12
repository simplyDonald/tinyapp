const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
const morgan = require('morgan');
const {users, urlDatabase} = require("./data/user_data");
const { authenticateUser, fetchUserInformation , findUserUrls, findDbId} = require('./helpers/user_helpers')





app.use(morgan('short'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(
	cookieSession({
		name: "session",
		keys: [`Welcome to my world`, "key2"],
	})
);

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(users);
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
    password: bcrypt.hashSync(password, salt)
  }
  res.cookie('user_id', newRandomId );
  // redirect
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
    userID: req.cookies['user_id']
  }

  // redirect
  // ask the browser to perform get /jokes
  console.log(urlDatabase);
  res.redirect('/urls');


})

app.post('/login', (req, res) => {

  const {email, password} = req.body;

  const found = findDbId(email, users);
  if(!found) {
    return res.sendStatus(403);
  }
  // !bcrypt.compareSync(users[found].password, password)
  if(!bcrypt.compareSync(users[found].password, password)) {
    console.log(`bcrypt was triggered`)
    return res.sendStatus(403);
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

  if(!urlDatabase[req.params.shortURL]) {
    return res.send(`This link is invalid`)
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
