\c postgres
DROP DATABASE IF EXISTS gandalf;
CREATE DATABASE  gandalf;
\c gandalf;
CREATE EXTENSION pgcrypto;

--
-- Table structure for table `users`
--
CREATE TABLE users (
  username varchar(32) NOT NULL,
  password text NOT NULL,
  PRIMARY KEY(username)
);

-- DROPPING A LOAD ON users
INSERT INTO users (username, password) VALUES ('Gimli', crypt('Ihateelves', gen_salt('bf')));
INSERT INTO users (username, password) VALUES ('Legolas', crypt('Ilovegimli', gen_salt('bf')));
INSERT INTO users (username, password) VALUES ('Frodo', crypt('bagend', gen_salt('bf')));
INSERT INTO users (username, password) VALUES ('Gollum', crypt('myprecious', gen_salt('bf')));
INSERT INTO users (username, password) VALUES ('Gandalf the Grey', crypt('Shadowfax', gen_salt('bf')));
-- 
-- TABLE structure for messages 
--
CREATE TABLE messages (
  id serial,
  username varchar(32) NOT NULL, --the user id of the person being commented on, not the person leaving the comment
  message varchar(140) NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(username) REFERENCES users(username)
);
  
-- TAKING A DUMP ON comments 
INSERT INTO messages (username, message) VALUES ('Frodo', 'Does anybody want to help me get rid of this ring?');
INSERT INTO messages (username, message) VALUES ('Gollum', 'We will take the precious off your hands');

create role sauron with login;
ALTER USER sauron WITH PASSWORD 'mordor';

grant all on users to sauron;
grant all on messages to sauron;
grant all on messages_id_seq to sauron;