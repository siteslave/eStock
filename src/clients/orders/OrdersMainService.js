App.factory('OrdersMainService', function ($q, Common) {

    var db = Common.getConnection();

    return {
        all: function () {
            var q = $q.defer();
            db()
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });
        }
    };

});
