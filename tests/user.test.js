const request = require('supertest');
const superagent = require('superagent');
const app = require('../app');
const db = require("../utils/db_query");
const { makeLoginAgent } = require('./utils/statefulAgent');
const crypto = require('crypto');
const { createUser } = require('../utils/create_user');

// let agent = require('superagent').agent(); // create an agent
// agent.get(url).then() // call the server to get cookie
// agent.jar.getCookie('intake_user_session_id', {domain: 'http://localhost:3000', path: '/'}).value
// this only works the server saved the session this means:
 // incoming session changed
 // or saveUninitialized set to true(every new session saved)

function genUid() {
  return crypto.randomBytes(8).toString('base64');
};

function genFakeEmail() {
  return genUid().match(/\w+/)[0] + 'test_user@gmail.com'
};

function genFakePhone() {
  let pre = '188';
  let aft = String(Math.random()).substr(2, 8);
  return pre + aft;
}

function copyObject(sourceObj) {
  return JSON.parse(JSON.stringify(sourceObj));
};

const testUserNames = []; // filled duration tests

 afterAll(() => {
   let clearTestUsers = "DELETE FROM users WHERE nickname = $1"
   testUserNames.forEach(name => {
     db.query(clearTestUsers, [name]).catch(e => console.error(e.stack))
   })
 })

describe("POST /users", () => {
  // if login with wechat, then neither email nor phone should exist

  it("requires user name to > 2 chars", () => {
    return request(app)
          .post("/users")
          .send({nickname: 'xy', password: '', email: ''})
          .then(response => {
            expect(response.statusCode).toBe(406)
            expect(response.text).toMatch(/nickname/i)
          }).catch(e => console.error(e.stack))
  });

  it("requires password to >= 6 chars", () => {
    return request(app)
          .post("/users")
          .send({nickname: genUid(), password: '12345', email: ''})
          .then(response => {
            expect(response.statusCode).toBe(406)
            expect(response.text).toMatch(/password/i)
          }).catch(e => console.error(e.stack))
  });

  it("requires email be valid", () => {
    return request(app)
          .post("/users")
          .send({nickname: genUid(), password: '123456', email: 'xxyyagmail.com'})
          .then(response => {
            expect(response.statusCode).toBe(406)
            expect(response.text).toMatch(/email/i)
          }).catch(e => console.error(e.stack))
  });

  it("requires phone be valid", () => {
    return request(app)
          .post("/users")
          .send({nickname: genUid(), password: '123456', phone: '123'})
          .then(response => {
            expect(response.statusCode).toBe(406)
            expect(response.text).toMatch(/phone/i)
          }).catch(e => console.error(e.stack))
  });

  it("requires email and password to be passed together", () => {
    return request(app)
          .post("/users")
          .send({nickname: genUid(), password: '', email: genFakeEmail()})
          .then(response => {
            expect(response.statusCode).toBe(406)
            expect(response.text).toMatch(/password/i)
          }).catch(e => console.error(e.stack))
  });

  it("require phone and password to be passed together", () => {
    return request(app)
          .post("/users")
          .send({nickname: genUid(), password: '', phone: genFakePhone()})
          .then(response => {
            expect(response.statusCode).toBe(406)
            expect(response.text).toMatch(/password/i)
          }).catch(e => console.error(e.stack))
  });

  it("can create user by valid email and password", () => {
    let params = {nickname: genUid(), password: '123456', email: genFakeEmail()}
    return request(app)
          .post("/users")
          .send(params)
          .then(response => {
            testUserNames.push(params.nickname);
            expect(response.statusCode).toBe(200)
          }).catch(e => console.error(e.stack))
  });

  it("can create user by valid phone and password", () => {
    let params = {nickname: genUid(), password: '123456', phone: genFakePhone()};
    return request(app)
          .post("/users")
          .send(params)
          .then(response => {
            testUserNames.push(params.nickname)
            expect(response.statusCode).toBe(200)
          }).catch(e => console.error(e.stack))
  });

  it("can create user by valid (phone + email) and password", () => {
    let params = {nickname: genUid(), password: '123456', email: genFakeEmail(), phone: genFakePhone()};
    return request(app)
          .post("/users")
          .send(params)
          .then(response => {
            testUserNames.push(params.nickname)
            expect(response.statusCode).toBe(200)
          }).catch(e => console.error(e.stack))
  });

});


describe('POST /users/signin/wechat', () => {
  it("fails login with wrong code", () => {
    return request(app)
          .post('/users/signin/wechat')
          .send({login_credential_code: 'wrong code 123'})
          .then(response => {
            expect(response.statusCode).toBe(406)
          }).catch(e => console.error(e.stack))
  });
});


describe("POST /users/signin/phone", () => {
  let params = {nickname: genUid(), password: '123456', phone: genFakePhone()};
  createUser(params);
  testUserNames.push(params.nickname);

  it("fails login with non-existd phone",  () => {
    return request(app)
          .post('/users/signin/phone')
          .send({nickname: genUid(), password: '123456', phone: genFakePhone()})
          .then(response => {
            expect(response.statusCode).toBe(406)
          }).catch(e => console.error(e.stack))

  });

  it("fails login with rigth phone but wrong password", () => {
    return request(app)
          .post('/users/signin/phone')
          .send({nickname: genUid(), password: '123113', phone: params.phone})
          .then(response => {
            expect(response.statusCode).toBe(406)
          }).catch(e => console.error(e.stack))
  })

  it("can login with right phone and right password", () => {
    return request(app)
          .post('/users/signin/phone')
          .send(params)
          .then(response => {
            expect(response.statusCode).toBe(200)
          }).catch(e => console.error(e.stack))
  })
});

describe("POST /users/signin/email", () => {
  let params = {nickname: genUid(), password: '123456', email: genFakeEmail()};
  let wrongEmailParams = copyObject(params); wrongEmailParams.email = 'wrong' + wrongEmailParams.email;
  let wrongPasswordParams = copyObject(params); wrongPasswordParams.password = 'wong' + wrongPasswordParams.password;
  createUser(params);
  testUserNames.push(params.nickname);

  it("fails login with non-existd email", () => {
    return request(app)
           .post('/users/signin/email')
           .send(wrongEmailParams)
           .then(response => {
             expect(response.statusCode).toBe(406)
           }).catch(e => console.error(e.stack))
  });

  it("fails login with rigth email but wrong password", () => {
    return request(app)
           .post('/users/signin/email')
           .send(wrongPasswordParams)
           .then(response => {
             expect(response.statusCode).toBe(406)
           }).catch(e => console.error(e.stack))
  })

  it("can login with right email and right password", () => {
    return request(app)
           .post('/users/signin/email')
           .send(params)
           .then(response => {
             expect(response.statusCode).toBe(200)
           }).catch(e => console.error(e.stack))
  })
});


// Note that superagent considers 4xx and 5xx responses (as well as unhandled 3xx responses) errors by default.
// For example, if you get a 304 Not modified, 403 Forbidden or 500 Internal server error response,
// this status information will be available via err.status.
// Errors from such responses also contain an err.response field with all of
// the properties mentioned in "Response properties". The library behaves in
// this way to handle the common case of wanting success responses and treating
// HTTP error status codes as errors while still allowing for custom logic around specific error conditions.
describe("Test stateful agent", () => {

  it("is not logged in with statelessAgent", async () => {
    let statelessAgent = superagent.agent();
    await statelessAgent.get(process.env.dev_test_url).then().catch(e => console.error(e.stack)); // then for sending request
    await statelessAgent.get(process.env.dev_test_url + "/users/isLoggedIn").then(response => {
      expect(response.statusCode).toBe(406)
    }).catch(error => {
      expect(error.status).toBe(406)
    });

    statelessAgent.del(process.env.dev_test_url);
  });

  it("is logged in with loggedInAgent", async () => {
    let loggedInAgent = await makeLoginAgent().then().catch(e => console.error(e.stack));
    await loggedInAgent.get(process.env.dev_test_url + "/users/isLoggedIn").then(response => {
      expect(response.statusCode).toBe(200)
    }).catch(error => {
      expect(error.status).not.toBe(200)
    })

    loggedInAgent.del(process.env.dev_test_url);
  })
})