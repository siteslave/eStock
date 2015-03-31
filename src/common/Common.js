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
                },
                debug: true
            });
        },
        getHISConnection: function () {
            return require('knex')({
                client: 'mysql',
                connection: config.hos,
                pool: {
                    min: 0,
                    max: 100
                },
                debug: true
            });
        },
        
        getConfigure: function () {
            return config;
        }
    };
});