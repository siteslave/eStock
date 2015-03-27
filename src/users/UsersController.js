// Users controller
App.controller('UsersController', function ($scope, UsersService, LxNotificationService, LxDialogService) {

    var crypto = require('crypto');
    // initial users
    $scope.users = [];
    $scope.isUpdate = false;

    // Get all users;
    var all = function () {
        UsersService.all()
            .then(function (rows) {
                $scope.users = rows;
            }, function (err) {
                console.log(err);
                LxNotificationService.error('Oop!');
            });
    };

    // Show new modal
    $scope.showNew = function () {
        LxDialogService.open('mdlNew');
    };

    // Save
    $scope.save = function () {

        var data = {};
        data.username = $scope.username;
        data.fullname = $scope.fullname;
        data.is_admin = $scope.isAdmin ? 'Y' : 'N';
        data.is_active = $scope.isActive ? 'Y' : 'N';

        console.log(data);

        if ($scope.isUpdate) {
            // save new
            data.id = $scope.id;

            UsersService.update(data)
                .then(function () {
                    var idx = _.findIndex($scope.users, {id: data.id});
                    $scope.users[idx].fullname = data.fullname;
                    $scope.users[idx].is_admin = data.is_admin;
                    $scope.users[idx].is_active = data.is_active;

                    LxNotificationService.success('ปรับปรุงรายการเสร็จเรียบร้อยแล้ว');
                    LxDialogService.close('mdlNew');
                }, function (err) {
                    console.log(err);
                    LxNotificationService.error('Oop!');
                });
        } else {
            // Check duplicated
            var promise = UsersService.checkDuplicated($scope.username);

            data.password = crypto.createHash('md5').update($scope.password).digest('hex');

            promise.then(function (isDuplicated) {
                if (isDuplicated) {
                    LxNotificationService.warning('มีชื่อนี้อยู่แล้วในระบบ กรุณาตรวจสอบ');
                } else {
                    UsersService.save(data)
                        .then(function (id) {
                            $scope.users.push({
                                id: id,
                                username: data.username,
                                fullname: data.fullname,
                                is_admin: data.is_admin,
                                is_active: data.is_active
                            });
                            LxNotificationService.success('บันทึกเสร็จเรียบร้อยแล้ว');
                            // close modal
                            LxDialogService.close('mdlNew');
                        }, function (err) {
                            LxNotificationService.error('Oop!');
                            console.log(err);
                        });
                }
            }, function (err) {
                LxNotificationService.error('Oop!');
                console.log(err);
            });
        }

    };

    // show edit
    $scope.showEdit = function (user) {
        $scope.id = user.id;
        $scope.isUpdate = true;
        $scope.username = user.username;
        $scope.fullname = user.fullname;
        $scope.isAdmin = user.is_admin == 'Y';
        $scope.isActive = user.is_active == 'Y';
        $scope.password = 'xxxxxx'; // shadow password

        LxDialogService.open('mdlNew');
    };

    // closing dialog
    $scope.closingDialog = function () {
        $scope.id = null;
        $scope.isUpdate = false;
        $scope.username = null;
        $scope.fullname = null;
        $scope.isAdmin = false;
        $scope.isAdmin = false;
        $scope.password = null;
    };

    all();

});
