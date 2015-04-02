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
                'ON DUPLICATE KEY UPDATE qty=?, price=?, cost=?';

            db.raw(sql, [v.icode, v.hn, v.vn, v.an, v.qty, v.cost, v.price,
                            v.vstdate, v.rxdate, v.pttype, v.qty, v.price, v.cost])
                .exec(function (err) {
                    if (err) {
                        q.reject(err);
                    } else {
                        q.resolve();
                    }
                });

            return q.promise;
        }
    };

});