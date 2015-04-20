App.factory('MainService', function ($q, $http, Common) {

    var db = Common.getConnection();
    var dbHIS = Common.getHISConnection();
    var config = Common.getConfigure();

    return {
        all: function () {
            var q = $q.defer();

            var sql = 'select p.*, ' +
                '(select sum(get_qty) from main_stock_card where icode=p.icode) as totalGet, ' +
                '(select sum(paid_qty) from main_stock_card where icode=p.icode) as totalPaid ' +
                'from products as p order by name';
            db.raw(sql)
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows[0]);
                });

            return q.promise;
        },

        allWithCode: function () {
            var q = $q.defer();

            db('products')
                .whereNotNull('stdcode')
                .orderBy('name')
                .exec(function (err, rows) {
                    if (err) q.reject(err);
                    else q.resolve(rows);
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
        },

        dcGetProduct: function() {

            var q = $q.defer();

            var options = {
                method: 'POST',
                url: config.dc.url + '/api/products',
                data: {
                    hospcode: config.dc.hospcode,
                    key: config.dc.private_key
                }
            };

            $http(options)
                .success(function(data) {
                    if (data.ok) {
                        q.resolve(data.rows);
                    } else {
                        q.reject(data.msg);
                    }

                })
                .error(function(data, status) {
                    console.log(status);
                    q.reject('Internet connection failed.');
                });

            return q.promise;
        },

        doImportDrug: function(data) {
            var q = $q.defer();

            db('products')
                .insert({
                    name: data.name,
                    units: data.units,
                    cost: data.cost,
                    price: data.price,
                    code: data.code,
                    stdcode: data.stdcode
                })
                .exec(function(err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        doUpdateDrug: function(data) {
            var q = $q.defer();

            db('products')
                .update({
                    name: data.name,
                    price: data.price,
                    cost: data.cost,
                    stdcode: data.stdcode,
                    units: data.units
                })
                .where('code', data.code)
                .exec(function(err) {
                    if (err) q.reject(err);
                    else q.resolve();
                });

            return q.promise;
        },

        checkDuplicated: function(code) {
            var q = $q.defer();

            db('products')
                .count('* as total')
                .where('code', code)
                .exec(function(err, rows) {
                    if (err) q.reject(err);
                    else {
                        var isDuplicated = rows[0].total > 0;
                        q.resolve(isDuplicated);
                    }
                });

            return q.promise;
        },

        doUpdateStdCode: function (v) {
            var q = $q.defer();

            dbHIS('drugitems')
                .update({
                    did: v.stdcode
                })
                .where('icode', v.icode)
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
