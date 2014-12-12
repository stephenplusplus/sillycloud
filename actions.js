var fs = require("fs")
var multiparty = require("multiparty")

var gcloud = require("gcloud")({ projectId: "nth-circlet-705", keyFilename: "/Users/stephen/dev/keyfile.json" })
var dataset = gcloud.datastore.dataset()
var bucket = gcloud.storage().bucket("stephen-has-a-new-bucket")

module.exports.getUsers = function (req, res) {
  var query = dataset.createQuery(["Users"])
  dataset.runQuery(query, _handleResponse(res))
}

module.exports.getUser = function (req, res) {
  var id = req.url.split("/").pop()
  dataset.get(dataset.key(["Users", id]), _handleResponse(res))
}

module.exports.saveUser = function (req, res) {
  var id = req.url.split("/").pop()
  _saveUserFromKey(dataset.key(["Users", id]), req, res)
}

module.exports.createUser = function (req, res) {
  _saveUserFromKey(dataset.key("Users"), req, res)
}

module.exports.uploadFile = function (req, res) {
  var form = new multiparty.Form()
  form.parse(req, function (err, fields, files) {
    var file = files.file[0]

    fs.createReadStream(file.path)
      .pipe(bucket.file(fields.name[0]).createWriteStream())
      .on("error", function (err) {
        res.writeHead(err.code)
        res.end(JSON.stringify(err))
      })
      .on("complete", function () {
        res.writeHead(200)
        res.end()
      })
  })
}

module.exports.getFiles = function (req, res) {
  bucket.getFiles(function (err, files) {
    if (err) {
      res.writeHead(err.code)
      res.end(err.message)
      return
    }

    res.end(JSON.stringify(files.map(function (file) {
      return { name: file.name, contentType: file.contentType }
    }), null, 2))
  })
}

module.exports.getFile = function (req, res) {
  var filename = req.url.split("/").pop()
  bucket.file(filename).createReadStream()
    .on("error", function (err) { res.end(JSON.stringify(err)) })
    .pipe(res)
}

function _handleResponse(res) {
  return function (err, result) {
    if (err) {
      delete err.response
      res.writeHead(err.code)
      res.end(JSON.stringify(err))
      return
    }

    res.end(JSON.stringify(result, null, 2))
  }
}

function _saveUserFromKey(key, req, res) {
  var data = ""
  req
    .on("data", function (chunk) { data += chunk })
    .on("end", function (chunk) {
      dataset.save({ key: key, data: JSON.parse(data) }, _handleResponse(res))
    })
}
