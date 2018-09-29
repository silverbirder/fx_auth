const NOT_FOUND = 404;
const OK = 200;
const URL = "";

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
      var text = "["+NowYMD+"]:"+entity[0][0]['Name']+"\n"+profit;
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
    profit: data['pr'],
    swap  : data['sw'],
    commission: data['co'],
    openPrice: data['op'],
    openTime: data['ot'],
    closePrice: data['cp'],
    closeTime: data['ct'],
    expiration: data['ex'],
    symbol: data['sy'],
    lots: data['lo'],
    stopLoss: data['sl'],
    takeProfit: data['tp'],
    ticket: data['ti'],
    type: data['ty'],
    balance: data['ba'],
    accountNumber: data['an']
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