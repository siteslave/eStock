App.controller('ImportsController', function ($scope, $window, $filter, ImportsService, LxProgressService, LxNotificationService, LxDialogService) {

    $scope.startDate = new Date();
    $scope.endDate = new Date();

    // Get imported history
    $scope.getImportedHistory = function () {
        ImportsService.getImportedHistory()
            .then(function (rows) {
                $scope.imported = rows;
            }, function (err) {
                console.log('History: ' + err);
            });
    };

    $scope.getImportedHistory();

    $scope.doImport = function () {

        $scope.currentQty = 0;
        $scope.totalQty = 0;
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
                    var username = $window.sessionStorage.getItem('username');
                    // check duplicated imported
                    ImportsService.isDuplicated(startDate, endDate)
                        .then(function (isDuplicated) {
                        if (!isDuplicated) {
                            var promise = ImportsService.saveHistory(startDate, endDate, username);
                            promise.then(function () {
                                return ImportsService.getPayment(startDate, endDate);
                            }).then(function (rows) {
                                if (_.size(rows)) {
                                    $scope.totalQty = _.size(rows);
                                    Q.forEach(rows, function (v) {
                                        var defer = Q.defer();
                                        ImportsService.importDrugPayment(v)
                                            .then(function () {
                                                $scope.currentQty++;
                                                defer.resolve();
                                            }, function (err) {
                                                console.log(err);
                                                defer.reject(err);
                                            });

                                        return defer.promise;
                                    }).then(function () {
                                        LxNotificationService.success('นำเข้าข้อมูลการจ่ายเวชภัณฑ์จากฐาน HIS เสร็จเรียบร้อยแล้ว');
                                        $scope.getImportedHistory();
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
                            LxProgressService.circular.hide();
                            $scope.isImporting = false;
                            LxNotificationService.error('รายการนี้เคยถูกนำเข้าแล้ว กรุณาตรวจสอบ');
                        }
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

    $scope.doCutOff = function () {

        var _startDate = moment($scope.cutOffStartDate).format('YYYY-MM-DD');
        var _endDate = moment($scope.cutOffEndDate).format('YYYY-MM-DD');

        $scope.totalCutOff = 0;
        $scope.currentCutOff = 0;
        $scope.isImportingCutOff = true;

        LxProgressService.circular.show('#5fa2db', '#progressImport');
        // Get cut off list
        ImportsService.getCutOffPayment(_startDate, _endDate)
            .then(function (rows) {
                $scope.totalCutOff = _.size(rows);

                if (_.size(rows)) {
                    Q.forEach(rows, function (v) {
                        var defer = Q.defer();
                        ImportsService.importStockCard(v)
                            .then(function () {
                                $scope.currentCutOff++;
                                ImportsService.updateCutOffItem(v.icode, v.vn).then(function () {});
                                defer.resolve();
                            }, function (err) {
                                console.log(err);
                                defer.reject(err);
                            });

                        return defer.promise;
                    }).then(function (success) {
                        ImportsService.updatePaymentHistory(_startDate, _endDate)
                            .then(function () {
                                $scope.getImportedHistory();
                            });
                        LxNotificationService.success('ตัดสต๊อกเสร็จเรียบร้อยแล้ว');
                        $scope.isImportingCutOff = false;
                        LxProgressService.circular.hide();
                        LxDialogService.close('mdlCutOff');
                    });
                } else {
                    LxNotificationService.warning('ไม่พบข้อมูลที่ต้องการนำเข้า');
                    $scope.isImportingCutOff = false;
                    LxProgressService.circular.hide();
                }

            }, function (err) {
                console.log(err);
                $scope.isImportingCutOff = false;
                LxProgressService.circular.hide();
            });

        //LxNotificationService.confirm('ยืนยันการตัดสต๊อก', 'คุณต้องการตัดสต๊อกรายการเวชภัณฑ์ที่จ่ายในช่วงวันที่ ' + $filter('toShortDate')($scope.iStartDate) + '-' +  $filter('toShortDate')($scope.iEndDate) + ' ใช่หรือไม่?',
        //    {
        //        ok: 'ใช่, ฉันต้องการนำเข้า',
        //        cancel: 'ไม่ใช่'
        //    }, function (res) {
        //        if (res) {
        //
        //        }
        //});
    };

    $scope.closeCutOff = function () {
        $scope.iStartDate = null;
        $scope.iEndDate = null;
        $scope.isImportingCutOff = false;
        $scope.importedHistoryIdx = null;
        LxProgressService.circular.hide();
    };

    // show cutoff
    $scope.showCutOff = function (idx, startDate, endDate) {
        $scope.isImportingCutOff = false;
        $scope.iStartDate = $filter('toShortDate')(startDate);
        $scope.iEndDate = $filter('toShortDate')(endDate);

        $scope.importedHistoryIdx = idx;
        $scope.cutOffStartDate = startDate;
        $scope.cutOffEndDate = endDate;

        LxDialogService.open('mdlCutOff');
    };


});