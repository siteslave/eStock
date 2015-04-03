App.factory('StockCardService', function ($q, Common) {

    var db = Common.getConnection();

    return {
        getDetail: function (icode) {
            var q = $q.defer();
            db('products')
                .select()
                .where('icode', icode)
                .limit(1)
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        },
        getCard: function (icode, startDate, endDate) {
            var q = $q.defer();
            db('client_stock_card')
                .where('icode', icode)
                .whereBetween('act_date', [startDate, endDate])
                .orderBy('act_date')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        }
    };

});