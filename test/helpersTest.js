const assert = require('chai').assert;

const { findUserDb } = require('../helpers/userHelpers');

const testUsers = {
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
};

describe('findUserDb', function() {
  it('should return a user with valid email', function() {
    const user = findUserDb("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user.id,expectedUserID);
  });

  it(`should return undefined for an email that doesn't exist in DB`, function() {
    const user = findUserDb("pebbles@example.com", testUsers);
    const expectedResult = undefined;
    assert.strictEqual(user,expectedResult);
  });

});
