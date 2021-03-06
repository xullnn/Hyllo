-- --- There is a major difference on product design
-- The basic user system should remain unchanged
-- Now there's no food_items table in this version
-- There's only concept of 'meals'--also the table name
-- Some referential relationship are replaced by data structure like array and json
--
-- The First conception for the schema is:
--
--
-- users table should stay unchanged
--
-- - meals
--   - id primary key
--   - user_id f key
--   - food_items(names, or labels), use to store label of foods from the picture or store user input food names
--   - picture_ids f key, reference uploaded pictures for this meal
--   - memo, add possible notes to this meal
--   - timestamp, date + time, meals is normally counted(analyzed) in day, week, month
--
-- - states
--   - id primary key
--   - user_id f key
--   - records, states items, json, times in a day as key, object as value
--     - {'07:30': {
--         'energy': 7,
--         'emotion': 8,
--         'memo': 'did yoga'
--       },
--
--       '10;12': {
--       'energy': 9,
--       'emotion': 8,
--       'memo': 'ate blue berry'
--       },
--       }
--   - date, only date which day


-- Do I need a join table to connect meals and states in each day?