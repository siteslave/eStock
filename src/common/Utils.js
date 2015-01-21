App.factory('Utils', function ($q, Common) {

    var db = Common.getConnection();

    return {
        getOffice: function () {

            var q = $q.defer();

            db('sys_config')
                .select()
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        }
    };
});