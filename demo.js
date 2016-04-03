(() => {
    'use strict';

    var app = require('express')();
    var http = require('http').Server(app);
    var server;
    var socket = require('socket.io')(http);
    var multiplayer_server = require('./multiplayer_server')(socket, app);
    var fs = require('fs');


    let exampleHtml;
    fs.readFile(`./example.html`, (err, file) => {
        exampleHtml = file.toString();
    });

    app.get(`/`, (req, res) => {
        res.set('Content-Type', 'text/html');
        res.send(exampleHtml);
    });

    multiplayer_server.init('mp').then(() => {
        multiplayer_server.start().then(() =>  {
            server = http.listen(process.env.PORT || 8081, () => {
                console.log(`Listening on ${server.address().port}`);
            });
        });
    });
})();
