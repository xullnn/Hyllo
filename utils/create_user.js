const db = require('./db_query')
const { loadUserInfo } = require('./load_user');
const { hashPassword } = require('./crypto');

async function createUser(params) { // success: return promise resolved to user info object
  if (typeof params !== 'object') {
    try { params = JSON.parse(params)}
    catch(e) { throw new Error("Request body should be an object") }
  }

  let hashedPassword;

  if (params['password']) {
    hashedPassword = await hashPassword(params['password']).then(h => hash = h);
  };

  let dataArr = ['nickname', 'gender', 'email', 'phone', 'password', 'wechat_openid'].map(key => {
    if (key === 'password' && params['password']) return hashedPassword;
    return params[key] ? params[key] : null;
  });

  let creationSql = "INSERT INTO users (nickname, gender, email, phone, password, wechat_openid) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;"

  let result = await db.query(creationSql, dataArr).catch(e => console.error(e.stack));

  if (result.rows.length > 0) {
    return result.rows[0];
  } else {
    throw new Error('Failed create user.')
  }
};

module.exports.createUser = createUser;

