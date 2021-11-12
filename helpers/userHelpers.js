//returns a user object in the user DB
const fetchUserInformation = (userDB, userId) => {
  const currentUser = userDB[userId];

  if (!currentUser) {
    return { data: null, error: 'Invalid userId in cookie' };
  }
  return { data: currentUser, error: null };
};


//returns an object of URLS unique to each user
const findUserUrls = function(urlDatabase, userId) {
  const newObj = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userId) {
      newObj[shortURL] = urlDatabase[shortURL];
    }
  }
  return newObj;
};

//return the id value in the Db from a matching email;
const findUserDb = function(email,userDb) {
  for (let userRandomId in userDb) {
    if (userDb[userRandomId].email === email) {
      return userDb[userRandomId];
    }
  }
  return undefined;
};
module.exports = { fetchUserInformation , findUserUrls, findUserDb };