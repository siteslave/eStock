App.controller('OrdersNewController', function ($scope, OrdersNewService, LxNotificationService, LxDialogService) {

    $scope.products = [];
    $scope.drugs = [];

    $scope.showNew = function () {
        LxDialogService.open('mdlNew');
    };

    $scope.addItem = function (code) {
        var qty = prompt('ระบุจำนวนที่ต้องการสั่ง', '0');

        if (qty > 0) {
            var idx = _.findIndex($scope.products, {
                code: code
            });

            if(idx != -1) {
                $scope.products[idx].added = 'Y';
                $scope.products[idx].qty = qty;
            }
            // add to drugs
            $scope.drugs.push($scope.products[idx]);

        } else {
            LxNotificationService.error('กรุณาระบุจำนวนที่ต้องการสั่งซื้อ');
        }
    };

    $scope.doEdit = function (code, oldQty) {
        var idx = _.findIndex($scope.drugs, {
            code: code
        });

        var qty = prompt('ระบุจำนวนที่ต้องการแก้ไข', oldQty);

        if (qty && qty > 0) {
            $scope.drugs[idx].qty = qty;
        } else {
            LxNotificationService.error('กรุณาระบุจำนวนที่ต้องการสั่งซื้อ');
        }
    };

    $scope.doRemove = function (code) {
        var idx = _.findIndex($scope.drugs, {
            code: code
        });

        var idxProduct = _.findIndex($scope.products, {
            code: code
        });

        LxNotificationService.confirm('ยืนยันการลบ', 'คุณต้องการลบรายการนี้ออกจากการสั่งซื้อ ใช่หรือไม่?', {
            ok: 'ใช่, ฉันต้องการลบ',
            cancel: 'ไม่ใช่'
        }, function (res) {
            if (res) {
                $scope.products[idxProduct].added = 'N';
                $scope.drugs.splice(idx, 1);
                console.log(idx);
                console.log($scope.drugs);
            }
        });
    };

    // Get products
    OrdersNewService.getProducts()
        .then(function (rows) {
            $scope.products = rows;
        }, function (err) {
            console.log(err);
            LxNotificationService.error('Oop!');
        });

});
