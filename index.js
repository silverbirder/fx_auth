exports.auth = function auth(req, res) {
    datastore = require('@google-cloud/datastore')({
      projectId: 'ma-web-tools'
    });
    var AccountNumber = parseInt(req.query['AccountNumber']);
    if (isNaN(AccountNumber)) {
        res.sendStatus(404).end();
        return;
    }
    var q = datastore
    .createQuery('FxUser')
    .filter('AccountNumber', '=', AccountNumber)
    .filter('Invalid', '=', false);
    q.run(function(err, entities, info){
      var status = entities.length != 0 ? 200: 404;
      res.sendStatus(status).end();
    })
}