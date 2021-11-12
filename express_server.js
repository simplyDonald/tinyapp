const express = require('express');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
const morgan = require('morgan');
const {users, urlDatabase} = require("./data/userData");
const middlewareHelperGenerator = require("./helpers/middlewareHelpers");
const { fetchUserInformation , findUserUrls, findUserDb} = require('./helpers/userHelpers');
const { cookieCheck } = middlewareHelperGenerator(users, fetchUserInformation);



const PORT = 8080; // default port 8080
const app = express();

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
  const { userId } = req.session;
  // Fetch user information based on the value of the cookie
  const { error } = fetchUserInformation(users, userId);

  if (error) {
    console.log(error);
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

//dev only
app.get('/urls.json', (req, res) => {
  res.json(users);
});


app.get('/urls', (req, res) => {
  
  const { userId } = req.session;

  // Fetch user information based on the value of the cookie
  const { data, error } = fetchUserInformation(users, userId);

  if (error) {
    console.log(error);
    return res.status(403).send(`Please login first<a href='/login'> Back to Login</a>`);
  }
  
  // Give values to templateVars
  const templateVars = {
    user: data,
    urls: findUserUrls(urlDatabase,userId)
  };
  res.render('urls_index',templateVars);
});

app.get('/urls/new', (req, res) => {
  //Get the set cookie session
  const { userId } = req.session;

  // Fetch user information based on the value of the cookie
  const { data, error } = fetchUserInformation(users, userId);

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
    //Get the set cookie session
  const { userId } = req.session;

  // Fetch user information based on the value of the cookie
  const {error } = fetchUserInformation(users, userId);

  if (!error) {
    return res.redirect('/urls');
  }

  const templateVars = {
    user: users[userId],
    urls: urlDatabase
  };
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
    //Get the set cookie session
    const { userId } = req.session;

    // Fetch user information based on the value of the cookie
    const {error } = fetchUserInformation(users, userId);
  
    if (!error) {
      return res.redirect('/urls');
    }

  const templateVars = {
    user: users[userId],
    urls: urlDatabase
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {

  // extract the information that was Submitted with the form
  const {email, password} = req.body;

  const newRandomId = Math.random().toString(36).substring(2,8);
  if (!email || !password) {
    return res.status(400).send(`Empty field(s)--please input credentials<a href='/register'> Register</a>`);
  }
  const userDb = findUserDb(email);
  if (userDb) {
    return res.status(400).send(`Sorry that email exists already<a href='/register'> try another one</a> or <a href='/login'> login as an existing user</a>`);;
  }
  // Add it to the database
  users[newRandomId] = {
    id: newRandomId,
    email: email,
    password: bcrypt.hashSync(password, salt)
  };
  req.session.userId = newRandomId;
  // redirect
  res.redirect('/urls');
});

app.post('/urls/new', (req, res) => {

  //Get the set cookie session
  const { userId } = req.session;

  // Fetch user information based on the value of the cookie
  const {error } = fetchUserInformation(users, userId);

  if (error) {
    console.log(error);
    return res.status(403).send(`Please login first<a href='/login'> Back to Login</a>`);
  }
  // extract the information that was Submitted with the form
  const longURL = req.body.longURL;

  //Random string generator
  const newKey = Math.random().toString(36).substring(2,8);

  // Add it to the database (jsJokesDb)
  urlDatabase[newKey] = {
    longURL,
    userID: userId
  };

  // redirect
  res.redirect('/urls');


});

app.post('/login', (req, res) => {

  const {email, password} = req.body;

  const userDb = findUserDb(email, users);
  if (!userDb || !bcrypt.compareSync(password, userDb.password)) {
    return res.status(400).send(`Invalid Credentials<a href='/login'> Back to Login</a>`);
  }
  
  req.session.userId = userDb.id;

  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  delete req.session.userId;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { userId } = req.session;

  // Fetch user information based on the value of the cookie
  const {error } = fetchUserInformation(users, userId);

  if (error) {
    console.log(error);
    return res.status(403).send(`Please login first<a href='/login'> Back to Login</a>`);
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL/', (req, res) => {
  const { userId } = req.session;

  // Fetch user information based on the value of the cookie
  const {error } = fetchUserInformation(users, userId);

  if (error) {
    console.log(error);
    return res.status(403).send(`Please login first<a href='/login'> Back to Login</a>`);
  }
  // extract the id
  const shortURL = req.params.shortURL;

  // extract the question and anwer
  const longURL = req.body.longURL;

  // update the db
  urlDatabase[shortURL].longURL = longURL;

  // redirect
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send(`This link is invalid`);
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const { userId } = req.session;

  // Fetch user information based on the value of the cookie
  const {error } = fetchUserInformation(users, userId);

  if (error) {
    console.log(error);
    return res.status(403).send(`Please login first<a href='/login'> Back to Login</a>`);
  }

  if (!urlDatabase[req.params.shortURL]) {
    return res.send(`This link is invalid<a href='/urls'> Back to User page</a>`);
  }

  if (urlDatabase[req.params.shortURL].userID !== userId) {
    return res.send(`This link doesn't exist in your collection<a href='/urls'> Back to User page</a>`);
  }
  const templateVars = { user: users[userId],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL  };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
