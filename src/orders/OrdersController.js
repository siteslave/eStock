// Order controller
App.controller('OrdersController', function ($scope, OrdersService, LxNotificationService,
    LxDialogService, LxProgressService) {

    $scope.showAddItemForm = false;
    $scope.product = null;
    $scope.products = [];
    $scope.staffId = null;
    $scope.total = 0.00;
    $scope.isUpdate = false;
    $scope.orderId = null;

    $scope.showNewOrder = function () {
        $scope.products = [];
        $scope.product = null;
        $scope.total = 0;
        $scope.showAddItemForm = false;
        $scope.orderDate = new Date();
        $scope.orderCode = null;
        $scope.staffId = null;

        $scope.getStaffList();
        LxDialogService.open('mdlNewOrder');
    };

    $scope.ajax = {
        list: [],
        update: function (newFilter, oldFilter) {
            if (newFilter) {
                $scope.ajax.loading = true;
                OrdersService.getProductList(newFilter)
                    .then(function (rows) {
                        $scope.ajax.list = rows;
                        $scope.ajax.loading = false;
                    }, function (err) {
                        $scope.ajax.loading = false;
                        console.log(err);
                    });
            } else {
                $scope.ajax.list = false;
            }
        },
        loading: false
    };

    $scope.doAddItem = function () {
        var id = _.findIndex($scope.products, {
            'id': $scope.product.id
        });

        if (angular.isNumber($scope.newProductQty)) {
            if ($scope.newProductQty <= 0) {
                LxNotificationService.warning('กรุณาระบุตัวเลขที่มากกว่า 0');
            } else {
                if (id != -1) {
                    $scope.products[id].qty = $scope.product.qty + $scope.newProductQty;
                } else {
                    $scope.product.qty = $scope.newProductQty;
                    $scope.products.push($scope.product);
                }

                $scope.getTotal();
            }
        } else {
            LxNotificationService.warning('กรุณาระบุเป็นตัวเลข');
        }
    };

    $scope.removeItem = function (id) {
        var idx = _.findIndex($scope.products, {
            'id': id
        });

        $scope.products.splice(idx, 1);
        $scope.getTotal();
    };

    $scope.getTotal = function () {
        $scope.total = 0;

        _.forEach($scope.products, function (v) {
            $scope.total += v.qty * v.cost;
        });
    };

    $scope.setProduct = function (product) {
        $scope.product = product;
    };

    $scope.setStaff = function (staffId) {
        $scope.staffId = staffId;
    };

    $scope.closeingNewOrder = function () {
        $scope.products = [];
        $scope.product = null;
        $scope.total = 0;
        $scope.showAddItemForm = false;
        $scope.orderCode = null;
        $scope.staff = null;
        $scope.orderId = null;
        $scope.isUpdate = false;
    };

    $scope.clearAddItemForm = function () {
        $scope.showAddItemForm = false;
        $scope.newProductQty = 1;
    };

    // Get staff list
    $scope.getStaffList = function () {
        OrdersService.getStaffList()
            .then(function (rows) {
                $scope.staff = rows;
            }, function (err) {
                console.log(err);
                LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู Log.');
            });
    };

    $scope.showAddItem = function () {
        $scope.showAddItemForm = true;
        $scope.newProductQty = 1;
    };

    $scope.checkNumber = function (n) {
        return angular.isNumber(n) && n > 0;
    };

    // Save order
    $scope.doSaveOrder = function () {

        // Validation
        if (!$scope.orderDate || !$scope.staffId) {
            LxNotificationService.error('กรุณาระบุวันที่เบิก และ เจ้าหน้าที่เบิก');
        } else {
            if ($scope.products.length === 0) {
                LxNotificationService.error('กรุณาเลืิอกรายการเวชภัณฑ์');
            } else {

                var orders = {
                    orderCode: $scope.orderCode,
                    orderDate: moment($scope.orderDate).format('YYYY-MM-DD'),
                    staffId: $scope.staffId,
                    items: $scope.products
                };

                if ($scope.isUpdate) {
                    // update
                    OrdersService.removeOrderDetail($scope.orderId)
                        .then(function () {
                            return OrdersService.updateOrder($scope.orderId, orders);
                        })
                        .then(function () {
                            _.forEach(orders.items, function (v) {
                                OrdersService.doSaveOrderDetail($scope.orderId, v)
                                    .then(function () {
                                        // Success
                                    }, function (err) {
                                        console.log(err);
                                    });
                            });

                            LxNotificationService.success("บันทึกรายการเสร็จเรียบร้อยแล้ว");
                            LxDialogService.close('mdlNewOrder');

                            $scope.getOrdersList();

                        }, function (err) {
                            console.log(err);
                            LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
                        });
                } else {
                    // Do save
                    OrdersService.doSaveOrders(orders)
                        .then(function (id) {
                            // Save order detail
                            _.forEach(orders.items, function (v) {
                                OrdersService.doSaveOrderDetail(id, v)
                                    .then(function () {
                                        // Success
                                    }, function (err) {
                                        console.log(err);
                                    });
                            });

                            LxNotificationService.success("บันทึกรายการเสร็จเรียบร้อยแล้ว");
                            LxDialogService.close('mdlNewOrder');

                            $scope.getOrdersList();

                        }, function (err) {
                            console.log(err);
                            LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
                        });
                }

            }
        }

    };

    // Get orders list
    $scope.getOrdersList = function () {

        var opt = $scope.all ? 1 : 2;
        
        OrdersService.getOrdersList(opt)
            .then(function (rows) {
                $scope.orders = rows;
            }, function (err) {
                console.log(err);
                LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
            });
        

    };
    
    // Show orders list
    $scope.getOrdersList();

    // Toggle list
    $scope.toggleList = function () {
        $scope.getOrdersList();
    };
    // Remove order
    $scope.removeOrder = function (orderId) {
        LxNotificationService.confirm('ยืนยันการลบ', 'คุณต้องการลบรายการนี้ ใช่หรือไม่?', {
            ok: 'ใช่, ฉันต้องการลบ',
            cancel: 'ไม่'
        }, function (res) {
            if (res) {
                OrdersService.removeOrder(orderId)
                    .then(function (err) {
                        LxNotificationService.success('ลบรายการเสร็จเรียบร้อยแล้ว');
                        $scope.getOrdersList();
                    }, function (err) {
                        console.log(err);
                        LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
                    });
            }
        });
    };

    $scope.showEdit = function (orderId) {
        // Get order detail
        var promise = OrdersService.getOrders(orderId);
        promise.then(function (order) {
            $scope.orderId = orderId;
            $scope.orderCode = order.orders_code;
            $scope.orderDate = order.orders_date;

            $scope.getStaffList();

            $scope.staffId = order.staff_id;
            $scope.selectedStaff = {
                staff_id: order.staff_id,
                fullname: order.fullname
            };

            return OrdersService.getOrdersDetail(orderId);
        })
            .then(function (rows) {
                $scope.products = rows;
                $scope.getTotal();
                $scope.isUpdate = true;
                LxDialogService.open('mdlNewOrder');

            }, function (err) {
                console.log(err);
                LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
            });
    };

    $scope.sendOnline = function (orderId) {
        // TODO 1. Get order detail 2. Get order detail
        var orders = {};
        orders.items = [];

        LxNotificationService.confirm('ยืนยันการส่งข้อมุล', 'คุณต้องการส่งข้อมูลเบิกเวชภัณฑ์นี้ ใช่หรือไม่?', {
            ok: 'ใช่, ฉันต้องการส่งเบิก',
            cancel: 'ไม่ใช่, ยกเลิกการส่ง'
        }, function (res) {
            if (res) {
                LxProgressService.linear.show('#009688', '#progress');

                var promise = OrdersService.getOrders(orderId);
                promise.then(function (order) {
                    orders.orders_id = orderId;
                    orders.orders_code = order.orders_code;
                    orders.orders_date = moment(order.orders_date).format('YYYY-MM-DD');
                    orders.staff_id = order.staff_id;
                    orders.staff_name = order.fullname;

                    return OrdersService.getOrdersDetail(orderId);
                })
                    .then(function (detail) {

                        _.forEach(detail, function (v) {
                            orders.items.push({
                                code: v.code,
                                qty: v.qty
                            });
                        });

                        return OrdersService.sendOnline(orders);
                    })
                    .then(function (data) {
                        if (data.ok) {
                            LxProgressService.linear.hide('#progress');
                            LxNotificationService.success('ส่งเบิกออนไลน์เสร็จเรียบร้อย');

                        } else {
                            LxProgressService.linear.hide('#progress');
                            LxNotificationService.error(data.err);
                        }
                    }, function (err) {
                        LxProgressService.linear.hide('#progress');
                        console.log(err);
                        LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
                    });
            }
        });

    };
    
    $scope.doSearch = function () {
        
        if (!$scope.query) {
            LxNotificationService.error('กรุณาระบุคำค้นหา');
        } else {
            OrdersService.search($scope.query)
                .then(function (rows) {
                $scope.orders = rows;
            }, function (err) {
                console.log(err);
                LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
            });
        }
        
    };
});