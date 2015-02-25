App.factory('ImportService', function($q, $http, Common) {
    var db = Common.getConnection(),
        config = Common.getConfigure();

    return {
        dcGetProduct: function(config) {

            var q = $q.defer();

            var options = {
                method: 'GET',
                url: config.dc.url + '/products',
                params: {
                    hospcode: config.dc.hospcode,
                    key: config.dc.private_key
                }
            };

            $http(options)
                .success(function(data) {
                    q.resolve(data.rows);
                })
                .error(function(data, status, headers, config) {
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
                        var isDuplicated = rows[0].total > 0 ? true : false;
                        q.resolve(isDuplicated);
                    }
                });

            return q.promise;
        }

    };

});
