DROP TABLE IF EXISTS meals;
DROP TABLE IF EXISTS food_items;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;

-- DROP TABLE [ IF EXISTS ] name [, ...] [ CASCADE | RESTRICT ]
-- users
  -- to register a user from wechat miniprogram it requires:
    -- nickname, required,(can be wechat granted)
    -- email, optional, (if registered from wechat, can be asked later)
    -- phone, optional, (can be wechat granted, can be asked later)
    -- password, optional (if registered from wechat, can be asked later)
    -- created_at, required auto

CREATE TABLE users (
  id serial PRIMARY KEY,
  nickname varchar(100) CHECK(length(nickname) > 2) UNIQUE NOT NULL,
  gender integer CHECK(gender in (0, 1, 2)), -- 0 male; 1 female; 2 unknown
  email text UNIQUE,
  phone varchar(50),
  password varchar(100) CHECK(length(password) > 5),
  wechat_openid text,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- user sessions
--   - id
--   - user_id
--   - session_id
--   - expire_time

CREATE TABLE user_sessions (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp with time zone
)
WITH (OIDS=FALSE);

ALTER TABLE "user_sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "user_sessions" ("expire");
-- This table holds food items such as egg, pork, fried potato, multiple food items
--  can be included in a single "meals" record.

-- The most tricky part is the 'unit' column, different countries tend to use
-- different measures, so I temporarily simplify it into 'g' and 'kg', 'unitless'
-- items such as egg apple can be measured in 'g' and they can also go roughly with
-- no unit.

CREATE TABLE food_items (
  id serial PRIMARY KEY,
  user_id integer
    REFERENCES users(id)
    ON DELETE CASCADE,
  name text NOT NULL UNIQUE CHECK (length(name) > 2),
  amount integer NOT NULL CHECK (amount > 0),
  unit varchar(50) CHECK(unit in ('g', 'kg')),
  custom boolean DEFAULT true
);


-- didn't enforce referential integrity, what if a 'food_item' is deleted
  -- when querying food_items from the food_item_ids array, a not-found food_item_id should be removed
-- array type: https://www.postgresql.org/docs/13/arrays.html
-- check length of array: https://www.postgresql.org/docs/13/functions-array.html

CREATE TABLE meals (
  id serial PRIMARY KEY,
  food_item_ids integer[] CHECK (array_length(food_item_ids, 1) > 0),
  memo text,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone,
  user_id integer
    NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE
);






