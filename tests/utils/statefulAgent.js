const superagent = require('superagent');
const db = require("../../utils/db_query");

async function makeLoginAgent(loginMethod='Stateful agent via superagent') {  // return promise resolved to the logged in agent
  let agent = superagent.agent(); // create an agent that keeps cookie

  let first_res = await agent.get(process.env.dev_test_url).then(res => res).catch(e => console.error(e.stack));
  let cookie = first_res.header['set-cookie'][0].split(/;/g)[0]
  let sid = cookie.split("=")[1].trim().split("s%3A")[1].split('.')[0]; // the db only takes part of the first part
  let originalSessionData;
  await db.query("SELECT sess FROM user_sessions WHERE sid = $1", [sid])
          .then(result => originalSessionData = result.rows)
          .catch(e => console.error(e.stack));

  let loginData = {
    isLoggedIn: true,
    user_name: 'Test User',
    loginMethod: loginMethod
  }

  let newSessionData = Object.assign(originalSessionData[0].sess, loginData)
  let sessionData = JSON.stringify(newSessionData);

  await db.query("UPDATE user_sessions SET sess = $1 WHERE sid = $2", [sessionData, sid])
          .catch(error => console.log("databaseError", error));
  return agent;
};



module.exports = { makeLoginAgent };

