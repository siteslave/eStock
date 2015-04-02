App.controller('OrdersEditController', function ($scope, $window, $location, $routeParams, OrdersEditService, LxNotificationService, LxDialogService) {

    $scope.orders_id = $routeParams.id;
    $scope.products = [];
    $scope.drugs = [];

    $scope.init = function () {

        // Get products
        var promise = OrdersEditService.getProducts();
        promise.then(function (rows) {
            $scope.products = rows;
            return OrdersEditService.getOrders($scope.orders_id);
        }).then(function (orders) {
            $scope.orders_date = orders.orders_date;
            $scope.orders_code = orders.orders_code;
            return OrdersEditService.getOrdersDetail($scope.orders_id);
        }).then(function (rows) {
            $scope.drugs = rows;
            // set selected item
            _.forEach($scope.drugs, function (v) {
                var idx = _.findIndex($scope.products, {
                    code: v.code
                });

                if (idx != -1) $scope.products[idx].added = 'Y';
            });
        }, function (err) {
            console.log(err);
            LxNotificationService.error('Oop!');
        });

    };

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
                var product = $scope.products[idx];
                product.qty = qty;
                // add to drugs
                $scope.drugs.push(product);
            }

        } else {
            LxNotificationService.error('กรุณาระบุจำนวนที่ต้องการสั่งซื้อ');
        }
    };

    $scope.doEdit = function (idx, oldQty) {

        var qty = prompt('ระบุจำนวนที่ต้องการแก้ไข', oldQty);

        if (qty && qty > 0) {
            $scope.drugs[idx].qty = qty;
        } else {
            LxNotificationService.error('กรุณาระบุจำนวนที่ต้องการสั่งซื้อ');
        }

    };

    $scope.doRemove = function (idx) {

        var idxProduct = _.findIndex($scope.products, {
            code: $scope.drugs[idx].code
        });

        LxNotificationService.confirm('ยืนยันการลบ', 'คุณต้องการลบรายการนี้ออกจากการสั่งซื้อ ใช่หรือไม่?', {
            ok: 'ใช่, ฉันต้องการลบ',
            cancel: 'ไม่ใช่'
        }, function (res) {
            if (res) {
                $scope.products[idxProduct].added = 'N';
                $scope.drugs.splice(idx, 1);
            }
        });
    };

    // save orders
    $scope.saveOrders = function () {

        if (!$scope.orders_code || !$scope.orders_date) {
            LxNotificationService.warning('กรุณาระบุข้อมูลการเบิก');
        } else {
            LxNotificationService.confirm('ยืนยันการบันทึก', 'คุณต้องการบันทึกข้อมูลการขอเบิกนี้ ใช่หรือไม่?',
                {ok: 'ใช่, ฉันต้องการบันทึก', cancel: 'ไม่ใช่/ยกเลิก'},
                function (res) {
                    if (res) {
                        // save orders
                        var orders = {};
                        orders.user_id = $window.sessionStorage.getItem('user_id');
                        orders.orders_date = moment($scope.orders_date).format('YYYY-MM-DD');
                        orders.orders_code = $scope.orders_code;
                        orders.orders_id = $scope.orders_id;
                        orders.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');

                        OrdersEditService.saveOrders(orders)
                            .then(function () {
                                // save orders detail
                                var items = [];
                                _.forEach($scope.drugs, function (v) {
                                    var obj = {};
                                    obj.orders_id = $scope.orders_id;
                                    obj.product_code = v.code;
                                    obj.qty = v.qty;
                                    obj.price = v.price;

                                    items.push(obj);
                                });

                                // Clear old data
                                OrdersEditService.clearOldData($scope.orders_id)
                                    .then(function () {
                                        // save detail
                                        OrdersEditService.saveOrdersDetail(items)
                                            .then(function () {
                                                $window.location.href = '#/';
                                            }, function (err) {
                                                console.log('Detail: ' + err);
                                            });
                                    }, function (err) {
                                        console.log(err);
                                    });

                            }, function (err) {
                                console.log(err);
                            });
                    }
                });
        }

    };

    // initial data
    $scope.init();

});
