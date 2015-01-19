// Connection Controller
App.controller('ConnectionController', function ($scope, LxNotificationService) {

    var config = jf.readFileSync(eStock.configFile);

    $scope.config = config;

    $scope.doSaveConnection = function () {
        jf.writeFile(eStock.configFile, $scope.config, function (err) {
            if (err) {
                console.log(err);
                LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู log file');
            } else {
                LxNotificationService.success('บันทึกข้อมูลเสร็จเรียบร้อยแล้ว');
            }
        });
    };

});