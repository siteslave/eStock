// Order controller
App.controller('OrdersController', function($scope, OrdersService, LxNotificationService,
    LxDialogService, LxProgressService) {

    $scope.showAddItemForm = false;
    $scope.product = null;
    $scope.products = [];
    $scope.total = 0.00;
    $scope.isUpdate = false;
    $scope.orderId = null;

    $scope.showNewOrder = function() {
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
        update: function(newFilter, oldFilter) {
            if (newFilter) {
                $scope.ajax.loading = true;
                OrdersService.getProductList(newFilter)
                    .then(function(rows) {
                        $scope.ajax.list = rows;
                        $scope.ajax.loading = false;
                    }, function(err) {
                        $scope.ajax.loading = false;
                        console.log(err);
                    });
            } else {
                $scope.ajax.list = false;
            }
        },
        loading: false,
        selected: null,
        toModel: function(data, callback)
        {
            if (data)
            {
                callback(data);
            }
            else
            {
                callback();
            }
        }
    };

    $scope.staff = {
        list: [],
        loading: false,
        selected: null,
        toModel: function(data, callback)
        {
            if (data)
            {
                callback(data);
            }
            else
            {
                callback();
            }
        }
    };

    $scope.doAddItem = function() {

        if (angular.isNumber($scope.newProductQty)) {
            if ($scope.newProductQty <= 0) {
                LxNotificationService.warning('กรุณาระบุตัวเลขที่มากกว่า 0');
            } else {

                $scope.product = $scope.ajax.selected;

                var id = _.findIndex($scope.products, {
                    'id': $scope.ajax.selected.id
                });

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

    $scope.removeItem = function(id) {
        var idx = _.findIndex($scope.products, {
            'id': id
        });

        $scope.products.splice(idx, 1);
        $scope.getTotal();
    };

    $scope.getTotal = function() {
        $scope.total = 0;

        _.forEach($scope.products, function(v) {
            $scope.total += v.qty * v.cost;
        });
    };

    $scope.closingNewOrder = function() {
        $scope.products = [];
        $scope.product = null;
        $scope.total = 0;
        $scope.showAddItemForm = false;
        $scope.orderCode = null;
        $scope.orderId = null;
        $scope.isUpdate = false;
    };

    $scope.clearAddItemForm = function() {
        $scope.showAddItemForm = false;
        $scope.newProductQty = 1;
    };

    // Get staff list
    $scope.getStaffList = function() {
        OrdersService.getStaffList()
            .then(function(rows) {
                $scope.staff.list = rows;
            }, function(err) {
                console.log(err);
                LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู Log.');
            });
    };

    $scope.showAddItem = function() {
        $scope.showAddItemForm = true;
        $scope.newProductQty = 1;
    };

    $scope.checkNumber = function(n) {
        return angular.isNumber(n) && n > 0;
    };

    // Save order
    $scope.doSaveOrder = function() {
        // Validation
        if (!$scope.orderDate) {
            LxNotificationService.error('กรุณาระบุวันที่เบิก');
        } else if(!$scope.staff.selected) {
            LxNotificationService.error('กรุณาระบุเจ้าหน้าที่');
        } else {
            if ($scope.products.length === 0) {
                LxNotificationService.error('กรุณาเลือกเวชภัณฑ์');
            } else {

                var orders = {
                    orderCode: $scope.orderCode,
                    orderDate: moment($scope.orderDate).format('YYYY-MM-DD'),
                    staffId: $scope.staff.selected.staff_id,
                    items: $scope.products
                };

                if ($scope.isUpdate) {
                    // update
                    OrdersService.removeOrderDetail($scope.orderId)
                        .then(function() {
                            return OrdersService.updateOrder($scope.orderId, orders);
                        })
                        .then(function() {
                            _.forEach(orders.items, function(v) {
                                OrdersService.doSaveOrderDetail($scope.orderId, v)
                                    .then(function() {
                                        // Success
                                    }, function(err) {
                                        console.log(err);
                                    });
                            });

                            LxNotificationService.success("บันทึกรายการเสร็จเรียบร้อยแล้ว");
                            LxDialogService.close('mdlNewOrder');

                            $scope.getOrdersList();

                        }, function(err) {
                            console.log(err);
                            LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
                        });
                } else {
                    // Do save
                    OrdersService.doSaveOrders(orders)
                        .then(function(id) {
                            // Save order detail
                            _.forEach(orders.items, function(v) {
                                OrdersService.doSaveOrderDetail(id, v)
                                    .then(function() {
                                        // Success
                                    }, function(err) {
                                        console.log(err);
                                    });
                            });

                            LxNotificationService.success("บันทึกรายการเสร็จเรียบร้อยแล้ว");
                            LxDialogService.close('mdlNewOrder');

                            $scope.getOrdersList();

                        }, function(err) {
                            console.log(err);
                            LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
                        });
                }

            }
        }

    };

    // Get orders list
    $scope.getOrdersList = function() {

        var opt = $scope.all ? 1 : 2;

        OrdersService.getOrdersList(opt)
            .then(function(rows) {
                $scope.orders = rows;
            }, function(err) {
                console.log(err);
                LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
            });

    };

    // Show orders list
    $scope.getOrdersList();

    // Toggle list
    $scope.toggleList = function() {
        $scope.getOrdersList();
    };
    // Remove order
    $scope.removeOrder = function(orderId) {
        LxNotificationService.confirm('ยืนยันการลบ', 'คุณต้องการลบรายการนี้ ใช่หรือไม่?', {
            ok: 'ใช่, ฉันต้องการลบ',
            cancel: 'ไม่'
        }, function(res) {
            if (res) {
                OrdersService.removeOrder(orderId)
                    .then(function() {
                        LxNotificationService.success('ลบรายการเสร็จเรียบร้อยแล้ว');
                        $scope.getOrdersList();
                    }, function(err) {
                        console.log(err);
                        LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
                    });
            }
        });
    };

    $scope.showEdit = function(orderId) {
        // Get order detail
        var promise = OrdersService.getOrders(orderId);
        promise.then(function(order) {
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
            .then(function(rows) {
                $scope.products = rows;
                $scope.getTotal();
                $scope.isUpdate = true;
                LxDialogService.open('mdlNewOrder');

            }, function(err) {
                console.log(err);
                LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
            });
    };

    $scope.sendOnline = function(orderId) {
        // TODO 1. Get order detail 2. Get order detail
        var orders = {};
        orders.items = [];

        LxNotificationService.confirm('ยืนยันการส่งข้อมุล', 'คุณต้องการส่งข้อมูลเบิกเวชภัณฑ์นี้ ใช่หรือไม่?', {
            ok: 'ใช่, ฉันต้องการส่งเบิก',
            cancel: 'ไม่ใช่, ยกเลิกการส่ง'
        }, function(res) {
            if (res) {
                LxProgressService.linear.show('#009688', '#progress');

                var promise = OrdersService.getOrders(orderId);
                promise.then(function(order) {
                        orders.orders_id = orderId;
                        orders.orders_code = order.orders_code;
                        orders.orders_date = moment(order.orders_date).format('YYYY-MM-DD');
                        orders.staff_id = order.staff_id;
                        orders.staff_name = order.fullname;

                        return OrdersService.getOrdersDetail(orderId);
                    })
                    .then(function(detail) {

                        _.forEach(detail, function(v) {
                            orders.items.push({
                                code: v.code,
                                qty: v.qty
                            });
                        });

                        return OrdersService.sendOnline(orders);
                    })
                    .then(function(data) {
                        if (data.ok) {

                            // Set online
                            OrdersService.setOnline(orderId)
                                .then(function() {
                                    LxProgressService.linear.hide('#progress');
                                    LxNotificationService.success('ส่งเบิกออนไลน์เสร็จเรียบร้อย');
                                    $scope.getOrdersList();
                                }, function(err) {
                                    console.log(err);
                                    LxProgressService.linear.hide('#progress');
                                    LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
                                });

                        } else {
                            LxProgressService.linear.hide('#progress');
                            LxNotificationService.error(data.err);
                        }
                    }, function(err) {
                        LxProgressService.linear.hide('#progress');
                        console.log(err);
                        LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
                    });
            }
        });

    };

    $scope.doSearch = function() {

        if (!$scope.query) {
            LxNotificationService.error('กรุณาระบุคำค้นหา');
        } else {
            OrdersService.search($scope.query)
                .then(function(rows) {
                    $scope.orders = rows;
                }, function(err) {
                    console.log(err);
                    LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
                });
        }

    };

    /** Get orders status online **/
    $scope.getOnline = function () {

        OrdersService.getOnlineStatus()
            .then(function (data) {
                if (data.ok) {
                    $scope.onlineOrders = data.rows;
                } else {
                    if (angular.isObject(data.msg)) {
                        console.log(data.msg);
                        LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู log')
                    } else {
                        LxNotificationService.error(data.msg);
                    }

                }
            }, function (err) {
                console.log(err);
            });

    };

    $scope.getStatusList = function () {
        OrdersService.getStatusList()
            .then(function (data) {
                if (data.ok) {
                    $scope.statusList = data.rows;
                } else {
                    if (angular.isObject(data.msg)) {
                        console.log(data.msg);
                        LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู log')
                    } else {
                        LxNotificationService.error(data.msg);
                    }
                }
            });
    };

    $scope.setStatus = function (data) {
        $scope.statusData = data;
    };

    $scope.getOnlineDetail = function (id) {
        LxProgressService.linear.show('#009688', '#progressOnline');

        OrdersService.getOnlineDetail(id)
            .then(function (data) {
                if (data.ok) {
                    $scope.productOnline = data.rows;
                    LxProgressService.linear.hide();
                    LxDialogService.open('mdlOnlineDetail');

                } else {
                    if (angular.isObject(data.msg)) {
                        console.log(data.msg);
                        LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู log')
                    } else {
                        LxNotificationService.error(data.msg);
                    }
                }
            });
    };

    $scope.getOnline();
    $scope.getStatusList();
});
