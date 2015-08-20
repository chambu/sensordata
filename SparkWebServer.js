var Spark = require('spark');

Spark.login({ username: 'gowthamj@gmail.com', password: 'g0wth@m77' }, function(err, body) {
  console.log('API call login completed on callback:', body);
});
