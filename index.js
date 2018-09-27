const NOT_FOUND = 404;
const OK = 200;

exports.auth = function auth(req, res) {
    var AccountNumber = parseInt(req.query['AccountNumber']);
    if (isNaN(AccountNumber)) {
        res.sendStatus(NOT_FOUND).end();
        return;
    }
    getEntity(AccountNumber).then(function(entity) {
      var status = entity.length != 0 ? OK: NOT_FOUND;
      res.sendStatus(status).end();
    }).catch(function(){
      res.sendStatus(NOT_FOUND).end();
      return;
    });
}

exports.slack = function slack(req, res) {
  var Money = parseInt(req.query['Money']);
  if (isNaN(Money)) {
    res.sendStatus(404).end();
    return;
  }
  var AccountNumber = parseInt(req.query['AccountNumber']);
  if (isNaN(AccountNumber)) {
      res.sendStatus(404).end();
      return;
  }
  getEntity(AccountNumber).then(function(entity) {
    if (entity.length == 0) {
      res.sendStatus(404).end();
      return;
    }
  
    var NowYMD = getNowYMD();
    var request = require('request');
    var url = "";
    var text = "["+NowYMD+"]\n"+entity[0]['Name']+":"+Money;
    var options = {
      uri: url,
      headers: {
        "Content-type": "application/json",
      },
      json: {
        "channel": "#prj-fx-ea",
        "username": "maa-bot",
        "icon_emoji": ":moneybag:",
        "text": text
      }
    };
    request.post(options, function(error, response, body){});
    res.sendStatus(200).end();
    }).catch(function(){
      res.sendStatus(404).end();
      return;
    });
}

function getEntity(AccountNumber) {
  datastore = require('@google-cloud/datastore')({
    projectId: 'ma-web-tools'
  });
  var q = datastore
  .createQuery('FxUser')
  .filter('AccountNumber', '=', AccountNumber)
  .filter('Invalid', '=', false)
  .limit(1);
  return new Promise(function(reslove, reject){
    q.run(function(err, entities, info){
      if(err) {
        reject(err);
        return;
      };
      reslove(entities);
    })
  }); 
}

function getNowYMD(){
  var dt = new Date();
  var y = dt.getFullYear();
  var m = ("00" + (dt.getMonth()+1)).slice(-2);
  var d = ("00" + dt.getDate()).slice(-2);
  var result = y + "/" + m + "/" + d;
  return result;
}