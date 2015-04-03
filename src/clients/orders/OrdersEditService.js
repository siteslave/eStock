App.factory('OrdersEditService', function ($q, Common) {

    var db = Common.getConnection();

    return {
        getProducts: function () {
            var q = $q.defer();
            db('products')
                .select()
                .whereNotNull('icode')
                .orderBy('name', 'asc')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        },
        /**
         * Get orders detail
         * @param id
         * @returns {*}
         */
        getOrders: function (id) {
            var q = $q.defer();
            db('client_orders as o')
                .where('o.id', id)
                .limit(1)
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        },
        /**
         * Get products from orders
         * @param orders_id
         * @returns {*}
         */
        getOrdersDetail: function (orders_id) {
            var q = $q.defer();
            db('client_orders_detail as o')
                .select('o.id', 'o.qty', 'o.price', 'o.icode', 'p.name')
                .where('o.orders_id', orders_id)
                .leftJoin('products as p', 'p.icode', 'o.icode')
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
                .update({
                    orders_date: orders.orders_date,
                    updated_at: orders.updated_at
                })
                .where('id', orders.orders_id)
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve(); // return orders id
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
        },

        clearOldData: function (orders_id) {
            var q = $q.defer();
            db('client_orders_detail')
                .where('orders_id', orders_id)
                .delete()
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        }
    };

});
