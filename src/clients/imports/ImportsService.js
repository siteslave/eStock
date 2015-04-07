App.factory('ImportsService', function ($q, Common) {

    var dbHIS = Common.getHISConnection();
    var db = Common.getConnection();

    return {
        getPayment: function (startDate, endDate) {
            var q = $q.defer();

            dbHIS('opitemrece as o')
                .select('o.hos_guid as guid', 'o.icode', 'o.hn', 'o.vn', 'o.an', 'o.qty',
                'd.unitcost as cost', 'pttype', 'd.unitprice as price', 'o.vstdate', 'o.rxdate')
                .innerJoin('drugitems as d', 'd.icode', 'o.icode')
                .whereBetween('o.rxdate', [startDate, endDate])
                .exec(function (err, rows) {
                    if (err) {
                        q.reject(err);
                    } else {
                        q.resolve(rows);
                    }
                });

            return q.promise;
        },

        importDrugPayment: function (v) {
            var q = $q.defer();

            var sql = 'insert into his_payments set icode=?, hn=?, vn=?, ' +
                'an=?, qty=?, cost=?, price=?, vstdate=?, rxdate=?, pttype=? ' +
                'ON DUPLICATE KEY UPDATE qty=?, price=?, cost=?, is_cutoff=?';

            db.raw(sql, [v.icode, v.hn, v.vn, v.an, v.qty, v.cost, v.price,
                            v.vstdate, v.rxdate, v.pttype, v.qty, v.price, v.cost, 'N'])
                .exec(function (err) {
                    if (err) {
                        q.reject(err);
                    } else {
                        q.resolve();
                    }
                });

            return q.promise;
        },

        saveHistory: function (startDate, endDate, username) {
            var q = $q.defer();
            db('payment_import_history')
                .insert({
                    start_date: startDate,
                    end_date: endDate,
                    username: username,
                    imported_date: moment().format('YYYY-MM-DD HH:mm:ss')
                })
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        isDuplicated: function (startDate, endDate) {
            var q = $q.defer();
            db('payment_import_history')
                .where('start_date', startDate)
                .where('end_date', endDate)
                .count('* as total')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else {
                        var duplicated = rows[0].total > 0;
                        q.resolve(duplicated);
                    }
                });

            return q.promise;
        },

        getImportedHistory: function () {
            var q = $q.defer();
            db('payment_import_history')
                .limit(10)
                .orderBy('imported_date', 'desc')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        },

        getCutOffPayment: function (startDate, endDate) {
            var q = $q.defer();

            db('his_payments')
                .whereBetween('vstdate', [startDate, endDate])
                .where('is_cutoff', 'N')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        },

        updateCutOffItem: function (icode, vn) {
            var q = $q.defer();

            db('his_payments')
                .where('icode', icode)
                .where('vn', vn)
                .update({
                    is_cutoff: 'Y'
                })
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        importStockCard: function (v) {
            var q = $q.defer();

            var act_date = moment(v.vstdate).format('YYYY-MM-DD');
            var created_at =  moment().format('YYYY-MM-DD HH:mm:ss');

            var sql = 'insert into client_stock_card set act_code=?, act_date=?, act_name=?, ' +
                'icode=?, paid_qty=?, created_at=? ON DUPLICATE KEY UPDATE paid_qty=?';

            db.raw(sql, [v.vn, act_date, v.hn, v.icode, v.qty, created_at, v.qty])
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        updatePaymentHistory: function(startDate, endDate) {
            var q = $q.defer();
            db('payment_import_history')
                .where('start_date', startDate)
                .where('end_date', endDate)
                .update({
                    cutoff: 'Y'
                })
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        }
    };

});