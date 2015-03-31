App.controller('OrdersMainController', function ($scope, OrdersMainService, LxNotificationService) {

    $scope.orders = [];
    // set default status = 'Y'
    $scope.currentStatus = true;

    $scope.all = function () {

        OrdersMainService.getAll()
            .then(function (rows) {
                $scope.orders = rows;
            }, function (err) {
                console.log(err);
            });

    };

    $scope.getFilter = function () {

        OrdersMainService.getFilter($scope.currentStatus)
            .then(function (rows) {
                $scope.orders = rows;
            }, function (err) {
                console.log(err);
            });

    };

    $scope.toggleStatus = function () {
        if ($scope.currentStatus) {
            $scope.currentStatus = false;
            $scope.getFilter();
        } else {
            $scope.currentStatus = true;
            $scope.getFilter();
        }
    };

    $scope.remove = function (id) {

        LxNotificationService.confirm('ยืนยันการลบ', 'คุณต้องการลบรายการนี้ ใช่หรือไม่', {
            ok: 'ใช่, ฉ้นต้องการลบ',
            cancel: 'ไม่ใช่/ยกเลิก'
        }, function (res) {
            if (res) {
                // do remove
                OrdersMainService.removeOrders(id)
                    .then(function () {
                        return OrdersMainService.removeOrdersDetail(id);
                    })
                    .then(function () {
                        var idx = _.findIndex($scope.orders, {id: id});
                        $scope.orders.splice(idx, 1);

                        LxNotificationService.success('Remove orders success.');
                    }, function (err) {
                        console.log(err);
                        LxNotificationService.error('Oop!');
                    })
            }
        });

    };

    // initial data
    $scope.all();

});
