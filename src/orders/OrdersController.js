// Order controller
App.controller('OrdersController', function($scope, OrdersService, LxNotificationService, LxDialogService) {

    $scope.showAddItemForm = false;

    $scope.showNewOrder = function () {
        LxDialogService.open('mdlNewOrder');
    };

    $scope.closeingNewOrder = function () {
        $scope.showAddItemForm = false;
    };

    $scope.clearAddItemForm = function () {
        $scope.showAddItemForm = false;
        $scope.newProductQty = 1;
    };

    // Get staff list
    OrdersService.getStaffList()
    .then(function (rows) {
        $scope.staff = rows;
    }, function (err) {
        console.log(err);
        LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู Log.');
    });

    $scope.showAddItem = function () {
        $scope.showAddItemForm = true;
        $scope.newProductQty = 1;
    };

    $scope.checkNumber = function (n) {
        return angular.isNumber(n) && n > 0;
    };

});
