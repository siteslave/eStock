App.controller('ApproveController', function ($scope, $routeParams, $filter, $window, ApproveService, LxNotificationService) {

    $scope.orders_id = $routeParams.orders_id;


    $scope.init = function () {

        // Get products
        var promise = ApproveService.getOrders($scope.orders_id);
        promise.then(function (orders) {
            $scope.true_orders_date = orders.orders_date;
            $scope.orders_date = $filter('toShortDate')(orders.orders_date);
            $scope.orders_code = orders.orders_code;
            return ApproveService.getOrdersDetail($scope.orders_id);
        }).then(function (rows) {
            $scope.drugs = rows;
        }, function (err) {
            console.log(err);
            LxNotificationService.error('Oop!');
        });

    };

    $scope.doApprove = function () {

        if (_.size($scope.drugs)) {

            LxNotificationService.confirm('ยืนยันการอนุมัติ', 'คุณต้องการอนุมัติการเบิกรายการนี้ใช่หรือไม่?', {
                ok: 'ใช่, ฉันต้องการอนุมัติ',
                cancel: 'ไม่ใช่'
            }, function (res) {
                if (res) {
                    Q.forEach($scope.drugs, function (v) {
                        var defer = Q.defer();

                        var objMain = {};
                        var objClient = {};
                        // Main
                        objMain.act_code = $scope.orders_code;
                        objMain.act_name = 'คลังย่อย';
                        objMain.act_date = moment($scope.true_orders_date).format('YYYY-MM-DD');
                        objMain.icode = v.icode;
                        objMain.paid_qty = v.qty;
                        objMain.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
                        // Client
                        objClient.act_code = $scope.orders_code;
                        objClient.act_name = 'คลังหลัก';
                        objClient.act_date = moment($scope.true_orders_date).format('YYYY-MM-DD');
                        objClient.icode = v.icode;
                        objClient.get_qty = v.qty;
                        objClient.created_at = moment().format('YYYY-MM-DD HH:mm:ss');

                        ApproveService.saveMainStockCard(objMain)
                            .then(function () {
                                return ApproveService.saveClientStockCard(objClient);
                            })
                            .then(function () {
                                return ApproveService.updateClientRequestStatus($scope.orders_id);
                            })
                            .then(function () {
                                defer.resolve();
                            }, function (err) {
                                console.log(err);
                            });

                        return defer.promise;
                    }).then(function (success) {
                        $window.location.href = '#/';
                    }, function (err) {
                        console.log(err);
                        LxNotificationService.error('Oop!');
                    });

                }
            });

        } else {
            LxNotificationService.error('ไม่พบรายการที่ต้องการอนุมัติ');
        }

    };

    $scope.doCancel = function () {};


    $scope.isImported = false;

    $scope.getOrdersStatus = function () {
        ApproveService.getOrdersStatus($scope.orders_id)
            .then(function (status) {
                if (status == 'Y') {
                    $scope.isImported = true;
                }
            });
    };

    $scope.init();
    $scope.getOrdersStatus();

});
