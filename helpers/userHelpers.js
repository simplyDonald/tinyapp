const bcrypt = require("bcryptjs");

const authenticateUser = (userDB, email, password) => {
	const currentUser = userDB[email];

	if (!currentUser) {
		// If it doesn't match, redirect to /

		return { data: null, error: "Not a valid email" };
	}

	// if (currentUser.password !== password) {
	if (!bcrypt.compareSync(password, currentUser.password)) {
		// If it doesn't match, redirect to /
		return { data: null, error: "Not a valid password" };
	}
	// If it match, redirect to /vault + cookie
	return { data: currentUser, error: null };
};

const fetchUserInformation = (userDB, user_id) => {
	const currentUser = userDB[user_id];

	if (!currentUser) {
		return { data: null, error: "Invalid user_id in cookie" };
	}
	return { data: currentUser, error: null };
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

//return the id value in the Db from a matching email;
const findUserDb = function(email,userDb){
  for(let userRandomId in userDb) {
    if(userDb[userRandomId].email === email){
      return userDb[userRandomId];
    }
  }
  return null;
}
module.exports = { authenticateUser, fetchUserInformation , findUserUrls, findUserDb };