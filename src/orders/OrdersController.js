// Order controller
App.controller('OrdersController', function ($scope, OrdersService, LxNotificationService, LxDialogService) {

    $scope.showAddItemForm = false;
    $scope.product = null;
    $scope.products = [];
    $scope.total = 0.00;

    $scope.showNewOrder = function () {
        $scope.products = [];
        $scope.product = null;
        $scope.total = 0;
        $scope.showAddItemForm = false;

        LxDialogService.open('mdlNewOrder');
    };

    $scope.ajax = {
        list: [],
        update: function (newFilter, oldFilter) {
            if (newFilter) {
                $scope.ajax.loading = true;
                OrdersService.getProductList(newFilter)
                    .then(function (rows) {
                        $scope.ajax.list = rows;
                        $scope.ajax.loading = false;
                    }, function (err) {
                        $scope.ajax.loading = false;
                        console.log(err);
                    });
            } else {
                $scope.ajax.list = false;
            }
        },
        loading: false
    };

    $scope.doAddItem = function () {
        var id = _.findIndex($scope.products, {
            'id': $scope.product.id
        });

        if (angular.isNumber($scope.newProductQty)) {
            if ($scope.newProductQty <= 0) {
                LxNotificationService.warning('กรุณาระบุตัวเลขที่มากกว่า 0');
            } else {
                if (id != -1) {
                    $scope.products[id].qty = $scope.product.qty + $scope.newProductQty;
                } else {
                    $scope.product.qty = $scope.newProductQty;
                    $scope.products.push($scope.product);
                }

                $scope.getTotal();
            }
        } else {
            LxNotificationService.warning('กรุณาระบุเป็นตัวเลข');
        }
    };

    $scope.removeItem = function (id) {
        var idx = _.findIndex($scope.products, {
            'id': id
        });

        $scope.products.splice(idx, 1);
        $scope.getTotal();
    };

    $scope.getTotal = function () {
        $scope.total = 0;

        _.forEach($scope.products, function (v) {
            $scope.total += v.qty * v.cost;
        });
    };

    $scope.setProduct = function (product) {
        $scope.product = product;
    };

    $scope.closeingNewOrder = function () {
        $scope.products = [];
        $scope.product = null;
        $scope.total = 0;
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