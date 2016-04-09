(() => {
    'use strict';

    var fs = require('fs');
    var timer;
    var INTERVAL = 1000 / 30;

    module.exports = (io, app) => {
        let players = {};

        let mp = {
            init: (subdir) => {
                return new Promise((resolve) => {
                    let mpScript;
                    fs.readFile(`./${(process.env.PRODUCTION) ? 'dist/' : 'src/'}multiplayer${(process.env.PRODUCTION) ? '.min' : ''}.js`, (err, file) => {
                        mpScript = file.toString();
                    });

                    app.get(`/${subdir}/`, (req, res) => {
                        res.send('Hello world');
                    });
                    app.get(`/${subdir}/multiplayer.js`, (req, res) => {
                        res.set('Content-Type', 'application/javascript');
                        res.send(mpScript);
                    });

                    io.on('connection', (client) => {
                        players[client.id] = {};
                        console.log(`Client #${client.id} connected`);
                        client.broadcast.emit('newPlayer', {id: client.id});

                        for (let i in io.sockets.sockets) {
                            if (io.sockets.sockets[i].id !== client.id) {
                                client.emit('newPlayer', {id: io.sockets.sockets[i].id});
                            }
                        }

                        client.on('tick', (data) => {
                            players[client.id] = data;
                        });

                        client.on('message', (message) => {
                            client.broadcast.emit('message', message);
                        });

                        client.on('disconnect', () => {
                            client.broadcast.emit('deadPlayer', client.id);
                            delete players[client.id];
                        });

                        // catch-all
                        client.onevent = function (packet) {
                            if (client._events[packet.data[0]]) {
                                client._events[packet.data[0]](packet.data[1]);
                            } else {
                                // TODO: Insert server side callback for custom scripting
                                client.broadcast.emit(packet.data[0], packet.data[1]);
                            }
                        };
                    });
                    resolve();
                });
            },
            start: () => {
                return new Promise((resolve) => {
                    timer = setInterval(() => {
                        io.volatile.emit('tick', players);
                    }, INTERVAL);
                    resolve();
                });
            },
            stop: () => {
                return new Promise((resolve) => {
                    resolve();
                });
            }
        };

        return mp;
    };
})();

/*
 * Multiplayer.JS
 * @author Josh Gibbs - uPaymeiFixit@gmail.com, Louis Orleans - louis@0rleans.com
*/
/*
console.log("Version 0.0.1\nBuilt on 2014.12.30\nServer started at " + new Date());

var PORT = 4000,
	MAXSERVERS = 1,
	TXspeed = 1000 / 30,
	rooms = [],
	players = [];

var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

var DATE = new Date();

function handler (req, res) {
  fs.readFile(__dirname + '/example.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading example.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {
	console.log("new user connected");
	socket.on('Reconnect', function (msg) {

	});
	socket.on('Get Rooms', function (msg) {
		if (msg == null) {
			var _rooms = [];
			for (var i = rooms.length - 1; i >= 0; i--) {
				_rooms.push({name: rooms[i].name, message: rooms[i].message, ID: rooms[i].ID, players: players[i].length + "/" + rooms[i].maxPlayers});
			};
			io.to(socket.id).emit('Get Rooms', _rooms);
		} else { // actually care about region request
			var _rooms = [];
			for (var i = rooms.length - 1; i >= 0; i--) {
				_rooms.push({name: rooms[i].name, message: rooms[i].message, ID: rooms[i].ID, players: players[i].length + "/" + rooms[i].maxPlayers});
			};
			io.to(socket.id).emit('Get Rooms', _rooms);
		}
	});
	socket.on('Join Room', function (ID) {
		var room = {};
		var i = rooms.length - 1;
		for (; i >= 0; i--) {
			if (rooms[i].ID == ID) {
				room = rooms[i];
			}
		}
		players[i].push(new Player());
		io.to(socket.id).emit('Join Room', room);
	});
	socket.on('Create Room', function (msg) {
		if (rooms.length < MAXSERVERS) {
			var room = new Room();
			if (msg.name != null)
				room.name = msg.name;
			if (msg.message != null)
				room.message = msg.message;
			if (msg.maxPlayers != null && msg.maxPlayers > 0)
				room.maxPlayers = msg.maxPlayers;
			rooms.push(room);
			io.to(socket.id).emit('Join Room', room);
		}
	});
	socket.on('Update Players', function (msg) {
		for (var i = rooms.length - 1; i >= 0; i--) {
			for (var j = players[i].length - 1; j >= 0; j--) {
				if (socket.id == players[i][j].sID) {

				}
			};
		};
	});
	socket.on('Message', function (msg) {
		if (msg.to == null)
			io.emit('Message', msg.messge);
		else { // actually send ping to requested user
			io.emit('Message', msg.messge);
		}
	});
	socket.on('Ping', function (time) {
		io.to(socket.id).emit('Ping', time)
	});
});

app.listen(PORT, function () {
 	console.log('listening on *:' + PORT);
});



function findPlayer (ID) {
	ID = ID.split(':');
	var _room = ID[0];
	var _player = ID[1];
	return players[_room, _player];
}

// Predefined Objects
function Room () {
	this.name = "Server";
	this.message = "This is a standard message";
	this.ID = 0;
	this.maxPlayers = 32;
	this.enviroment = [];
}

function Player () {
	this.name = "Player";
	this.room = 0;
	this.ID = 0;
	this.sID = 0;
	this.health = 100;
	this.position = {x:0, y:0, z:0};
	this.rotation = {x:0, y:0, z:0};
	this.lastPosition = {x:0, y:0, z:0};
	this.lastRotation = {x:0, y:0, z:0};
}
*/
