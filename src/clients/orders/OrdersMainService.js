App.factory('OrdersMainService', function ($q, Common) {

    var db = Common.getConnection();

    return {
        getFilter: function (approve) {
            var q = $q.defer();

            if (approve) {
                db.raw('select cd.id, cd.orders_code, cd.orders_date, u.fullname as user_fullname, ' +
                'cd.orders_status, (select sum(qty) from client_orders_detail where orders_id=cd.id) as totalQty, ' +
                '(select sum(qty*price) from client_orders_detail where orders_id=cd.id) as totalPrice ' +
                'from client_orders as cd left join users as u on u.id=cd.user_id ' +
                'where cd.orders_status="Y"')
                    .exec(function (err, rows) {
                        if (err) q.reject(err);
                        else q.resolve(rows[0]);
                    });
            } else {
                db.raw('select cd.id, cd.orders_code, cd.orders_date, u.fullname as user_fullname, cd.orders_status, ' +
                '(select sum(qty) from client_orders_detail where orders_id=cd.id) as totalQty, ' +
                '(select sum(qty*price) from client_orders_detail where orders_id=cd.id) as totalPrice ' +
                ' from client_orders as cd  left join users as u on u.id=cd.user_id ' +
                'where cd.orders_status="N"')
                    .exec(function (err, rows) {
                        if (err) q.reject(err);
                        else q.resolve(rows[0]);
                    });
            }

            return q.promise;
        },

        getAll: function () {
            var q = $q.defer();

            db.raw('select cd.id, cd.orders_code, cd.orders_date, u.fullname as user_fullname, ' +
            'cd.orders_status, (select sum(qty) from client_orders_detail where orders_id=cd.id) as totalQty, ' +
            '(select sum(qty*price) from client_orders_detail where orders_id=cd.id) as totalPrice ' +
            'from client_orders as cd left join users as u on u.id=cd.user_id')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        },
        /**
         * Remove orders
         * @param id
         * @returns {*}
         */
        removeOrders: function (id) {
            var q = $q.defer();
            db('client_orders')
                .where('id', id)
                .delete()
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },
        /**
         * Remove products from orders
         * @param id
         * @returns {*}
         */
        removeOrdersDetail: function (id) {
            var q = $q.defer();
            db('client_orders_detail')
                .where('id', id)
                .delete()
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        }


    };

});
