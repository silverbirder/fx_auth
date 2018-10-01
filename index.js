const NOT_FOUND = 404;
const OK = 200;
const URL = "https://hooks.slack.com/services/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";

exports.auth = function auth(req, res) {
    var AccountNumber = parseInt(req.body['an']);
    if (isNaN(AccountNumber)) {
        res.sendStatus(NOT_FOUND).end();
        return;
    }
    getEntity(AccountNumber).then(function(entity) {
      var status = entity[0].length != 0 ? OK: NOT_FOUND;
      res.sendStatus(status).end();
    }).catch(function(){
      res.sendStatus(NOT_FOUND).end();
      return;
    });
}

exports.slack = function slack(req, res) {
  var AccountNumber = parseInt(req.body['an']);
  if (isNaN(AccountNumber)) {
      res.sendStatus(404).end();
      return;
  }
  getEntity(AccountNumber).then(function(entity) {
    if (entity[0].length == 0) {
      res.sendStatus(404).end();
      return;
    }
    saveEntity(req.body).then(function() {
      var profit = req.body['pr'];
      var NowYMD = getNowYMD();
      var request = require('request');
      var url = URL;
      var text = "["+NowYMD+"]:"+entity[0][0]['Name']+"\n"+parseFloat(profit);
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
    }).catch(function(){
      res.sendStatus(404).end();
      return;
    });
}
function saveEntity(data) {
  datastore = require('@google-cloud/datastore')({
    projectId: 'ma-web-tools'
  });
  var ex_data = {
    message: data['ms'],
    profit: parseFloat(data['pr']),
    swap  : parseFloat(data['sw']),
    commission: parseFloat(data['co']),
    openPrice: parseFloat(data['op']),
    openTime: new Date(data['ot']),
    closePrice: parseFloat(data['cp']),
    closeTime: new Date(data['ct']),
    expiration: new Date(data['ex']),
    symbol: data['sy'],
    lots: parseFloat(data['lo']),
    stopLoss: parseFloat(data['sl']),
    takeProfit: parseFloat(data['tp']),
    ticket: parseInt(data['ti']),
    type: data['ty'],
    balance: parseFloat(data['ba']),
    accountNumber: parseInt(data['an']),
    period: data['pe']
  }
  return datastore.save({
    key: datastore.key('FxData'),
    data: ex_data
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

  return datastore.runQuery(q);
}

function getNowYMD(){
  var dt = new Date();
  var y = dt.getFullYear();
  var m = ("00" + (dt.getMonth()+1)).slice(-2);
  var d = ("00" + dt.getDate()).slice(-2);
  var result = y + "/" + m + "/" + d;
  return result;
}