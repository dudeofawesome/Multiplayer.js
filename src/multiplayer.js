/*
 * General Purpose Multiplayer Engine
 * @author Josh Gibbs - uPaymeiFixit@gmail.com, Louis Orleans - louis@0rleans.com
*/

'use strict';
class Multiplayer {
    constructor (self, sync, port, address) {
        var INTERVAL = 1000 / 30;

        if (!sync) {
            sync = ['x', 'y'];
        }
        var	socket;
        let data = {};
        let changed = false;
        let linkedObjs = {};
        let callbacks = [];

        if (typeof io === 'undefined') {
            throw 'error: The script "socket.io.js" was not found or configured incorrectly.';
        }

        if (typeof port === 'object') {
            socket = port;
        } else {
            var uri = address || (location.protocol + '//' + location.hostname) + ':' + (port || location.port || 4000);
            socket = io.connect(uri);
        }

        socket.on('connect', () => {
            console.log('Connected');
            console.log('Syncing ' + self);

            socket.on('tick', (data) => {
                for (let i in data) {
                    // TODO: figure out the /# thing...
                    if (i !== '/#' + socket.id) {
                        if (linkedObjs[i]) {
                            for (let j in data[i]) {
                                linkedObjs[i][j] = data[i][j];
                            }
                        }
                    }
                }
            });

            socket.on('message', (message) => {
                if (callbacks.message) {
                    for (let i in callbacks.message) {
                        callbacks.message[i](message);
                    }
                }
            });

            socket.on('data', (message) => {
                if (callbacks.message) {
                    for (let i in callbacks.message) {
                        callbacks.message[i](message);
                    }
                }
            });

            socket.on('newPlayer', (player) => {
                if (callbacks.newPlayer) {
                    for (let i in callbacks.newPlayer) {
                        callbacks.newPlayer[i](player);
                    }
                }
            });

            socket.on('deadPlayer', (id) => {
                if (callbacks.deadPlayer) {
                    for (let i in callbacks.deadPlayer) {
                        callbacks.deadPlayer[i](id);
                    }
                }
            });

            // catch-all
            socket.onevent = (packet) => {
                if (socket._callbacks['$' + packet.data[0]]) {
                    // onevent.call(this, packet);
                    for (let cb in socket._callbacks['$' + packet.data[0]]) {
                        socket._callbacks['$' + packet.data[0]][cb](packet.data[1]);
                    }
                } else {
                    if (callbacks[packet.data[0]]) {
                        for (let cb in callbacks[packet.data[0]]) {
                            callbacks[packet.data[0]][cb](packet.data[1]);
                        }
                    }
                }
            };

            setInterval(() => {
                changed = false;
                for (let i in sync) {
                    if (data[sync[i]] !== self[sync[i]]) {
                        data[sync[i]] = self[sync[i]];
                        changed = true;
                    }
                }
                if (changed) {
                    socket.emit('tick', data);
                }

                if (callbacks.tick) {
                    for (let i in callbacks.tick) {
                        callbacks.tick[i]();
                    }
                }
            }, INTERVAL);

            if (callbacks.connect) {
                for (let i in callbacks.connect) {
                    callbacks.connect[i]('/#' + socket.id);
                }
            }
        });

        this.addSyncKey = (key) => {
            sync.push(key);
        };

        this.addCallback = (type, callback) => {
            if (!callbacks[type]) {
                callbacks[type] = [];
            }
            callbacks[type].push(callback);
        };

        this.emit = (token, message) => {
            socket.emit(token, message);
        };

        this.message = (message) => {
            socket.emit('message', message);
        };

        this.linkPlayerID = (id, obj) => {
            linkedObjs[id] = obj;
        };

        this.unlinkPlayerID = (id) => {
            delete linkedObjs[id];
        };
    }
}
