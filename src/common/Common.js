// Common
App.factory('Common', function () {
    // Read configure file.
    var config = jf.readFileSync(eStock.configFile);

    return {
        getConnection: function () {
            return require('knex')({
                client: 'mysql',
                connection: config.db,
                pool: {
                    min: 0,
                    max: 100
                }
            });
        },
        
        getConfigure: function () {
            return config;
        }
    };
});