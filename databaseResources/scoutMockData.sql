
-- Mock Troops
INSERT INTO troop (troop_nmbr, troop_phone_nmbr, troop_email, troop_type, troop_city, troop_state)
VALUES
  (101, '402-555-1001', 'btroop101@example.com', 'BTROOP', 'Omaha', 'NE'),
  (202, '402-555-2002', 'gtroop202@example.com', 'GTROOP', 'Lincoln', 'NE'),
  (303, '402-555-3003', 'mtroop303@example.com', 'MTROOP', 'Bellevue', 'NE');


-- Troop 101 Scout Leaders 
WITH t AS (
  SELECT troop_id FROM troop WHERE troop_nmbr = 101 AND troop_state = 'NE'
)
INSERT INTO scout_leader (scout_leader_first_name, scout_leader_last_name, troop_id, troop_leader_phone_nmbr, troop_leader_email)
SELECT 'Alice', 'Johnson', troop_id, '402-555-1101', 'alice.johnson@example.com' FROM t
UNION ALL
SELECT 'Bob', 'Smith', troop_id, '402-555-1102', 'bob.smith@example.com' FROM t;


-- Troop 202 Scout Leaders 
WITH t AS (
  SELECT troop_id FROM troop WHERE troop_nmbr = 202 AND troop_state = 'NE'
)
INSERT INTO scout_leader (scout_leader_first_name, scout_leader_last_name, troop_id, troop_leader_phone_nmbr, troop_leader_email)
SELECT 'Carol', 'Davis', troop_id, '402-555-2201', 'carol.davis@example.com' FROM t
UNION ALL
SELECT 'David', 'Miller', troop_id, '402-555-2202', 'david.miller@example.com' FROM t;



-- Troop 303 Scout Leaders 
WITH t AS (
  SELECT troop_id FROM troop WHERE troop_nmbr = 303 AND troop_state = 'NE'
)
INSERT INTO scout_leader (scout_leader_first_name, scout_leader_last_name, troop_id, troop_leader_phone_nmbr, troop_leader_email)
SELECT 'Ellen', 'Brown', troop_id, '402-555-3301', 'ellen.brown@example.com' FROM t
UNION ALL
SELECT 'Frank', 'Wilson', troop_id, '402-555-3302', 'frank.wilson@example.com' FROM t;



-- Troop 101 Scouts
WITH t AS (
  SELECT troop_id FROM troop WHERE troop_nmbr = 101 AND troop_state = 'NE'
)
INSERT INTO scout (scout_first_name, scout_last_name, troop_id)
SELECT first_name, last_name, troop_id FROM t
CROSS JOIN (
  VALUES
    ('Liam', 'Harrington'),
    ('Noah', 'Bennett'),
    ('Ethan', 'Calloway'),
    ('Mason', 'Draper'),
    ('Logan', 'Fitzgerald'),
    ('Caleb', 'Hawthorne'),
    ('Owen', 'Kensington'),
    ('Wyatt', 'Merrick'),
    ('Henry', 'Radcliffe'),
    ('Jack', 'Winslow')
) AS s(first_name, last_name);


-- Troop 202 Scouts
WITH t AS (
  SELECT troop_id FROM troop WHERE troop_nmbr = 202 AND troop_state = 'NE'
)
INSERT INTO scout (scout_first_name, scout_last_name, troop_id)
SELECT first_name, last_name, troop_id FROM t
CROSS JOIN (
  VALUES
    ('Ava', 'Montgomery'),
    ('Sophia', 'Kensington'),
    ('Isabella', 'Rowland'),
    ('Mia', 'Chambers'),
    ('Charlotte', 'Ellington'),
    ('Harper', 'Winslow'),
    ('Amelia', 'Brighton'),
    ('Evelyn', 'Carrington'),
    ('Abigail', 'Prescott'),
    ('Ella', 'Hathaway')
) AS s(first_name, last_name);


-- Troop 303 Scouts
WITH t AS (
  SELECT troop_id FROM troop WHERE troop_nmbr = 303 AND troop_state = 'NE'
)
INSERT INTO scout (scout_first_name, scout_last_name, troop_id)
SELECT first_name, last_name, troop_id FROM t
CROSS JOIN (
  VALUES
    ('Oliver', 'Sanderson'),
    ('Elijah', 'Briarwood'),
    ('James', 'Lockridge'),
    ('Benjamin', 'Fairchild'),
    ('Lucas', 'Ashford'),
    ('Alexander', 'Pendleton'),
    ('Michael', 'Redmond'),
    ('Daniel', 'Carruthers'),
    ('Matthew', 'Hollingsworth'),
    ('Samuel', 'Tremont')
) AS s(first_name, last_name);
