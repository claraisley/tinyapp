const express = require("express");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

var cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcrypt');


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "example@gmail.com", 
    password: "dancesfdssdf2"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

function generateRandomString() {

  var anysize = 6;//the size of string 
  var charset = "abcdefghijklmnopqrstuvwxyz"; //from where to create
  let i = 0;
  let ret='';
  while(i++ < anysize) {
    ret += charset.charAt(Math.random() * charset.length);
  }
  return ret;
};

function findUserEmail(obj, emailToSearch) {
  for (let userId in obj) {
      if (obj[userId].email === emailToSearch) {
        return obj[userId];
    }
  }
  return null;
};

function urlsForUser(id) {
  let userObj = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userObj[key] = urlDatabase[key];
    }
  }
  return userObj;
};


app.get("/urls/new", (req, res) => {
  let id = req.cookies["user_id"]
  if (id) {
  let user = users[id];
  let templateVars = { user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


app.get("/urls/:shortURL", (req, res) => {
  let id = req.cookies["user_id"];
    let shortURL = req.params.shortURL;

  if (id) {
    let userObj = urlsForUser(id);
    for (let key in userObj) {
      if (shortURL === key) {  
        let user = users[id];
        let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };
        res.render("urls_show", templateVars);
      }
    } 
  } else {
    res.redirect("/login");
  }
});

//This is a hyperlink to the long url homepage

app.get("/u/:shortURL", (req, res) => {
  let shortURL =  req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
 
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send("This URL does not exist!")
  }
});

// The route to the login page

app.get("/login", (req, res) => {
  let id = req.cookies["user_id"]
  let user = users[id];
  let templateVars = { user };
  res.render("urls_login", templateVars)
});


app.get("/register", (req, res) => {
  let id = req.cookies["user_id"]
  let user = users[id];
  let templateVars = { user };
  res.render("urls_register", templateVars)
});


app.get("/urls", (req, res) => {
  let id = req.cookies["user_id"];
  let urls = urlsForUser(id);
    let user = users[id];
    let templateVars = { urls, user };
    res.render("urls_index", templateVars);
});


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});








app.post("/urls/:shortURL/delete", (req, res) => {
  let id = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  if (id) {

    let userObj = urlsForUser(id);
    for (let key in userObj) {
      if (shortURL === key) {  
       delete urlDatabase[shortURL];
        res.render("urls_show", templateVars);
      }
    }
  } else {
    res.redirect("/login")
  }
});


app.post("/urls/:shortURL", (req, res) => {
  let id = req.cookies["user_id"];
  let shortURL = req.params.shortURL;
  let newLong = req.body.longURL;

if (id) {

  let userObj = urlsForUser(id);
  for (let key in userObj) {
    if (shortURL === key) {  
      let user = users[id];
      urlDatabase[shortURL].longURL = newLong;
      let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };
      res.render("urls_show", templateVars);
      return;
    }
  } 
  res.redirect("/login");
} else {
  res.redirect("/login");
}
});


app.post("/login", (req, res) => {

  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let userObject = (findUserEmail(users, userEmail));

 if (userObject) {
  if (bcrypt.compareSync(userPassword, userObject.password)) {
  res.cookie("user_id", userObject.id); 
  res.redirect("/urls");
  } else {
  res.status(403).send("Password is not correct");
  }

  } else {
   res.status(403).send("Email does not exist");
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls")
});


app.post("/register", (req, res) => {
  let userId = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  if (findUserEmail(users, userEmail)) {
    res.status(400).send("Email already exists");
  }
  if (userEmail.length === 0 || userPassword.length === 0) {
    res.status(400).send("Email or password is not defined");
  }  
  users[userId] = {id: userId, email: userEmail, password: hashedPassword};
  res.cookie("user_id", userId);
  res.redirect("/urls");
})

app.post("/urls", (req, res) => {
  let id = req.cookies["user_id"]
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL, userID: id }
  res.redirect(`/urls/${shortURL}`); 
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});