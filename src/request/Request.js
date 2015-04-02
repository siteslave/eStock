App.config(function ($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'RequestMain.html',
            controller: 'RequestController'
        })
        .when('/approve/:orders_id', {
            templateUrl: 'RequestApprove.html',
            controller: 'ApproveController'
        })
        .otherwise({ redirectTo: '/' });

});