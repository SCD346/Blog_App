var Sequelize = require('sequelize');
var sequelize = new Sequelize('postgres://user:password@localhost/my_db');

//define a message
var message = sequelize.define('message', {
	messageId: Sequelize.STRING,
	title: Sequelize.STRING,
	body: Sequelize.text,
});

//define a user
var user = sequelize.define('user', {
	userId: Sequelize.STRING,
	userName: Sequelize.STRING, 
	email: Sequelize.text,
});

//a user can have many messages...
user.hasMany(message);

//... but a message belongs to a single user.
message.belongsTo(user);
sequelize

//sync the models
.sync() .then(function(){

//then create a user
//turns into INSERT INTO "user" ("userId", "userName", "email") VALUES (DEFAULT, 'someUserName', 'someEmail@email.com') return user.create({
userId: 'someUserName' })
}) .then(function(person){


	
//then create a message for that person
//turns into INSERT INTO "messages" ("messageId", "title", "body", "email") // VALUES (DEFAULT, 'Interesting Title', 'A great message body.') RETURNING *;
return message.createmessage({
title: 'Greeting', body: 'Hello World!',
}); });