// Common
App.factory('Common', function () {
    // Read configure file.
    var config = jf.readFileSync(eStock.configFile);

    return {
        getConnection: function () {
            return require('knex')({
                client: 'mysql',
                connection: config.db
            });
        }
    };
});
