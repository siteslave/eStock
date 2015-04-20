App.controller('MainController', function($scope, MainService, LxNotificationService, LxDialogService, LxProgressService) {

    LxProgressService.linear.show('#009688', '#progress');
    $scope.isLoading = true;

    $scope.all = function() {

        $scope.products = [];

        MainService.all()
            .then(function(rows) {
                $scope.products = rows;
                LxProgressService.linear.hide();
                $scope.isLoading = false;
            }, function(err) {
                console.log(err);
                LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู Log');
                LxProgressService.linear.hide();
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

    $scope.setProductSelected = function(icode) {
        $scope.icode = icode;
    };
    /**
     * Show modal
     */
    $scope.showMapping = function(code, name) {
        $scope.code = code;
        $scope.name = name;
        LxDialogService.open('mdlMapping');
    };
    /**
     * Closing dialog
     */
    $scope.closingDialog = function() {
        $scope.ajax.list = [];
        $scope.code = null;
        $scope.name = null;
        $scope.ajax.selected = null;
    };

    $scope.doMapping = function() {
        var icode = $scope.ajax.selected.icode;
        var code = $scope.code;

        MainService.doMapping(code, icode)
            .then(function() {
                LxNotificationService.success('บันทึกรายการเสร็จเรียบร้อยแล้ว');
                var idx = _.findIndex($scope.products, {
                    code: code
                });
                $scope.products[idx].icode = icode;
                LxDialogService.close('mdlMapping');
            }, function(err) {
                console.log(err);
                LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู Log');
            });
    };

    // Import products
    $scope.doImport = function() {

        var Q = require('q');
        require('q-foreach')(Q);

        LxNotificationService.confirm('Confirmation.', 'คุณต้องการนำเข้าข้อมูลยาจากฐานกลาง ใช่หรือไม่?', {
            ok: 'ใช่, ฉันต้องการนำเข้าข้อมูล',
            cancel: 'ไม่ใช่'
        }, function(res) {
            if (res) {

                $scope.isImporting = true;
                LxProgressService.linear.show('#009688', '#progress');

                MainService.dcGetProduct()
                    .then(function(data) {
                        // do import
                        Q.forEach(data, function(v) {
                            var defer = Q.defer();

                            MainService.checkDuplicated(v.code)
                                .then(function(duplicated) {
                                    if (!duplicated) {
                                        MainService.doImportDrug(v)
                                            .then(function() {
                                                // success
                                            }, function(err) {
                                                defer.reject(err);
                                                console.log(err);
                                            });
                                    } else {
                                        MainService.doUpdateDrug(v)
                                            .then(function() {
                                                // success
                                            }, function(err) {
                                                defer.reject(err);
                                                console.log(err);
                                            });
                                    }

                                    defer.resolve();
                                }, function(err) {
                                    defer.reject(err);
                                    console.log(err);
                                });

                            return defer.promise;

                        }).then(function() {
                            $scope.all();
                            LxNotificationService.success('นำเข้าข้อมูลเสร็จแล้ว');
                            LxProgressService.linear.hide('#progress');
                            $scope.isImporting = false;

                        });

                    }, function(err) {
                        if (angular.isObject(err)) {
                            console.log(err);
                            LxNotificationService.error('Oop!');
                            LxProgressService.linear.hide('#progress');
                            $scope.isImporting = false;
                        } else {
                            LxProgressService.linear.hide('#progress');
                            LxNotificationService.error(err);
                            $scope.isImporting = false;
                        }

                    });
            }
        });
    };

    $scope.isImportingCode = false;

    $scope.updateCode = function() {
        LxNotificationService.confirm('ยืนยันการนำเข้า', 'คุณต้องการนำเข้ารหัส 24 หลัก ใช่หรือไม่?', {
            ok: 'ใช่, ฉันต้องการนำเข้า',
            cancel: 'ไม่ใช่'
        }, function(res) {
            $scope.isImportingCode = true;
            LxProgressService.circular.show('#009688', '#progressStdCode');
            if (res) {
                // Get all products with stdcode
                MainService.allWithCode()
                    .then(function(data) {
                        Q.forEach(data, function(v) {
                            var defer = Q.defer();
                            MainService.doUpdateStdCode(v)
                                .then(function() {
                                    defer.resolve();
                                });
                            return defer.promise;
                        }).then(function (success) {
                            $scope.isImportingCode = false;
                            LxProgressService.circular.hide();
                            LxNotificationService.success('ปรับปรุงรหัส 24 หลักเสร็จเรียบร้อยแล้ว');
                        });
                    }, function(err) {
                        console.log(err);
                        LxNotificationService.error('เกิดข้อผิดพลาด');
                        $scope.isImportingCode = false;
                        LxProgressService.circular.hide();
                    });
            }
        });

    };

});
