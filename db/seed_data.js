// const nextId = (() => {
//   let id = 0;
//   return (reset = false) => {
//     if (reset) id = 0;
//     return id += 1;
//   };
// })();


const food_items = [
  {
    name: 'Apple',
    amount: 300,
    unit: 'g',
  },

  {
    name: 'Egg',
    amount: 2
  },

  {
    name: 'Coffee',
    amount: 200,
    unit: 'g',
  },

  {
    name: 'Fried Chicken',
    amount: 1,
    unit: 'kg',
  },

  {
    name: 'Rice',
    amount: 150,
    unit: 'g',
  },
];

const users = [
  {
    gender: 1,
    nickname: 'Bench',
    email: 'Bench@gmail.com',
    password: '123456',
    created_at: new Date()
  },

  {
    gender: 2,
    nickname: 'Lisa',
    email: 'Lisa@gmail.com',
    password: '123456',
    created_at: new Date()
  },

  {
    nickname: 'John',
    email: 'John@gmail.com',
    password: '123456',
    created_at: new Date()
  }
];

const meals = [
  {
    food_item_ids: [1,2,4],
    memo: 'apple was too sweet',
    created_at: new Date(),
    user_id: 2
  },

  {
    food_item_ids: [2,3],
    created_at: new Date(),
    user_id: 2
  },

  {
    food_item_ids: [1,3],
    memo: 'coffee mixed with coconut',
    created_at: new Date(),
    user_id: 1
  },
]

module.exports = {users, food_items, meals};


