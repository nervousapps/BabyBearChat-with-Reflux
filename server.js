var express = require('express');
var appl = express();
var path = require('path');
var assert = require('assert');
var crypto = require('crypto');
const fs = require('fs');

const app = require('https').createServer({
  key: fs.readFileSync('certif/localhost.key'),
  cert: fs.readFileSync('certif/localhost.crt'),
  ciphers: 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES256-SHA384',
  honorCipherOrder: true,
  secureProtocol: 'TLSv1_2_method'
},appl);

var io = require('socket.io')(app, { transports: ['websocket'] });

var MongoClient = require('mongodb').MongoClient
, assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/usersData';

var users = [];

var date = new Date();

appl.use('/src', express.static(path.join(__dirname, '/src')));

appl.use('/css', express.static(path.join(__dirname, '/css')));

appl.use('/build', express.static(path.join(__dirname, '/build')));

appl.get('/', function(req, res){
	res.sendFile(__dirname + "/index.html");
});


// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {

	db.collection("users").drop(); //à enlever en conditions réelles
	db.collection("groups").drop(); //à enlever

	db.createCollection("users", { "capped": false, "size": 100000, "max": 5000},
		function(err, results) {
			console.log("Collection created.");
		}
		);

	db.createCollection("groups", { "capped": true, "size": 100000, "max": 5000},
		function(err, results) {
			console.log("Collection created.");
		}
		);

	//Création du groupe principale (broadcast)
	var objNew = {"group" : "BabyBearChannel","users": [], "mess": []};

	db.collection("groups").insert(objNew, null, function (error, results) {
		if (error) throw error;

		console.log("Le document a bien été inséré");
	});

	io.on('connection', function(socket){


		assert.equal(null, err);
		console.log("Connected successfully to server");

		socket.on('connect', function(){
			console.log(" A user connected");
			io.emit('connect', "");
		});


		socket.on('disconnect', function(){
			console.log('user disconnected');
			quit(socket,db);
		});

		socket.on('data', function(jmess){
			console.log(jmess);

				//jmess = JSON.parse(message);


				switch(jmess.action){

					case "connection":
					connect(jmess, socket, db);
					break;

					case "broadcast":
					broadcast(jmess, socket, db);
					break;

					case "create":
					create(jmess, socket, db);
					break;

					case "join":
					join(jmess, socket, db);
					break;

					case "send":
					if(jmess.desti.charAt(0) === "_"){
						send(jmess, socket, 1, db);
					}else if(jmess.desti == "BabyBearChannel"){
						broadcast(jmess, socket, db);
					}else{
						send(jmess, socket, 0, db);
					}
					break;

					case "part":
					part(jmess, socket, db);
					break;

					case "list":
					list(jmess, socket, db);
					break;

					case "quit":
					quit(socket, db);
					break;

					case "discussion":
					displayMess(jmess, socket, db);
					break;


				}

			});
	});
});

app.listen(3000, function(){
	console.log('listening on *:3000');
});

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

function saltHashPassword(userpassword, salted) {
	if(salted != null){
		var passwordData = sha512(userpassword, salted);
	    console.log('UserPassword = '+userpassword);
	    console.log('Passwordhash = '+passwordData.passwordHash);
	    console.log('nSalt = '+passwordData.salt);
	    return passwordData;
	}else{
		var salt = genRandomString(16); /** Gives us salt of length 16 */
	    var passwordData = sha512(userpassword, salt);
	    console.log('UserPassword = '+userpassword);
	    console.log('Passwordhash = '+passwordData.passwordHash);
	    console.log('nSalt = '+passwordData.salt);
	    return passwordData;
	}
}


/**
* Connect
* Connection d'un utilisateur et ajout dans la liste des utilisateurs
*/
var connect = function(jmess, socket, db){

	bool = false;

	db.collection("users").find({"usrName": jmess.name}).toArray(function (err, result) {
		if (err) {
			console.log(err);
		} else if (result.length) {
			passwd = saltHashPassword(jmess.passwd, result[0].passwd.salt);
			console.log("Found: " + result[0].passwd.passwordHash + "   " + passwd.passwordHash);
			console.log(result[0].connected);
			if(passwd.passwordHash === result[0].passwd.passwordHash && result[0].connected == false){
				bool = true;
				users.push({"usrName" : jmess.name, "usrSocket" : socket});
				db.collection("users").update({"usrName" : jmess.name}, {$set: {"connected": true}}, function (err, numUpdated) {
					if (err) {
						console.log(err);
					} else if (numUpdated) {
						console.log('Updated Successfully %d document(s).', numUpdated);
					} else {
						console.log('No document found with defined "find" criteria!');
					}
				});

				function arrayElem(element, index, array){
					if(element.usrName != jmess.name){
						element.usrSocket.emit('updateUserList', jmess.name, false);
						socket.emit('updateUserList', element.usrName, false);
					}
				}
				users.forEach(arrayElem);
				socket.emit('rightusr', {"body":"Welcome back " + jmess.name + " !", "from" : "BabyBearChannel", "to": jmess.name, "date" : date.toLocaleString()});
			}else{
				socket.emit('wrongusr');
			}
		} else {
			console.log("true");
			bool = true;
			users.push({"usrName" : jmess.name, "usrSocket" : socket});
			passwd = saltHashPassword(jmess.passwd, null);
			var objNew = {"usrName" : jmess.name, "passwd" : passwd, "connected": true, "mess": []};

			db.collection("users").insert(objNew, null, function (error, results) {
				if (error) throw error;

				console.log("Le document a bien été inséré");
			});
			function arrayElem(element, index, array){
				if(element.usrName != jmess.name){
					element.usrSocket.emit('updateUserList', jmess.name, false);
					socket.emit('updateUserList', element.usrName, false);
				}
			}
			users.forEach(arrayElem);
			socket.emit('rightusr', {"body":"Hello " + jmess.name + "! How are you today?", "from" : "BabyBearChannel", "to": jmess.name, "date" : date.toLocaleString()});
			console.log('No document(s) found with defined "find" criteria!');
		}
	});
}

/**
* dislpayMess
* Affiche tous les messages d'une conversation
*/
var displayMess = function(jmess, socket, db){
	socket.emit('clearMsg', jmess.usrReach);

	if(jmess.usrReach === "BabyBearChannel"){
		db.collection("groups").find({"group": "BabyBearChannel"}).toArray(function (err, result) {
			if (err) {
				console.log(err);
			}else{
				function findMess(element, index, array){
						socket.emit('updateUserMess', {"to": "BabyBearChannel", "from":element.from, "body": element.body, "date": element.date}, false);
				}
				result[0].mess.forEach(findMess);
			}
		});
	}else if(jmess.usrReach.charAt(0) === "_"){
		db.collection("groups").find({"group": jmess.usrReach}).toArray(function (err, result) {
			if (err) {
				console.log(err);
			}else{
				function findMess(element, index, array){
					socket.emit('updateUserMess', {"to": element.to, "from":element.from, "body": element.body, "date": element.date});
				}
				result[0].mess.forEach(findMess);
			}
		});
	}else{
		db.collection("users").find({"usrName": jmess.usrName}).toArray(function (err, result) {
			if (err) {
				console.log(err);
			}else{
				console.log(result);
				console.log(result[0]);
				function findMess(element, index, array){
					if((element.to == jmess.usrName && element.from === jmess.usrReach) || (element.to == jmess.usrReach && element.from === jmess.usrName)){
						socket.emit('updateUserMess', {"to": element.to, "from":element.from, "body": element.body, "date": element.date});
						console.log({"to": element.to, "from":element.from, "body": element.body, "date": element.date});
					}
				}
				result[0].mess.forEach(findMess);
			}
		});
	}
}


/**
* Send
* Envoie un message à l'utilisateur souhaité
*/
var send = function(jmess, socket, to, db){

	var idx = 0;

	socket.emit('data', {"to": jmess.desti, "from":jmess.name, "body": jmess.msg, "date": date.toLocaleString()});
	console.log('Message send to emitter');


	// Cas to = 0, envoi d'un message à une personne
	if(to === 0){
		// Recherche du destinataire avec le nom correspondant
		function findDesti(element, index, array){
			if(element.usrName === jmess.desti){
				element.usrSocket.emit('data', {"to": jmess.desti, "from":jmess.name, "body": jmess.msg, "date": date.toLocaleString()});// envoi du message au destinataire
				idx = 1;
			}
		}

		users.forEach(findDesti);

		if(idx === 0){
			socket.emit('data', {"to":jmess.name, "from":"server", "msg": "The user is not connected or simply does not exist !", "date": date.toLocaleString()});
		}else if(idx === 1){
			var objNew = {"to" : jmess.desti , "from": jmess.name, "body" : jmess.msg, "date": date.toLocaleString()};


			db.collection("users").update({"usrName" : jmess.name}, {$push: {"mess": objNew}}, function (err, numUpdated) {
				if (err) {
					console.log(err);
				} else if (numUpdated) {
					console.log("Updated Successfully "+ numUpdated + "document(s).");
				} else {
					console.log('No document found with defined "find" criteria!');
				}
			});

			db.collection("users").update({"usrName" : jmess.desti}, {$push: {"mess": objNew}}, function (err, numUpdated) {
				if (err) {
					console.log(err);
				} else if (numUpdated) {
					console.log("Updated Successfully "+ numUpdated + "document(s).");
				} else {
					console.log('No document found with defined "find" criteria!');
				}
			});
		}

	}

	// Cas to = 1, envoi d'un message à un groupe
	if(to === 1){

		var groupUsers = [];
		var bool = false;
		var i = 0;

		// Recherche de l'utilisateur avec le nom correspondant
		db.collection("groups").find({"group": jmess.desti}).toArray(function (err, result) {
			if (err) {
				console.log(err);
			}else if(result.length){
				function findGroup(element, index, array){
					if(element === jmess.name){
						var objNew = {"to" : jmess.desti , "from": jmess.name, "body" : jmess.msg, "date": date.toLocaleString()};

						db.collection("groups").update({"group" : jmess.desti}, {$push: {"mess": objNew}}, function (err, numUpdated) {
							if (err) {
								console.log(err);
							} else if (numUpdated) {
								console.log('Updated Successfully %d document(s).', numUpdated);
							} else {
								console.log('No document found with defined "find" criteria!');
							}
						});
					}
					groupUsers.push(element);
				}
				result[0].users.forEach(findGroup);

				while(i != groupUsers.length){
					function findGroup(element, index, array){
						if(element.usrName === groupUsers[i] && element.usrName != jmess.name){
							element.usrSocket.emit('data', {"from":jmess.name, "to": jmess.desti, "body": jmess.msg, "date": date.toLocaleString()}); // envoi du message au groupe destinataire
						}
					}
					users.forEach(findGroup);
					i++;
				}
			}
		});
	}
}


/**
* Broadcast
* Le message en paramètre est envoyé à toutes les personnes connectées
*/
var broadcast = function(jmess, socket, db){

	socket.emit('data', {"to": jmess.desti, "from":jmess.name, "body": jmess.msg, "date": date.toLocaleString()});
	console.log('Message send to emitter');

	// Envoi du message à tous les utilisateurs sauf à l'éxpediteur
	function arrayElem(element, index, array){
		if(element.usrSocket != socket){
			element.usrSocket.emit('data', {"from":jmess.name, "to": "BabyBearChannel", "body":jmess.msg, "date": date.toLocaleString()});
		}
	}

	users.forEach(arrayElem);


	var objNew = {"to" : "BabyBearChannel" , "from": jmess.name, "body" : jmess.msg, "date": date.toLocaleString()};

	db.collection("groups").update({"group" : "BabyBearChannel"}, {$push: {"mess": objNew}}, function (err, numUpdated) {
		if (err) {
			console.log(err);
		} else if (numUpdated) {
			console.log('Updated Successfully %d document(s).', numUpdated);
		} else {
			console.log('No document found with defined "find" criteria!');
		}
	});
}

/**
* Create
* Permet de créer un groupe
*/
var create = function(jmess, socket, db){

	// Recherche de l'utilisateur avec le nom correspondant
	db.collection("groups").find({"group": jmess.group}).toArray(function (err, result) {
		if (err) {
			console.log(err);
		}else if(result.length){
			socket.emit('list', ["The group's name is already taken !"]);
		}else{
			//Création du groupe
			var objNew = {"group" : jmess.group,"users": [], "mess": []};

			db.collection("groups").insert(objNew, null, function (error, results) {
				if (error) throw error;

				console.log("Le document a bien été inséré");
			});

			//Ajout du créateur du groupe
			db.collection("groups").update({"group" : jmess.group}, {$push: {"users": jmess.name}}, function (err, numUpdated) {
				if (err) {
					console.log(err);
				} else if (numUpdated) {
					console.log('Updated Successfully %d document(s).', numUpdated);
				} else {
					console.log('No document found with defined "find" criteria!');
				}
			});

			socket.emit('data', {"from": "BabyBearChannel", "msg":"The group " + jmess.group + " was successfuly created !"});
			socket.emit('updateGroupList', jmess.group, false);
		}
	});
}

/**
* Join
* Permet de prendre e compte la connection d'un utilisateur
*/
var join = function(jmess, socket, db){

	var idx = 0;

	db.collection("groups").find({"group": jmess.group}).toArray(function(error, result){
		if(error){
			console.log(eroor);
		}else if(result.length){
			function findUser(element, index, array){
				if(element === jmess.name){
					idx = 1;
					socket.emit('updateGroupList', jmess.group, false);
				}

			}
			result[0].users.forEach(findUser);
			// Ajout de l'utilisateur

			if(idx === 0){
				db.collection("groups").update({"group" : jmess.group}, {$push: {"users": jmess.name}}, function (err, numUpdated) {
					if (err) {
						console.log(err);
					} else if (numUpdated) {
						console.log('Updated Successfully %d document(s).', numUpdated);
						socket.emit('updateGroupList', jmess.group, false);
					} else {
						console.log('No document found with defined "find" criteria!');
						socket.emit('data', {"from": "BabyBearChannel", "msg":"Le groupe n'existe pas !", "date": date.toLocaleString()});
					}
				});
			}
		}else{
			socket.emit('data', {"from": "BabyBearChannel", "msg":"Le groupe n'existe pas !", "date": date.toLocaleString()});
		}
	});

	/** Recherche du groupe et envoi d'une notification quand un nouvel arrivant se join au groupe
	db.collection("groups").find({"group": jmess.group}).toArray(function (err, result) {
		if (err) {
			console.log(err);
		}else{
			function notifGroup(element, index, array){
				function findSocket(element){
					return
				}
				users.find(findSocket);
			}
			result[0].users.forEach(notifGroup);
		}
	});*/
}

/**
* Part
* Permet de quitter un groupe
*/
var part = function(jmess, socket){

	var idx = 0;
	var group;

	socket.emit('updateGroupList', jmess.group, true);


	// Recherche de l'utilisateur avec le socket correspondant
	function findUsr(element, index, array){
		if(element.usrSocket === socket ){
			idx = index;
			group = element.usrGroup;
		}
	}

	users.forEach(findUsr);

	// Envoi d'une notification au groupe
	function findGroup(element, index, array){
		if(element.usrGroup === group && group != "main"){
			element.usrSocket.emit('data' , group + "> " + jmess.name + " left the group !");
		}
	}

	users.forEach(findGroup);
}

/**
* List
* Permet de lister toutes les personnes connectées à un groupe
*/
var list = function(jmess, socket, db){

	var groupUser = [];


	// Lister les utilisateurs connectés au groupe
	db.collection("groups").find({"group": jmess.group}).toArray(function (err, result) {
			if (err) {
				console.log(err);
			}else if(result.length){
				function findGroup(element, index, array){
					groupUser.push(element);
				}
				result[0].users.forEach(findGroup);

				socket.emit('list', groupUser);
			}
		});
}


/**
* Quit
* Permet de quitter proprement l'utilisateur
*/
var quit = function(socket, db){
	var idx = 0;
	var name = null;

	// Recherche de l'utilisateur avec le socket correspondant
	function findUsr(element, index, array){
		if(element.usrSocket === socket ){
			idx = index;
			name = element.usrName;
			//socket.destroy();
			db.collection("users").update({"usrName" : element.name}, {$set: {"connected": false}}, function (err, numUpdated) {
				if (err) {
					console.log(err);
				} else if (numUpdated) {
					console.log('Updated Successfully %d document(s).', numUpdated);
				} else {
					console.log('No document found with defined "find" criteria!');
				}
			});
		}else{
			element.usrSocket.emit('updateUserList', name, true);
		}
	}
	users.forEach(findUsr);

	if(name != null){
		db.collection("users").update({"usrName" : name}, {$set: {"connected": false}}, function (err, numUpdated) {
			if (err) {
				console.log(err);
			} else if (numUpdated) {
				console.log('Updated Successfully %d document(s).', numUpdated);
			} else {
				console.log('No document found with defined "find" criteria!');
			}
		});
	}

	if(idx != 0){
		users.splice(idx);
	}

}
