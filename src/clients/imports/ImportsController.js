App.controller('ImportsController', function ($scope, ImportsService, LxProgressService, LxNotificationService) {

    $scope.startDate = new Date();
    $scope.endDate = new Date();

    $scope.doImport = function () {
        $scope.isImporting = true;

        var startDate = moment($scope.startDate).format('YYYY-MM-DD');
        var endDate = moment($scope.endDate).format('YYYY-MM-DD');

        if (moment($scope.startDate).isValid() && moment($scope.endDate).isValid()) {

            LxNotificationService.confirm('ยืนยันการนำเข้า', 'คุณต้องการนำเข้าข้อมูล ใช่หรือไม่?', {
                ok: 'ใช่, ฉันต้องการนำเขัา',
                cancel: 'ไม่ใช่'
            }, function (res) {
                if (res) {
                    // Show progress
                    LxProgressService.circular.show('#5fa2db', '#progress');

                    var promise = ImportsService.getPayment(startDate, endDate);
                    promise.then(function (rows) {
                        if (_.size(rows)) {
                            Q.forEach(rows, function (v) {
                                var defer = Q.defer();
                                ImportsService.importDrugPayment(v)
                                    .then(function () {
                                        defer.resolve();
                                    }, function (err) {
                                        console.log(err);
                                        defer.reject(err);
                                    });

                                return defer.promise;
                            }).then(function () {
                                LxNotificationService.success('นำเข้าข้อมูลการจ่ายเวชภัณฑ์จากฐาน HIS เสร็จเรียบร้อยแล้ว');
                                LxProgressService.circular.hide();
                                $scope.isImporting = false;
                            });
                        } else {
                            LxNotificationService.error('ไม่พบรายการที่ต้องการนำเข้า');
                            LxProgressService.circular.hide();
                            $scope.isImporting = false;
                        }
                    }, function (err) {
                        console.log(err);
                        LxNotificationService.error('Oop!');
                        LxProgressService.circular.hide();
                        $scope.isImporting = false;
                    });
                } else {
                    $scope.isImporting = false;
                }
            });

        } else {
            LxNotificationService.error('กรุณาระบุวันที่ให้ถูกต้อง');
            $scope.isImporting = false;
        }

    };

});