App.factory('LoginService', function ($q, Common) {

    var db = Common.getConnection();
    var md5 = require('MD5');

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

            db('users')
                .where('username', username)
                .where('password', md5(password))
                .limit(1)
                .exec(function (err, rows) {
                    console.log(rows);

                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        }
    };

});