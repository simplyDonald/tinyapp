const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
const morgan = require('morgan');
const {users, urlDatabase} = require("./data/userData");
const middlewareHelperGenerator = require("./helpers/middlewareHelpers");
const { authenticateUser, fetchUserInformation , findUserUrls, findUserDb} = require('./helpers/userHelpers')
const { cookieCheck } = middlewareHelperGenerator(users, fetchUserInformation)




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
app.use(cookieCheck);

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(users);
});


app.get('/urls', (req, res) => {
  // if(!req.cookies['user_id']){
  //   return res.send(`Please login first`);
  // } 
  //Get the set cookie session 
  const { user_id } = req.session;

	// Fetch user information based on the value of the cookie
  const { data, error } = fetchUserInformation(users, user_id);

	if (error) {
		console.log(error);
		return res.send(`Please login first`);
	}
  
	// Give values to templateVars
  const userId = req.cookies['user_id'];
  const templateVars = {
    user: data,
    urls: findUserUrls(urlDatabase,userId)
  };
  res.render('urls_index',templateVars);
});

app.get('/urls/new', (req, res) => {
  //Get the set cookie session 
  const { user_id } = req.session;

	// Fetch user information based on the value of the cookie
  const { data, error } = fetchUserInformation(users, user_id);

	if (error) {
		console.log(error);
    return res.redirect('/login');
	}
  const templateVars = {
    user: data,
    urls: urlDatabase
  };
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
  const userDb = findUserDb(email);
  if(userDb) {
    return res.sendStatus(400);
  }
  // Add it to the database 
  users[newRandomId] = {
    id: newRandomId, 
    email: email, 
    password: bcrypt.hashSync(password, salt)
  }
  // res.cookie('user_id', newRandomId );
  req.session.user_id = newRandomId;
  // redirect
  res.redirect('/urls');
})

app.post('/urls/new', (req, res) => {

  //Get the set cookie session 
  const { user_id } = req.session;

	// Fetch user information based on the value of the cookie
  const {error } = fetchUserInformation(users, user_id);

	if (error) {
		console.log(error);
    return res.status(403).send(`Please login first<a href='/login'> Back to Login</a>`);
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

  const userDb = findUserDb(email, users);
  if(!userDb) {
    return res.status(400).send(`User does not exist<a href='/login'> Back to Login</a>`);
  }
  if(!bcrypt.compareSync(password, userDb.password)) {
    return res.status(400).send(`Invalid Password<a href='/login'> Back to Login</a>`);
  }
  
  // res.cookie('user_id', userDb);
  req.session.user_id = userDb.id;

  res.redirect('/urls');    
});

app.post('/logout', (req, res) => {
  // res.clearCookie('user_id');
  delete req.session.user_id;
  res.redirect('/urls');    
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { user_id } = req.session;

	// Fetch user information based on the value of the cookie
  const {error } = fetchUserInformation(users, user_id);

	if (error) {
		console.log(error);
    return res.status(403).send(`Please login first<a href='/login'> Back to Login</a>`);
	}
  const shortURL = req.params.shortURL;  
  delete urlDatabase[shortURL];  
  res.redirect('/urls');    
});

app.post('/urls/:shortURL/', (req, res) => {
  const { user_id } = req.session;

	// Fetch user information based on the value of the cookie
  const {error } = fetchUserInformation(users, user_id);

	if (error) {
		console.log(error);
    return res.status(403).send(`Please login first<a href='/login'> Back to Login</a>`);
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
  const { user_id } = req.session;

	// Fetch user information based on the value of the cookie
  const {error } = fetchUserInformation(users, user_id);

	if (error) {
		console.log(error);
    return res.status(403).send(`Please login first<a href='/login'> Back to Login</a>`);
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
