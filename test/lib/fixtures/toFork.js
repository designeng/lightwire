var express = require('express');

var pid = process.pid;
process.send({ pid });

var app = express();

app.get('/', function (req, res) {
    res.end('Forked process');
});

var server = app.listen(3002);

process.on('SIGINT', () => {
    server.close();
    process.exit();
});
