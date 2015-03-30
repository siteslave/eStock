App.factory('OrdersNewService', function ($q, Common) {

    var db = Common.getConnection();

    return {
        getProducts: function () {
            var q = $q.defer();
            db('products')
                .select()
                .orderBy('name', 'desc')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        }
    };

});
