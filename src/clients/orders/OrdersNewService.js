App.factory('OrdersNewService', function ($q, Common) {

    var db = Common.getConnection();

    return {
        getProducts: function () {
            var q = $q.defer();
            var sql = 'select p.*, ' +
                'ifnull((select sum(get_qty) from client_stock_card where icode=p.icode) - (select sum(paid_qty) from client_stock_card where icode=p.icode), 0) as balance ' +
                'from products as p where p.icode is not null order by p.name';
            db.raw(sql)
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        },

        getProductsOld: function () {
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
