require('dotenv').config();
const {users, food_items, meals}  = require('./db/seed_data');
// const fs = require('fs');
const express = require('express');
const { Client, Pool } = require('pg');
const { body, check, validationResult } = require('express-validator');
const validator = require('validator')
const app = express();
const morgan = require('morgan');
const db = require("./utils/db_query");
const expressSession = require('express-session');
const sessionStore = require('connect-pg-simple')(expressSession);
const usersRoutes = require('./routers/users');
const foodItemsRoutes = require('./routers/food_items');

// to get cookie in response
// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

// req.body
// Contains key-value pairs of data submitted in the request body. By default, it is
// undefined, and is populated when you use body-parsing middleware such as express.json()
// or express.urlencoded().

app.use(express.json());
app.use(morgan("common"));

// use express-session and connect-pg-simple for user authentication
const pgPool = new Pool({
  host: process.env.dev_host,
  port: process.env.dev_port,
  connectionString: process.env.dev_db_string
});

app.use(
  expressSession({
    cookie: { // cookie is by default created, this step is to configure the cookie
      httpOnly: false,
      path: '/',
      secure: false, // Ensures the browser only sends the cookie over HTTPS
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000
    },
    name: 'intake_user_session_id', // cookie name
    secret: 'temp_secret_key',  // skey use to encypt cookie content(key/value pairs)
    store: new sessionStore({ // this guy knows how to store session data into backend databse
      pool: pgPool,
      tableName: 'user_sessions'
    }),
    resave: false,
    saveUninitialized: app.settings.env === 'development' ? true : false // this has an impact on a timeout issue with the test
    // unset: 'destroy'  //Control the result of unsetting req.session (through delete, setting to null, etc.).
                      // The default value is 'keep'.
  })
);

// app.use((req, res, next) => {
  // req.session.name = Math.random();
  // res.cookie('cookie_A', Math.random());
  // res.cookie('cookie_B', Math.random());
  // next()

//
// app.use((req, res, next) => {
//   // req.session.cookie.cart = {apple: 3}
//   console.log("session identifier: ", req.session.id)
//   console.log("session Object: ", req.session)
//   console.log("request cookies wit cookie-parse: ", req.cookies)
//   console.log("request Raw cookies: ", req.headers.cookie)
//   console.log("session properties: ", Object.getOwnPropertyNames(req.session))
//   console.log("cookie properties: ", Object.getOwnPropertyNames(req.session.cookie))
//   next();
// });

app.get("/", (req, res) => {
  console.log("env", app.settings.env)
  // // console.log(req.rawHeaders)
  // console.log(req.session)
  console.log(req.session.id)
  // console.log(req.session.user_id)
  // console.log(req.session.user_name)
  res.status(200).send("ROOT PATH")
});

app.use("/food_items", foodItemsRoutes);

app.use('/users', usersRoutes);

module.exports = app;

