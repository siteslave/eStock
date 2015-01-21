// Order services
App.factory('OrdersService', function ($q, Common) {

    var db = Common.getConnection();

    return {
        getStaffList: function () {
            var q = $q.defer();

            db('staff')
                .where('is_active', 'Y')
                .select()
                .exec(function (err, rows) {
                    if (err) q.rejecte(err);
                    else q.resolve(rows);
                });

            return q.promise;
        },

        getProductList: function (query) {
            var q = $q.defer();
            db('products')
                .where('name', 'like', '%' + query + '%')
                .orderBy('name', 'asc')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        }
    };

});