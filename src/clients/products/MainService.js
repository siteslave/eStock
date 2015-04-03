App.factory('MainService', function ($q, Common) {

    var db = Common.getConnection();
    var dbHIS = Common.getHISConnection();

    return {
        all: function () {
            var q = $q.defer();

            var sql = 'select p.*, ' +
                '(select sum(get_qty) from client_stock_card where icode=p.icode) as totalGet, ' +
                '(select sum(paid_qty) from client_stock_card where icode=p.icode) as totalPaid ' +
                'from products as p order by name';
            db.raw(sql)
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        },

        getDrugs: function (query) {
            var q = $q.defer();

            dbHIS('drugitems')
                .where('name', 'like', '%' + query + '%')
                .orderBy('name', 'asc')
                .limit(50)
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
                });

            return q.promise;
        },

        doMapping: function (code, icode) {

            var q = $q.defer();

            db('products')
                .update({
                    icode: icode
                })
                .where('code', code)
                .exec(function (err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        }
    };

});