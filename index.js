var path = require('path')
var util = require('util')
var express = require('express')
var address = require('network-address')
var updateNotifier = require('update-notifier')
var powerOff = require('power-off')
var sleepMode = require('sleep-mode')
var delay = require('delay')
var Conf = require('conf')
var config = new Conf()
var pkg = require('./package.json')

var app = express()
var notifier = updateNotifier({ pkg: pkg })

app.use(express.static(path.join(__dirname, 'public')))

app.delete('/', function (req, res) {
  res.end()
  util.log('exit')
  process.exit()
})

app.post('/power-off', function (req, res) {
  Promise.race([
    new Promise(function (resolve, reject) {
      powerOff(function (err, stderr, stdout) {
        if (err) {
          util.log(err)
          reject()
        } else {
          resolve()
        }
      })
    }),
    delay(200)
  ]).then(function () {
    res.status(200).end()
  }).catch(function () {
    res.status(500).json({ error: 'Can\'t run power-off' })
  })
  
  
})

app.post('/sleep', function (req, res) {
  Promise.race([
    new Promise(function (resolve, reject) {
      sleepMode(function (err, stderr, stdout) {
        if (err) {
          util.log(err)
          reject()
        } else {
          resolve()
        }
      })
    }),
    delay(200)
  ]).then(function () {
    res.status(200).end()
  }).catch(function () {
    res.status(500).json({ error: 'Can\'t run power-off' })
  })
})

app.get('/address', function (req, res) {
  res.json({ address: address() })
})

app.get('/update', function (req, res) {
  updateNotifier({
    pkg: pkg,
    callback: function (err, update) {
      if (err) return res.json({})
      res.json(update)
    }
  })
})

var port = config.get('port') || 5709

app.listen(port, function () {
  util.log('stop-server listening on port ' + port)
})
