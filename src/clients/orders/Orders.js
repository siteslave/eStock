App.config(function ($routeProvider) {

    $routeProvider
        .when('/orders', {
            templateUrl: 'OrdersMain.html',
            controller: 'OrdersMainController'
        })
        .when('/orders/new', {
            templateUrl: 'OrdersNew.html',
            controller: 'OrdersNewController'
        })
        .otherwise({ redirectTo: '/orders' });

});
