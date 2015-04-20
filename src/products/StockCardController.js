App.controller('StockCardController', function ($scope, $routeParams, $window, StockCardService, LxProgressService, LxNotificationService) {

    $scope.icode = $routeParams.icode;

    $scope.startDate = moment().startOf('month');
    $scope.endDate = moment().endOf('month');

    StockCardService.getDetail($scope.icode)
        .then(function (data) {
            $scope.drugName = data.name;
            $scope.drugCode = $scope.icode;
        }, function (err) {
            console.log(err);
        });

    $scope.doGetCard = function () {
        var startDate = moment($scope.startDate).format('YYYY-MM-DD');
        var endDate = moment($scope.endDate).format('YYYY-MM-DD');

        $scope.getCard(startDate, endDate);
    };

    // Get card
    $scope.getCard = function (startDate, endDate) {
        $scope.totalQtyIn = 0;
        $scope.totalQtyOut = 0;
        $scope.totalQty = 0;

        LxProgressService.linear.show('#5fa2db', '#progress');

        StockCardService.getCard($scope.icode, startDate, endDate)
            .then(function (rows) {
                if (_.size(rows)) {
                    var _products = [];
                    var _currentTotal = 0;

                    _.forEach(rows, function (v) {
                        _currentTotal += v.get_qty;
                        _currentTotal -= v.paid_qty;
                        $scope.totalQtyIn += v.get_qty;
                        $scope.totalQtyOut += v.paid_qty;

                        var obj = {
                            act_date: v.act_date,
                            act_code: v.act_code,
                            act_name: v.act_name,
                            get_qty: v.get_qty,
                            paid_qty: v.paid_qty,
                            currentTotal: _currentTotal
                        };

                        _products.push(obj);
                    });

                    $scope.totalQty = $scope.totalQtyIn - $scope.totalQtyOut;
                    $scope.products = _products;
                    LxProgressService.linear.hide();
                } else {
                    LxNotificationService.error('ไม่พบข้อมูลการทำรายการ');
                    LxProgressService.linear.hide();
                }
            }, function (err) {
                console.log(err);
                LxProgressService.linear.hide();
            });
    };

    var currentStartDate = $window.sessionStorage.getItem('startDate');
    var currentEndDate = $window.sessionStorage.getItem('endDate');
    $scope.getCard(currentStartDate, currentEndDate);

});