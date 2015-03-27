App.factory('LoginService', function ($q, Common) {

    var db = Common.getConnection();
    var crypto = require('crypto');

    return {
        getPeriods: function () {
            var q = $q.defer();

            db('periods')
                .orderBy('name', 'desc')
                .exec(function (err, rows) {
                    if (err) {
                        q.reject(err);
                    } else {
                        q.resolve(rows);
                    }
                });

            return q.promise;
        },

        doLogin: function (username, password) {
            var q = $q.defer();
            var encryptPass = crypto.createHash('md5').update(password).digest('hex');

            db('users')
                .where('username', username)
                .where('password', encryptPass)
                .limit(1)
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        }
    };

});
