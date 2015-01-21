App.controller('ImportController', function ($scope, $timeout, Utils, Common,
    ImportService, LxNotificationService, LxProgressService) {

    var Q = require('q');
    require('q-foreach')(Q);

    $scope.isSuccess = false;
    $scope.btnMsg = 'นำเข้าข้อมูลยาจากฐานกลาง';

    // Get configure
    var config = Common.getConfigure();

    $scope.getProducts = function () {

        LxNotificationService.confirm('Confirmation.', 'คุณต้องการนำเข้าข้อมูลยาจากฐานกลาง ใช่หรือไม่?', {
            ok: 'ใช่, ฉันต้องการนำเข้าข้อมูล',
            cancel: 'ไม่ใช่'
        }, function (res) {
            if (res) {

                $scope.isSuccess = false;
                $scope.btnMsg = 'กำลังนำเข้าข้อมูลยา...';
                LxProgressService.linear.show('#009688', '#progress');

                ImportService.dcGetProduct(config)
                    .then(function (data) {

                        // do import
                        Q.forEach(data, function (v) {
                            var defer = Q.defer();

                            ImportService.checkDuplicated(v.code)
                                .then(function (duplicated) {
                                    if (!duplicated) {
                                        ImportService.doImportDrug(v)
                                            .then(function () {
                                                // success
                                            }, function (err) {
                                                defer.reject(err);
                                                console.log(err);
                                            });
                                    } else {
                                        ImportService.doUpdateDrug(v)
                                            .then(function () {
                                                // success
                                            }, function (err) {
                                                defer.reject(err);
                                                console.log(err);
                                            });
                                    }

                                    defer.resolve();
                                }, function (err) {
                                    defer.reject(err);
                                    console.log(err);
                                });

                            return defer.promise;

                        }).then(function () {

                            LxNotificationService.success('นำเข้าข้อมูลเสร็จแล้ว');
                            LxProgressService.linear.hide('#progress');
                            $scope.btnMsg = 'นำเข้าข้อมูลยาจากฐานกลางเสร็จเรียบร้อยแล้ว';
                            $scope.isSuccess = true;

                            $scope.products = data;

                        });

                    }, function (err) {
                        console.log(err);
                        LxProgressService.linear.hide('#progress');
                        LxNotificationService.error(err);
                    });
            }
        });
    };

});