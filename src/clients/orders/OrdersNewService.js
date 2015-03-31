App.factory('OrdersNewService', function ($q, Common) {

    var db = Common.getConnection();

    return {
        getProducts: function () {
            var q = $q.defer();
            db('products')
                .select()
                .orderBy('name', 'asc')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        },
        /**
         * Save orders
         *
         * @param orders
         * @returns {*}
         */
        saveOrders: function (orders) {

            var q = $q.defer();
            db('client_orders')
                .insert(orders)
                .returning('id')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]); // return orders id
                });

            return q.promise;

        },
        /**
         * Save orders detail
         *
         * @param items
         * @return {*}
         */
        saveOrdersDetail: function (items) {
            var q = $q.defer();
            db('client_orders_detail')
                .insert(items)
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        }
    };

});
