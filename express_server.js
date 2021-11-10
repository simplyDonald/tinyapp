const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')







app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

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
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render('urls_index',templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_new",templateVars);
}); 

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
  const templateVars = { username: req.cookies["username"],shortURL: req.params.shortURL, longURL: urlDatabase.shortURL  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
