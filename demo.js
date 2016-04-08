(() => {
    'use strict';

    var express = require('express');
    var app = express();
    var http = require('http').Server(app);
    var server;
    var io = require('socket.io')(http);
    var multiplayer_server = require('./multiplayer_server')(io, app);

    app.use(express.static(__dirname + '/demo'));

    multiplayer_server.init('mp').then(() => {
        multiplayer_server.start().then(() =>  {
            server = http.listen(process.env.PORT || 8080, () => {
                console.log(`Listening on ${server.address().port}`);
            });
        });
    });
})();
