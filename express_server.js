const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')







app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const findDbEmail = function(email){
  for(let userRandomId in users) {
    if(users[userRandomId].email === email){
      return users[userRandomId].email;
    }
  }
  return null;
}


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render('urls_index',templateVars);
});
// const user = findUserByEmail(req.body.email);
//     if (user) {
//         res.cookie('id', user.id);
//         res.redirect(`/`);
//     } else {
//         res.send("FAILED LOGIN");
//     }
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_new",templateVars);
}); 

app.get("/register", (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {

  // extract the information that was Submitted with the form
  const email = req.body.email;
  const password = req.body.password;
  const newRandomId = Math.random().toString(36).substring(2,8);
  if(!email || !password){
    return res.sendStatus(400);
  }
  const found = findDbEmail(email);
  if(found) {
    return res.sendStatus(400);
  }
  // Add it to the database (jsJokesDb)
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

  // extract the information that was Submitted with the form
  const longURL = req.body.longURL;

  const newKey = Math.random().toString(36).substring(2,8);

  // Add it to the database (jsJokesDb)
  urlDatabase[newKey] = longURL;

  // redirect
  // ask the browser to perform get /jokes
  res.redirect('/urls');


})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');    
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');

  res.redirect('/urls');    
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;  
  delete urlDatabase[shortURL];  
  res.redirect('/urls');    
});

app.post("/urls/:shortURL/", (req, res) => {
 // extract the id
  const shortURL = req.params.shortURL;

 // extract the question and anwer
  const longURL= req.body.longURL;

 // update the db

  urlDatabase[shortURL] = longURL;

 // redirect
  res.redirect('/urls');  
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]],
  shortURL: req.params.shortURL, 
  longURL: urlDatabase.shortURL  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
