'use strict';

var fs = require('fs');
var multiparty = require('multiparty');

var PROJECT_CONFIG = require('./project.conf.js');

var gcloud = require('gcloud');
var dataset = new gcloud.datastore.Dataset(PROJECT_CONFIG);
var bucket = new gcloud.storage.Bucket(PROJECT_CONFIG);

function getUsers(req, res) {
  var query = dataset.createQuery(['Users']);
  dataset.runQuery(query, _handleResponse(res));
}
module.exports.getUsers = getUsers;

function getUser(req, res) {
  var id = req.url.split('/').pop();
  dataset.get(dataset.key('Users', id), _handleResponse(res));
}
module.exports.getUser = getUser;

function saveUser(req, res) {
  var id = req.url.split('/').pop();
  _saveUserFromKey(dataset.key('Users', id), req, res);
}
module.exports.saveUser = saveUser;

function createUser(req, res) {
  _saveUserFromKey(dataset.key('Users', null), req, res);
}
module.exports.createUser = createUser;

function uploadFile(req, res) {
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    var file = files.file[0];
    fs.createReadStream(file.path)
      .pipe(bucket.createWriteStream(fields.name[0], {
        contentType: file.headers['content-type']
      }))
      .on('error', function(err) {
        res.writeHead(err.code);
        res.end(JSON.stringify(err));
      })
      .on('complete', function() {
        res.writeHead(200);
        res.end();
      });
  });
}
module.exports.uploadFile = uploadFile;

function getFiles(req, res) {
  bucket.list(function(err, files) {
    if (err) {
      res.writeHead(err.code);
      res.end(err.message);
      return;
    }
    files = files.map(function(file) {
      return {
        name: file.name,
        contentType: file.contentType
      };
    });
    res.end(JSON.stringify(files, null, 2));
  });
}
module.exports.getFiles = getFiles;

function getFile(req, res) {
  var filename = req.url.split('/').pop();
  bucket.createReadStream(filename)
    .on('error', function(err) {
      res.end(JSON.stringify(err));
    })
    .pipe(res);
}
module.exports.getFile = getFile;

function _handleResponse(res) {
  return function(err, result) {
    if (err) {
      res.writeHead(err.code);
      res.end(JSON.stringify(err));
      return;
    }
    res.end(JSON.stringify(result, null, 2));
  };
}

function _saveUserFromKey(key, req, res) {
  var data = '';
  req
    .on('data', function(chunk) {
      data += chunk;
    })
    .on('end', function(chunk) {
      data += (chunk || '');
      dataset.save({ key: key, data: JSON.parse(data) }, _handleResponse(res));
    });
}
