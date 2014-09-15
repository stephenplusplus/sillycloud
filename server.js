'use strict';

var fs = require('fs');
var https = require('http');

var actions = require('./actions');

var APIS = {
  GET: {
    '/api/users/': actions.getUser,
    '/api/users': actions.getUsers,
    '/api/files/': actions.getFile
  },
  POST: {
    '/api/users/': actions.saveUser,
    '/api/user': actions.createUser
  }
};

function handleRequest(req, res) {
  for (var apiUrl in APIS[req.method]) {
    if (req.url.indexOf(apiUrl) === 0) {
      APIS[req.method][apiUrl](req, res);
      return;
    }
  }

  fs.createReadStream('public/' + req.url)
    .on('error', function() {
      fs.createReadStream('public/index.html').pipe(res);
    })
    .pipe(res);
}

https.createServer(handleRequest).listen(8080);