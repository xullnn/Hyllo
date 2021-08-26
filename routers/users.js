const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const { parseLoginMethod, loginUserToSession } = require("../utils/login");
const { loginViaWechat } = require('../utils/wechat_login');
const validator = require('validator');
const { createUser } = require('../utils/create_user');
const  { loadUserByEmail, loadUserByPhone, loadUserById, loadUserByWechatOpenid } = require('../utils/load_user');
const { verifyPassword } = require('../utils/crypto');


router.post( // create new user
  "/",
  check('nickname').isLength({min: 3, max: 99}).withMessage("nickname must be > 2 chars"),

  body('email').custom((value, {req}) => {
    // if email exists then:
    if (value && value.trim().length !== 0) {
      // email has to be valid
      if (!validator.isEmail(value)) return Promise.reject("Invaid email.");

      // password must exist
      if (!req.body.password) return Promise.reject("Password must exist");
    }

    return Promise.resolve(true)
  }),

  body('phone').custom((value, {req}) => {
    // if phone exists then:
    if (value && value.trim().length !== 0) {
      // phone has to be valid
      if (!validator.isMobilePhone(value)) return Promise.reject("Invaid phone number.");

      // password must exist
      if (!req.body.password || req.body.password.trim().length === 0) {
        return Promise.reject("Password must exist");
      }
    }

    return Promise.resolve(true)
  }),

  body('password').custom(value => {
    if (value && value.trim().length !== 0 && !validator.isLength(value, {min: 6, max: 99})) {
      return Promise.reject("Invaid password.");
    }
    return Promise.resolve(true)
  }),

 (req, res) => {

  const checkResult = validationResult(req);

  let params = req.body;

  if (!checkResult.isEmpty()) {
    errorMessage = checkResult.errors.reduce((acc, err) => { return acc + `${err.msg} on ${err.param} --> ${err.value}`}, '');
    res.status(406).send(errorMessage);
  } else {
    try {
      createUser(params).then(userInfo => {
        let loginMethod = parseLoginMethod(params);

        req.session.user_id = params.user_id
        req.session.isLoggedIn = true;
        req.session.loginMethod = loginMethod;
        req.session.user_name = params.nickname;

        res.status(200).send(`Successfully created user: ${userInfo.nickname}`)
      }).catch(error => {
        console.error(error);
        res.status(406).send(`Failed creating user.`)
      })
    } catch(e) {
      console.error(e)
    }
  }
});


router.post("/signin/:method", async (req, res) => {
  let queryStrParams = req.params,
      bodyParams = req.body;

  if (queryStrParams['method'] === 'wechat') {
    let result = await loginViaWechat(req);
    if (result) {
      res.status(200).send(`Successfully logged in as ${bodyParams.userProfile.nickName}`) // wechat gave
    } else {
      res.status(406).send("Failed login via wechat")
    }
  } else if (queryStrParams['method'] === 'phone') {
    let user = await loadUserByPhone(bodyParams.phone);
    if (user) {
      let result = await verifyPassword(bodyParams.password, user.password);
      if (result) {
        loginUserToSession(req.session, user)
        res.status(200).send(`Successfully logged in with phone: ${bodyParams.phone}`)
      } else {
        res.status(406).send("Wrong password.")
      }
    } else {
      res.status(406).send(`Can't find a user with phone: ${bodyParams.phone}`)
    }
  } else if (queryStrParams['method'] === 'email') {
    let user = await loadUserByEmail(bodyParams.email);
    if (user) {
      let result = await verifyPassword(bodyParams.password, user.password);
      if (result) {
        loginUserToSession(req.session, user)
        res.status(200).send(`Successfully logged in with email: ${bodyParams.email}`)
      } else {
        res.status(406).send("Wrong password.")
      }
    } else {
      res.status(406).send(`Can't find a user with email: ${bodyParams.email}`)
    }
  }
});

router.post("/signout", (req, res) => {  // first requiring implement cookie store at wechat miniprogram
  req.session.isLoggedIn = false;  // use session id to query db, objectifize session data, change it, set back
  delete req.session;
  res.status(200).send()
});

router.get("/isLoggedIn", (req, res) => {
  if (req.session.isLoggedIn) {
    res.status(200).send(`User is logged in as ${req.session.user_name}`)
  } else {
    res.status(406).send(`User is not logged in, the session id is ${req.session.id}`)
  }
});

module.exports = router;