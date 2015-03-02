App.controller('MainController', function ($scope, MainService, LxNotificationService, LxDialogService) {

    $scope.all = function () {

        $scope.products = [];

        MainService.all()
            .then(function (rows) {
                $scope.products = rows;
            }, function (err) {
                console.log(err);
                LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู Log');
            });

    };

    // Get all products
    $scope.all();
    //search durgs
    $scope.ajax = {
        list: [],
        update: function(newFilter, oldFilter) {
            if (newFilter) {
                $scope.ajax.loading = true;
                MainService.getDrugs(newFilter)
                    .then(function(rows) {
                        $scope.ajax.list = rows;
                        $scope.ajax.loading = false;
                    }, function(err) {
                        $scope.ajax.loading = false;
                        console.log(err);
                    });
            } else {
                $scope.ajax.loading = false;
            }
        },
        loading: false,
        selected: null
    };

    $scope.setProductSelected = function (icode) {
        $scope.icode = icode;
    };
    /**
     * Show modal
     */
    $scope.showMapping = function (code, name) {
        $scope.code = code;
        $scope.name = name;
        LxDialogService.open('mdlMapping');
    };
    /**
     * Closing dialog
     */
    $scope.closingDialog = function () {
        $scope.ajax.list = [];
        $scope.code = null;
        $scope.name = null;
        $scope.ajax.selected = null;
    };

    $scope.doMapping = function () {
        var icode = $scope.ajax.selected.icode;
        var code = $scope.code;

        MainService.doMapping(code, icode)
            .then(function () {
                LxNotificationService.success('บันทึกรายการเสร็จเรียบร้อยแล้ว');
                var idx = _.findIndex($scope.products, {code: code});
                $scope.products[idx].icode = icode;
                LxDialogService.close('mdlMapping');
            }, function (err) {
                console.log(err);
                LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู Log');
            });
    };

});