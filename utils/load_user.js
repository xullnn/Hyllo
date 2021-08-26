const db = require('./db_query');

async function loadUserByEmail(email) {
  let result =  await db.query("SELECT * FROM users WHERE email = $1;", [email]).catch(e => console.error(e.stack));
  return parseResult(result, { email });
};

async function loadUserByPhone(phone) {

  let result =  await db.query("SELECT * FROM users WHERE phone = $1;", [phone]).catch(e => console.error(e.stack));
  return parseResult(result, { phone });
};

async function loadUserByWechatOpenid(openid) {
  let result =  await db.query("SELECT * FROM users WHERE openid = $1;", [openid]).catch(e => console.error(e.stack));
  return parseResult(result, { openid });
};

async function loadUserById(id) {
  let result =  await db.query("SELECT * FROM users WHERE id = $1;", [id]).catch(e => console.error(e.stack));
  return parseResult(result, { id });
};

function parseResult(result, param) {
  if (result.rows.length > 0) {
    return result.rows[0];
  } else {
    console.log(`User can not be found by ${JSON.stringify(param)}`)
    return false;
  }
};

module.exports = { loadUserByEmail, loadUserByPhone, loadUserById, loadUserByWechatOpenid };