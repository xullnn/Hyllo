const superagent = require('superagent');
const { loginUserToSession, parseLoginMethod } = require('./login');
const { createUser } = require('./create_user');
const { loadUserInfo } = require('./load_user');

async function loginViaWechat(req) {
  let wechatResponse = await authenticateWithWeChat(req).catch(e => console.error(e.stack));
  if (wechatResponse && wechatResponse.openid) {
    let wechat_openid = wechatResponse.openid,
        weChatUserProfile = req.body['userProfile'],
        params = {
          nickname: weChatUserProfile.nickName,
          gender: weChatUserProfile.gender
        };

    let userInfo = await loadUserByWechatOpenid(wechat_openid).catch(e => console.error(e.stack)); // check if it's existed user
      if (!userInfo) {  // create new user using wechat info
        params.wechat_openid = wechat_openid;
        let userInfo = await createUser(params).catch(e => console.error(e.stack))
      }

    let loginMethod = parseLoginMethod(params);
    userInfo.loginMethod = loginMethod;
    loginUserToSession(req.session, userInfo);
    return true;

  } else { // failed at wechat api call
    return false
  }
};


async function authenticateWithWeChat(req) {  // resolve to success data object or reject with `false`
  let appid = process.env.dev_intake_wechat_appid,
      secret = process.env.dev_intake_wechat_secret,
      js_code = req.body['login_credential_code'],
      url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${js_code}&grant_type=authorization_code`;
  // query wechat http api to get openid
  let responseText = await superagent.get(url).then(res => res.text).catch(e => console.error(e.stack)),
      responseObject = JSON.parse(responseText),  // return openid and session_key
      wechat_openid = responseObject.openid;

  return wechat_openid ? responseObject : false;
};

module.exports = { loginViaWechat };