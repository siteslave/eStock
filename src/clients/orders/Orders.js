App.config(function ($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'OrdersMain.html',
            controller: 'OrdersMainController'
        })
        .when('/new', {
            templateUrl: 'OrdersNew.html',
            controller: 'OrdersNewController'
        })
        .when('/edit/:id', {
            templateUrl: 'OrdersEdit.html',
            controller: 'OrdersEditController'
        });

});
