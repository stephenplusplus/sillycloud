'use strict';

var gcloud = require('gcloud');

var dataset = new gcloud.datastore.Dataset({
  projectId: 'tactile-pulsar-697',
  credentials: require('../keyfile.json')
});

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

function _handleResponse(res) {
  return function(err, result) {
    if (err) {
      res.writeHead(err.message.match(/statusCode: (\d+),/)[1]);
    }
    res.end(err && err.message || JSON.stringify(result, null, 2));
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
