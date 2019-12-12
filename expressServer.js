const express = require("express");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcrypt');

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  secret: 'Clara',

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const { findUserEmail, generateRandomString, urlsForUser } = require("./helpers");

//Test Users Object
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "example@gmail.com",
    password: bcrypt.hashSync("dsfre2", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
/*

ALL GET ROUTES
-------------------------------------------------------------------------------------------------------------------------------

*/

//Route Renders the create URL Page

app.get("/urls/new", (req, res) => {
  let id = req.session.user_id;
  if (id) {
    let user = users[id];
    let templateVars = { user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Route renders the Page for a logged in users new short URL

app.get("/urls/:shortURL", (req, res) => {
  let id = req.session.user_id;
  let shortURL = req.params.shortURL;

  if (id) {
    let userObj = urlsForUser(id, urlDatabase);
    for (let key in userObj) {
      if (shortURL === key) {
        let user = users[id];
        let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };
        res.render("urls_show", templateVars);
        return;
      }
    }
    res.send("This URL doesnt belong to you!");
  } else {
    res.send("Please go back and register your account or login to access!");
  }
});

//This is a hyperlink to the long url homepage

app.get("/u/:shortURL", (req, res) => {
  let shortURL =  req.params.shortURL;

  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send("This URL does not exist!");
  }
});

// Renders the login page for a user

app.get("/login", (req, res) => {
  let id = req.session.user_id;
  let user = users[id];
  let templateVars = { user };
  res.render("urls_login", templateVars);
});

//Renders the register page for a user

app.get("/register", (req, res) => {
  let id = req.session.user_id;
  let user = users[id];
  let templateVars = { user };
  res.render("urls_register", templateVars);
});

//Renders the urls page for a logged in user

app.get("/urls", (req, res) => {
  let id = req.session.user_id;

  if (id) {
    let urls = urlsForUser(id, urlDatabase);
    let user = users[id];
    let templateVars = { urls, user };
    res.render("urls_index", templateVars);
  } else {
    res.send("Sorry, please go back and login to view your URL's!");
  }
});

//The home route which redirects to either the urls or login page, depending on if a user is logged in

app.get("/", (req, res) => {
  let id = req.session.user_id;

  if (id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Makes the database a JSON Object

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


/*

ALL POST ROUTES
-------------------------------------------------------------------------------------------------------------------------

*/



//Deletes a logged in users URL

app.post("/urls/:shortURL/delete", (req, res) => {
  let id = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (id) {

    let userObj = urlsForUser(id, urlDatabase);
    for (let key in userObj) {
      if (shortURL === key) {
        delete urlDatabase[shortURL];
        res.redirect("/urls");
        return;
      }
    }
    res.send("This URL does not belong to you! Please go back to creat a new one!");
  } else {
    res.send("This URL does not belong to you! Please go back and login in!");
  }
});

//Edits the logged in users long URL and redirects to home page
app.post("/urls/:shortURL", (req, res) => {
  let id = req.session.user_id;
  let shortURL = req.params.shortURL;
  let newLong = req.body.longURL;

  if (id) {

    let userObj = urlsForUser(id, urlDatabase);
    for (let key in userObj) {
      if (shortURL === key) {
        urlDatabase[shortURL].longURL = newLong;
        res.redirect(`/urls`);
        return;
      }
    }
    res.send("This URL does not belong to you!");
  } else {
    res.send("Please Login or register to view your URLs!");
  }
});

//Checks the user email and password are correct before logging in

app.post("/login", (req, res) => {

  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let userObject = (findUserEmail(userEmail, users));

  if (userObject) {
    if (bcrypt.compareSync(userPassword, userObject.password)) {
      req.session.user_id = userObject.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Password is not correct");
    }
  } else {
    res.status(403).send("Email does not exist");
  }
});

//Logs a user out and deletes the cookie

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Registers a user while checking if their login info already exists, if not it creates a new one

app.post("/register", (req, res) => {
  let userId = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  if (findUserEmail(userEmail, users)) {
    res.status(400).send("Email already exists");
  }
  if (userEmail.length === 0 || userPassword.length === 0) {
    res.status(400).send("Email or password is not defined");
  }
  users[userId] = {id: userId, email: userEmail, password: hashedPassword};
  req.session.user_id = userId;
  res.redirect("/urls");
});

//If a user is logged in, redirects to their chosen shortURL page
app.post("/urls", (req, res) => {
  let id = req.session.user_id;

  if (id) {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL, userID: id };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send("Please go back and Login first!");
  }
});

//              PORTS
//------------------------------------------------------------------------------------------------------------

//Sets the message when the server connects to the Port

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});