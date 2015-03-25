/**
 * Login Controller
 **/
App.controller('LoginController', function ($scope, $window, LoginService, LxNotificationService) {
    $scope.selects = {
        selectedPeriod: null,
        list: [],
        toModel: function (data) {
            if (data) {
                $scope.period = data;
            }
        }
    };

    // Get periods
    LoginService.getPeriods()
        .then(function (rows) {
            $scope.selects.list = rows;
        }, function (err) {
            console.log(err);
        });

    // Do login
    $scope.doLogin = function () {
        LoginService.doLogin($scope.username, $scope.password)
            .then(function (data) {
                var startDate = moment($scope.period.start_date).format('YYYY-MM-DD');
                var endDate = moment($scope.period.end_date).format('YYYY-MM-DD');

                if (data) {
                    $window.sessionStorage.setItem('username', $scope.username);
                    $window.sessionStorage.setItem('startDate', startDate);
                    $window.sessionStorage.setItem('endDate', endDate);
                    $window.sessionStorage.setItem('isAdmin', data.is_admin);
                    $window.sessionStorage.setItem('subStockId', data.sub_stock_id);
                    $window.sessionStorage.setItem('canImport', data.can_import_data);
                    // Redirect to main page
                    if (data.is_admin == 'Y') {
                        $window.location.href = '../pages/Index.html';
                    } else {
                        $window.location.href = '../clients/pages/Index.html';
                    }

                } else {
                    LxNotificationService.warning('ชื่อผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง');
                }
            }, function (err) {
                if (angular.isObject(err)) {
                    console.log(err);
                    LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู log');
                } else {
                    LxNotificationService.error(err);
                }
            });
    };

});