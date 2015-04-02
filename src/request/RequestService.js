App.factory('RequestService', function ($q, Common) {

    var db = Common.getConnection();

    return {
        all: function (approve) {
            var sql = '';

            if (approve == 'Y') {
                sql = 'select co.id, co.orders_code, co.orders_date, co.orders_status, u.fullname, ' +
                    '(select sum(qty) from client_orders_detail where orders_id=co.id) as totalQty, ' +
                    '(select sum(qty*price) from client_orders_detail where orders_id=co.id) as totalPrice ' +
                    'from client_orders as co ' +
                    'left join users as u on u.id=co.user_id ' +
                    'where co.orders_status="Y"';
            } else if (approve == 'N') {
                sql = 'select co.id, co.orders_code, co.orders_date, co.orders_status, u.fullname,' +
                    '(select sum(qty) from client_orders_detail where orders_id=co.id) as totalQty, ' +
                    '(select sum(qty*price) from client_orders_detail where orders_id=co.id) as totalPrice ' +
                    'from client_orders as co ' +
                    'left join users as u on u.id=co.user_id ' +
                    'where co.orders_status="N"';
            } else {
                sql = 'select co.id, co.orders_code, co.orders_date, co.orders_status, u.fullname,' +
                    '(select sum(qty) from client_orders_detail where orders_id=co.id) as totalQty, ' +
                    '(select sum(qty*price) from client_orders_detail where orders_id=co.id) as totalPrice ' +
                    'from client_orders as co ' +
                    'left join users as u on u.id=co.user_id';
            }

            var q = $q.defer();
            db.raw(sql)
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        }

    };

});