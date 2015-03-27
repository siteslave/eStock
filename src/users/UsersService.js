// Users service
App.factory('UsersService', function ($q, Common) {

    var db = Common.getConnection();

    return {
        all: function () {
            var q = $q.defer();
            db('users')
                .select('id', 'username', 'fullname', 'is_active', 'last_login', 'is_admin')
                .orderBy('fullname', 'desc')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        },
        // Save
        save: function (data) {
            var q = $q.defer();
            db('users')
                .insert(data)
                .returning('id')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        },

        // Check duplicated
        checkDuplicated: function (username) {
            var q = $q.defer();
            db('users')
                .where('username', username)
                .count('* as total')
                .exec(function (err, rows) {
                    if (err) q.reject (err);
                    else {
                        var isDuplicated = rows[0].total > 0;
                        q.resolve(isDuplicated);
                    }
                });

            return q.promise;
        },

        // update
        update: function (user) {
            var q = $q.defer();
            db('users')
                .where('id', user.id)
                .update({
                    fullname: user.fullname,
                    is_admin: user.is_admin,
                    is_active: user.is_active
                })
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        }
    };

});
