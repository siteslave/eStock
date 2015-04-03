App.factory('ApproveService', function ($q, Common) {

    var db = Common.getConnection();

    return {
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
                .select('o.id', 'o.qty', 'o.price', 'o.icode', 'p.name', 'p.units')
                .where('o.orders_id', orders_id)
                .leftJoin('products as p', 'p.icode', 'o.icode')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        },

        // Save main stock card
        saveMainStockCard: function (items) {
            var q = $q.defer();

            db('main_stock_card')
                .insert(items)
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        // Save client stock card
        saveClientStockCard: function (items) {
            var q = $q.defer();

            db('client_stock_card')
                .insert(items)
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        updateClientRequestStatus: function (orders_id) {
            var q = $q.defer();
            db('client_orders')
                .update({ orders_status: 'Y' })
                .where('id', orders_id)
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        getOrdersStatus: function (orders_id) {
            var q = $q.defer();

            db('client_orders')
                .select('orders_status')
                .where('id', orders_id)
                .limit(1)
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0].orders_status);
                });

            return q.promise;
        }

    };

});