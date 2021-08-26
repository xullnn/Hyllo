var express = require('express')
var router = express.Router();
const { body, check, validationResult } = require('express-validator');
const db = require("../utils/db_query");

// const { loginViaWechat } = require("../utils/login");
// const validator = require('validator');

router.post(
  '/',

  // validate data

  check('name').isLength({min: 3}).withMessage('food item name must be greater than 2 chars'),
  check('amount').custom(value => {
    if (Number(value) <= 0) return Promise.reject("food amount can be less than or equal to zero");
    return Promise.resolve(true);
  }),
  check('unit').isIn(['g', 'kg', null, '']),

  async (req, res) => {
    let params = req.body;
    const checkResult = validationResult(req);
    if (!checkResult.isEmpty()) {
      res.status(400).send("Invalid input");
      return
    }

    let sql = "INSERT INTO food_items (name, amount, unit) VALUES ($1, $2, $3);";
    await db.query(sql, [params.name, params.amount, params.unit || null])

    res.status(200).send("Successfully POST on /food_items");
  });


router.get("/:id", async (req, res) => {
  let id = Number(req.params.id);
  let sql = "SELECT * FROM food_items WHERE id = $1;";
  let item;
  await db.query(sql, [id])
          .then(result => item = result.rows[0])

  res.status(200).json(item)
});

router.put("/:id", async (req, res) => {
  let id = Number(req.params.id);
  let params = req.body;
  let sql = "UPDATE food_items SET name = $1, amount = $2, unit = $3 WHERE id = $4";
  let item;
  await db.query(sql, [params.name, params.amount, params.unit || null, id])
              .then(result => item = result.rows[0])

  res.status(200).send("updated");
});

router.delete("/:id", async (req, res) => {
  let id = Number(req.params.id);
  let sql = "DELETE FROM food_items WHERE id = $1";
  await db.query(sql, [id]);

  res.status(200).send("deleted");
});


module.exports = router;