// Order services
App.factory('OrdersService', function($q, $http, $window, Common) {

    var db = Common.getConnection(),
        config = Common.getConfigure();


    return {
        getStaffList: function() {
            var q = $q.defer();

            db('staff')
                .where('is_active', 'Y')
                .select()
                .exec(function(err, rows) {
                    if (err) q.rejecte(err);
                    else q.resolve(rows);
                });

            return q.promise;
        },

        getProductList: function(query) {
            var q = $q.defer();
            db('products')
                .where('name', 'like', '%' + query + '%')
                .whereRaw('length(icode) > 0')
                .orderBy('name', 'asc')
                .exec(function(err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        },

        doSaveOrders: function(data) {
            var q = $q.defer();

            db('orders')
                .returning('id')
                .insert({
                    orders_code: data.orderCode,
                    orders_date: data.orderDate,
                    staff_id: data.staffId,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                })
                .exec(function(err, id) {
                    if (err) q.reject(err);
                    else q.resolve(id);
                });

            return q.promise;
        },

        doSaveOrderDetail: function(orderId, data) {
            var q = $q.defer();

            db('orders_detail')
                .insert({
                    orders_id: orderId,
                    icode: data.icode,
                    code: data.code,
                    qty: data.qty,
                    cost: data.cost
                })
                .exec(function(err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        getOrdersList: function(opt) {
            var q = $q.defer();

            if (opt === 1) { // All
                db('orders as o')
                    .select('o.*', 's.fullname as staff_name', db.raw('(select sum(qty * cost) from orders_detail where orders_id=o.orders_id) as total'), db.raw('(select sum(qty) from orders_detail where orders_id=o.orders_id) as qty'))
                    .leftJoin('staff as s', 's.staff_id', 'o.staff_id')
                    .where('is_sent', 'Y')
                    .orderBy('o.orders_date', 'desc')
                    .orderBy('o.orders_code', 'desc')
                    .groupBy('o.orders_id')
                    .limit(100)
                    .exec(function(err, rows) {
                        if (err) q.reject(err);
                        else q.resolve(rows);
                    });
            } else { // Don't sent
                db('orders as o')
                    .select('o.*', 's.fullname as staff_name', db.raw('(select sum(qty * cost) from orders_detail where orders_id=o.orders_id) as total'), db.raw('(select sum(qty) from orders_detail where orders_id=o.orders_id) as qty'))
                    .leftJoin('staff as s', 's.staff_id', 'o.staff_id')
                    .where('o.is_sent', 'N')
                    .orderBy('o.orders_date', 'desc')
                    .orderBy('o.orders_code', 'desc')
                    .groupBy('o.orders_id')
                    .limit(100)
                    .exec(function(err, rows) {
                        if (err) q.reject(err);
                        else q.resolve(rows);
                    });
            }

            return q.promise;
        },

        removeOrder: function(id) {
            var q = $q.defer();

            db('orders')
                .where('orders_id', id)
                .delete()
                .exec(function(err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        getOrders: function(orderId) {
            var q = $q.defer();

            db('orders as o')
                .select('o.*', 's.fullname')
                .leftJoin('staff as s', 's.staff_id', 'o.staff_id')
                .where('o.orders_id', orderId)
                .exec(function(err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        },

        getOrdersDetail: function(orderId) {
            var q = $q.defer();

            db('orders_detail as o')
                .select('o.*', 'p.id', 'p.icode', 'p.code', 'p.name', 'p.units')
                .leftJoin('products as p', 'p.icode', 'o.icode')
                .where('o.orders_id', orderId)
                .exec(function(err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        },

        removeOrderDetail: function(orderId) {
            var q = $q.defer();

            db('orders_detail')
                .where('orders_id', orderId)
                .delete()
                .exec(function(err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        updateOrder: function(orderId, orders) {
            var q = $q.defer();

            db('orders')
                .where('orders_id', orderId)
                .update({
                    orders_code: orders.orderCode,
                    orders_date: orders.orderDate,
                    staff_id: orders.staffId
                })
                .exec(function(err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        sendOnline: function(orders) {

            var q = $q.defer();

            var options = {
                method: 'POST',
                url: config.dc.url + '/api/orders/save',
                data: {
                    hospcode: config.dc.hospcode,
                    key: config.dc.private_key,
                    orders: orders
                }
            };

            $http(options)
                .success(function(data) {
                    q.resolve(data);
                })
                .error(function(data, status, headers, config) {
                    q.reject('Internet connection failed.');
                });

            return q.promise;
        },

        search: function(orderCode) {
            var q = $q.defer();

            db('orders as o')
                .select(
                    'o.*', 's.fullname as staff_name',
                    db.raw('(select sum(qty * cost) from orders_detail where orders_id=o.orders_id) as total'),
                    db.raw('(select sum(qty) from orders_detail where orders_id=o.orders_id) as qty'))
                .leftJoin('staff as s', 's.staff_id', 'o.staff_id')
                .where('o.orders_code', 'like', '%' + orderCode + '%')
                .groupBy('o.orders_id')
                .limit(100)
                .exec(function(err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        },

        /** Update online status **/

        setOnline: function(orderId) {

            var q = $q.defer();

            db('orders')
                .where('orders_id', orderId)
                .update({
                    is_sent: 'Y',
                    sent_at: moment().format('YYYY-MM-DD HH:mm:ss')
                })
                .exec(function(err) {

                    if (err) q.reject(err);
                    else q.resolve();

                });

            return q.promise;
        },

        /* Get online status */
        getOnlineStatus: function () {

            var q = $q.defer();

            var options = {
                method: 'POST',
                url: config.dc.url + '/api/orders/all',
                data: {
                    hospcode: config.dc.hospcode,
                    key: config.dc.private_key
                }
            };

            $http(options)
                .success(function(data) {
                    q.resolve(data);
                })
                .error(function() {
                    q.reject('Internet connection failed.');
                });

            return q.promise;
        },

        /* Get status list */
        getStatusList: function () {
            var q = $q.defer();

            var options = {
                method: 'POST',
                url: config.dc.url + '/orders/status/list'
            };

            $http(options)
                .success(function(data) {
                    q.resolve(data);
                })
                .error(function() {
                    q.reject('Internet connection failed.');
                });

            return q.promise;
        },


        /* Cancel send online */
        doCancelOnline: function (orderCode) {
            var q = $q.defer();

            var options = {
                method: 'POST',
                url: config.dc.url + '/api/orders/cancel',
                data: {
                    order_code: orderCode,
                    hospcode: config.dc.hospcode,
                    key: config.dc.private_key
                }
            };

            $http(options)
                .success(function(data) {
                    q.resolve(data);
                })
                .error(function() {
                    q.reject('Internet connection failed.');
                });

            return q.promise;
        },

        /* Get order detail */
        getOnlineDetail: function (id) {
            var q = $q.defer();

            var options = {
                method: 'POST',
                url: config.dc.url + '/api/orders/detail',
                data: {
                    id: id,
                    hospcode: config.dc.hospcode,
                    key: config.dc.private_key
                }
            };

            $http(options)
                .success(function(data) {
                    q.resolve(data);
                })
                .error(function() {
                    q.reject('Internet connection failed.');
                });

            return q.promise;
        },

        updateClientOrdersStatus: function (id) {
            var q = $q.defer();

            var options = {
                method: 'POST',
                url: config.dc.url + '/api/orders/update_client_orders_stats',
                data: {
                    id: id,
                    hospcode: config.dc.hospcode,
                    key: config.dc.private_key
                }
            };

            $http(options)
                .success(function(data) {
                    q.resolve(data);
                })
                .error(function() {
                    q.reject('Internet connection failed.');
                });

            return q.promise;
        },

        /** Save receive order **/
        saveReceivedOrder: function (orders) {
            var q = $q.defer();

            db('received_orders')
                .insert({
                    orders_code: orders.orders_code,
                    imported_by: $window.sessionStorage.getItem('username'),
                    approved_date: moment(orders.created_at).format('YYYY-MM-DD'),
                    approved_by: orders.master_staff_name,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                })
                .returning('id')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        },

        saveMainStockCard: function (item) {
            var q = $q.defer();
            var sql = 'insert into main_stock_card set act_code=?, act_date=?, act_name=?, ' +
                'icode=?, get_qty=?, created_at=? ' +
                'ON DUPLICATE KEY UPDATE paid_qty=?';

            db.raw(sql, [item.act_code, item.act_date, item.act_name, item.icode,
                item.get_qty, item.created_at, item.paid_qty])
                .exec(function (err) {
                    if (err) {
                        q.reject(err);
                    } else {
                        q.resolve();
                    }
                });

            return q.promise;
        },

        updateOrderImportStatus: function (ordersCode) {
            var q = $q.defer();

            db('orders')
                .where('orders_code', ordersCode)
                .update({
                    is_imported: 'Y',
                    imported_at: moment().format('YYYY-MM-DD HH:mm:ss')
                })
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        isImported: function (orderCode) {
            var q = $q.defer();

            db('orders')
                .select('is_imported')
                .where('orders_code', orderCode)
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else {
                        var isExist = rows[0].is_imported == 'Y';
                        q.resolve(isExist);
                    }
                });

            return q.promise;
        },

        doCancelOnlineStatus: function (orderCode) {
            var q = $q.defer();

            db('orders')
                .where('orders_code', orderCode)
                .update({
                    is_sent: 'N',
                    sent_at: null
                })
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        }

    };

});
