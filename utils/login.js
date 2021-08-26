const db = require("./db_query");
const { createUser } = require('./create_user')

function isUserLoggedIn(req) {
  return req.session.isLoggedIn;
};

function parseLoginMethod(params) {
  if (params.email) return 'email';
  if (params.phone) return 'phone';
  if (params.wechat_openid) return 'wechat';
  return null;
}

function loginUserToSession(sessionObject, userInfo) {
  try {
    session.isLoggedIn = true;
    session.user_id = userInfo.id;
    session.nickname = userInfo.nickname;
    return true;
  } catch (e) {
    return false;
    console.error(e.stack)
  }
};

module.exports = { parseLoginMethod, loginUserToSession };
