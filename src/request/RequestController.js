App.controller('RequestController', function ($scope, RequestService, LxNotificationService, LxProgressService) {

    $scope.all = function () {
        RequestService.all('A')
            .then(function (rows) {
                $scope.orders = rows;
            }, function (err) {
                console.log(err);
                LxNotificationService.error('Oop!');
            });
    };

    $scope.getFilter = function (approve) {
        RequestService.all(approve)
            .then(function (rows) {
                $scope.orders = rows;
            }, function (err) {
                console.log(err);
                LxNotificationService.error('Oop!');
            });
    };

    // init
    $scope.all();

});