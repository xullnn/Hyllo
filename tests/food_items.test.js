const request = require('supertest');
const app = require('../app');
const db = require("../utils/db_query");


afterAll(async () => { // clear items possibly created by POST tests
  await db.query("DELETE FROM food_items WHERE id > $1;", [5])
});

describe("POST /food_items", () => {

  it("prevents invalid name input", () => {
    return request(app)
          .post("/food_items")
          .send({name: 'ab', amount: '100', unit: 'g'})
          .then(response => {
            expect(response.statusCode).toBe(400);
          });
  });

  it("prevents invalid amount input", () => {
    return request(app)
          .post("/food_items")
          .send({name: 'abc', amount: '0', unit: 'g'})
          .then(response => {
            expect(response.statusCode).toBe(400);
          });
  });

  it("prevents invalid unit input", () => {
    return request(app)
          .post("/food_items")
          .send({name: 'abc', amount: '10', unit: 'dozen'})
          .then(response => {
            expect(response.statusCode).toBe(400);
          });
  });

  it("allows unit to be empty string", () => {
    return request(app)
          .post("/food_items")
          .send({name: 'new food item 1', amount: '10', unit: ''})
          .then(response => {
            expect(response.statusCode).toBe(200);
          });
  });
});

describe("GET /food_items/:id", () => {

  it("Can read a food item by id", async () => {
    await db.query("INSERT INTO food_items (name, amount, unit) VALUES ($1, $2, $3);", ['new food item 2', 100, 'g'])

    await db.query("SELECT * FROM food_items;").then(result => last_item = result.rows.pop())

    let id = last_item.id;

    return request(app)
           .get(`/food_items/${id}`)
           .then(response => {
             let item = response.body;
             expect(item.name).toBe('new food item 2');
             expect(item.amount).toBe(100);
             expect(item.unit).toBe('g')
           })
  });

});

describe("PUT /food_items/:id", () => {
  it("Can updated food item with valid params", async () => {
    // create a new food item
    await db.query("INSERT INTO food_items (name, amount, unit) VALUES ($1, $2, $3);", ['new food item 3', 100, 'g'])

    // find the new food item
    let last_item;
    await db.query("SELECT * FROM food_items;").then(result => last_item = result.rows.pop())
    // send update request
    let id = last_item.id;
    return request(app)
           .put(`/food_items/${id}`)
           .send({name: 'updated name', amount: 150, unit: ''})
           .then(response => {
             expect(response.statusCode).toBe(200)
           })

    // check if the new item was updated in Database
    await db.query("SELECT * FROM food_items;").then(result => last_item = result.rows.pop())

    expect(last_item.name).toBe('updated name');
    expect(last_item.amount).toBe(150);
    expect(last_item.unit).toBe(null);
  })

});

describe("DELETE /food_items/:id", () => {
  it("Can delete a food item by id", async () => {
    // create a new food item
    await db.query("INSERT INTO food_items (name, amount, unit) VALUES ($1, $2, $3);", ['new food item 3', 100, 'g'])

    // find the new food item
    let last_item;
    await db.query("SELECT * FROM food_items;").then(result => last_item = result.rows.pop())

    let id = last_item.id;
    let count;

    await db.query("SELECT count(id) FROM food_items;").then(result => count = result.rows[0])
    return request(app)
           .delete(`/food_items/${id}`)
           .catch(console.log)
           .then(response => {
             expect(response.statusCode).toBe(200);
           })

    await db.query("SELECT count(id) FROM food_items;")
                .then(result => {
                  expect(result.rows[0]).toBe(count - 1);
                })


    await db.query("SELECT * FROM food_items WHERE id = $1;", [id])
                .then(result => {
                  expect(result.rows.length).toBe(0);
                })

  })
})

