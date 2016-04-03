(() => {
    'use strict';

    var express = require('express');
    var app = express();
    var http = require('http').Server(app);
    var server;
    var io = require('socket.io')(http);
    var multiplayer_server = require('./multiplayer_server')(io, app);
    // var fs = require('fs');

    // let exampleHtml;
    // fs.readFile(`./example.html`, (err, file) => {
    //     exampleHtml = file.toString();
    // });
    //
    // app.get(`/`, (req, res) => {
    //     res.set('Content-Type', 'text/html');
    //     res.send(exampleHtml);
    // });
    app.use(express.static(__dirname + '/demo-page'));

    multiplayer_server.init('mp').then(() => {
        multiplayer_server.start().then(() =>  {
            server = http.listen(process.env.PORT || 8081, () => {
                console.log(`Listening on ${server.address().port}`);
            });
        });
    });
})();
