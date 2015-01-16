// require dependencies
var path = require('path'),
    fs = require('fs'),
    jf = require('jsonfile'),
    gui = require('nw.gui'),
    win = gui.Window.get();

jf.spaces = 2;
// Global namespace.
var eStock = {};

eStock.version = '0.0.1';
eStock.saltkey = 'OhMyGod';
eStock.appPath = gui.App.dataPath;
eStock.configFile = path.join(eStock.appPath, 'config.json');

// Check configure file exist.
var isExist = fs.existsSync(eStock.configFile);
// Check file if not exist.
if (!isExist) {
    var defaultConfig = {
        db: {
            host: '127.0.0.1',
            port: 3306,
            database: 'estock',
            user: 'root',
            password: '789124'
        },
        dc: {
            url: 'http://his.mkh.go.th:3001',
            private_key: '123456'
        }
    };

    jf.writeFileSync(eStock.configFile, defaultConfig);
}
//
eStock.exit = function () {
    gui.App.quit();
};

// Main application module.
App = angular.module('App', ['lumx']);

App.controller('ToolbarController', function ($scope) {
    $scope.exitApplication = function () {
        eStock.exit();
    };

    $scope.reloadApp = function () {
        win.reload();
    };

    $scope.showDevTools = function () {
        win.showDevTools();
    };

    $scope.minimizedWindow = function () {
        win.minimize();
    };
});
