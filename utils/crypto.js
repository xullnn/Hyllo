const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashPassword(password) { // resolve to hashed ps
  return await bcrypt.hash(password, saltRounds).then(hash => hash).catch(e => console.error(e.stack));
};

async function verifyPassword(inputPassword, hash) { // return boolean
  return await bcrypt.compare(inputPassword, hash).then(result => result).catch(e => console.error(e.stack));
};

module.exports = { hashPassword, verifyPassword };