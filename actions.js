'use strict';

var gcloud = require('gcloud');

var dataset = new gcloud.datastore.Dataset({ projectId: 'tactile-pulsar-697' });
var bucket = new gcloud.storage.Bucket({ bucketName: 'sillycloud' });

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
      res.end(err.message);
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
