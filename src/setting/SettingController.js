// Setting controller
App.controller('SettingController', function ($scope, SettingService, LxDialogService, LxNotificationService) {

    $scope.isUpdate = false;

    SettingService.getOfficeDetail()
        .then(function (row) {
            $scope.hospcode = row.hospcode;
            $scope.hospname = row.hospname;
            $scope.address = row.address;
        }, function (err) {
            console.log(err);
            LxNotificationService.error('Oop!, View log to see error detail');
        });

    $scope.getStaffList = function () {
        SettingService.getStaffList()
            .then(function (rows) {
                $scope.staff = rows;
            }, function (err) {
                console.log(err);
                LxNotificationService.error('Oop!, View log to see error detail');
            });
    };

    $scope.getStockList = function () {
        SettingService.getStockList()
            .then(function (rows) {
                $scope.stocks = rows;
            }, function (err) {
                console.log(err);
                LxNotificationService.error('Oop!, View log to see error detail');
            });
    };

    $scope.showNewStaff = function () {
        $scope.isActive = true;
        LxDialogService.open('mdlNewStaff');
    };

    $scope.showNewStock = function () {
        $scope.isStockActive = true;
        LxDialogService.open('mdlNewSubStock');
    };

    $scope.showEditStaff = function (id, fullname, position, is_active) {
        $scope.isUpdate = true;
        $scope.isActive = is_active == 'Y' ? true : false;
        $scope.fullname = fullname;
        $scope.position = position;
        $scope.staffId = id;

        LxDialogService.open('mdlNewStaff');
    };

    $scope.closingAddStaff = function () {
        $scope.fullname = null;
        $scope.position = null;
        $scope.isUpdate = false;
        $scope.staffId = null;
    };

    $scope.closingAddSubStock = function () {
        $scope.stockName = null;
        $scope.isStockActive = true;
        $scope.isUpdate = false;
        $scope.stockId = null;
    };

    // Save office detail
    $scope.doSaveOffice = function () {
        SettingService.doSaveOffice($scope.hospcode, $scope.hospname, $scope.address)
            .then(function () {
                LxNotificationService.success('Save data successully');
            }, function (err) {
                console.log(err);
                LxNotificationService.error('Oop!. View log to see error detail');
            });
    };

    // Save staff
    $scope.doSaveStaff = function () {
        var fullname = $scope.fullname,
            position = $scope.position,
            is_active = $scope.isActive ? 'Y' : 'N';

        var promise = null;

        if ($scope.isUpdate) {
            promise = SettingService.doUpdateStaff($scope.staffId, fullname, position, is_active);
        } else {
            promise = SettingService.doSaveStaff(fullname, position, is_active);
        }

        promise.then(function () {
            LxNotificationService.success('Save data successully');
            LxDialogService.close('mdlNewStaff');
            $scope.getStaffList();
        }, function (err) {
            console.log(err);
            LxNotificationService.error('Oop!. View log to see error detail');
        });
    };

    // Remove staff
    $scope.doRemoveStaff = function (id) {
        LxNotificationService.confirm('Confirmation', 'Are you sure?', {
            cancel: 'No',
            ok: 'Yes'
        }, function (res) {
            if (res) {
                SettingService.doRemoveStaff(id)
                    .then(function () {
                        LxNotificationService.success('Remove successully');
                        $scope.getStaffList();
                    }, function (err) {
                        console.log(err);
                        LxNotificationService.error('Oop!. View log to see error detail');
                    });
            }
        });
    };

    // Save stock
    $scope.doSaveStock = function () {
        var name = $scope.stockName,
            is_active = $scope.isStockActive ? 'Y' : 'N';

        var promise = null;

        if ($scope.isUpdate) {
            promise = SettingService.doUpdateStock($scope.stockId, name, is_active);
        } else {
            promise = SettingService.doSaveStock(name, is_active);
        }

        promise.then(function () {
            LxNotificationService.success('Save successully');
            $scope.getStockList();
            LxDialogService.close('mdlNewSubStock');
        }, function (err) {
            console.log(err);
            LxNotificationService.error('Oop!. View log to see error detail');
        });

    };

    // Show edit stock
    $scope.showEditStock = function (id, name, is_active) {
        $scope.isUpdate = true;
        $scope.stockName = name;
        $scope.isStockActive = is_active == 'Y' ? true : false;
        $scope.stockId = id;

        LxDialogService.open('mdlNewSubStock');
    };

    $scope.doRemoveStock = function (id) {

        LxNotificationService.confirm('Confirmation', 'Are you sure?', {
            ok: 'Yes',
            cancel: 'No'
        }, function (res) {
            if (res) {
                SettingService.doRemoveStock(id)
                    .then(function () {
                        LxNotificationService.success('Remove successully');
                        $scope.getStockList();
                    }, function (err) {
                        console.log(err);
                        LxNotificationService.error('Oop!. View log to see error detail');
                    });
            }
        });
    };
    //Initial data
    $scope.getStockList();
    $scope.getStaffList();

});