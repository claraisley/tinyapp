const findUserEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
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



function urlsForUser(id, urlDatabase) {
  let userObj = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userObj[key] = urlDatabase[key];
    }
  }
  return userObj;
};


module.exports = { findUserEmail, generateRandomString, urlsForUser };