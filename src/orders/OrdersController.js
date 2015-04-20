// Order controller

App.controller('OrdersController', function($scope, $filter, OrdersService, LxNotificationService,
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
            if (!data) {
                callback();
            } else {
                callback(data);
            }
        }
    };

    $scope.staff = {
        list: [],
        loading: false,
        selected: null,
        toModel: function(data, callback)
        {
            if (!data) {
                callback();
            } else {
                callback(data);
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
                            Q.forEach(orders.items, function(v) {
                                var defer = Q.defer();
                                OrdersService.doSaveOrderDetail($scope.orderId, v)
                                    .then(function() {
                                        defer.resolve();
                                    }, function(err) {
                                        defer.reject();
                                        console.log(err);
                                    });

                                return defer.promise;
                            }).then(function () {
                                LxNotificationService.success("บันทึกรายการเสร็จเรียบร้อยแล้ว");
                                LxDialogService.close('mdlNewOrder');

                                $scope.getOrdersList();
                                $scope.getOnline();
                            });

                        }, function(err) {
                            console.log(err);
                            LxNotificationService.error('เกิดข้อผิดพลาด กรุณาดู Log');
                        });
                } else {
                    // Do save
                    OrdersService.doSaveOrders(orders)
                        .then(function(id) {
                            // Save order detail
                            Q.forEach(orders.items, function(v) {
                                var defer = Q.defer();

                                OrdersService.doSaveOrderDetail(id, v)
                                    .then(function() {
                                        defer.resolve();
                                    }, function(err) {
                                        defer.reject(err);
                                        console.log(err);
                                    });

                                return defer.promise;

                            }).then(function () {
                                LxNotificationService.success("บันทึกรายการเสร็จเรียบร้อยแล้ว");
                                LxDialogService.close('mdlNewOrder');

                                $scope.getOrdersList();
                            });

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
                                qty: v.qty,
                                icode: v.icode
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

        LxProgressService.linear.show('#009688', '#progressOnline');

        OrdersService.getOnlineStatus()
            .then(function (data) {
                if (data.ok) {
                    $scope.onlineOrders = data.rows;
                    LxProgressService.linear.hide();
                } else {
                    if (angular.isObject(data.msg)) {
                        console.log(data.msg);
                        LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู log');
                        LxProgressService.linear.hide();
                    } else {
                        LxNotificationService.error(data.msg);
                        LxProgressService.linear.hide();
                    }

                }
            }, function (err) {
                LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู log');
                console.log(err);
                LxProgressService.linear.hide();
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
                        LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู log');
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
                    $scope.productOnline = data.products;
                    $scope.orderOnlineDetail = data.orders;
                    //$scope.approve_orders_code = data.orders.orders_code;
                    $scope.approve_orders_id = id;
                    $scope.approved_date = $filter('toShortDate')(data.orders.created_at);
                    $scope.approved_by = data.orders.master_staff_name;

                    LxProgressService.linear.hide();
                    LxDialogService.open('mdlOnlineDetail');

                } else {
                    if (angular.isObject(data.msg)) {
                        console.log(data.msg);
                        LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู log');
                    } else {
                        LxNotificationService.error(data.msg);
                    }
                }
            });
    };

    /**
     * Import data
     */
    $scope.doImport = function () {
        LxNotificationService.confirm('ยืนยันการนำเข้า', 'คุณต้องการนำเข้าข้อมูลหรือไม่?', {
            ok: 'ใช่, ฉันต้องการนำเข้า',
            cancel: 'ยกเลิก'
        }, function (res) {
            if (res) {
                OrdersService.isImported($scope.orderOnlineDetail.orders_code)
                    .then(function (isExist) {
                        if (isExist) {
                            LxNotificationService.warning('รายการนี้ได้ถูกนำเข้าข้อมูลแล้ว ไม่สามารถนำเข้าได้อีก');
                        } else {
                            var promise =
                                OrdersService.updateOrderImportStatus($scope.orderOnlineDetail.orders_code);

                            promise.then(function () {
                                return OrdersService.updateClientOrdersStatus($scope.approve_orders_id);
                            }).then(function (id) {
                                Q.forEach($scope.productOnline, function (v) {

                                    var defer = Q.defer();
                                    var objMain = {};
                                    // Main
                                    objMain.act_code = $scope.orderOnlineDetail.orders_code;
                                    objMain.act_name = 'คลังหลัก';
                                    objMain.act_date = moment().format('YYYY-MM-DD');
                                    objMain.icode = v.icode;
                                    objMain.get_qty = v.approve_qty;
                                    objMain.created_at = moment().format('YYYY-MM-DD HH:mm:ss');

                                    OrdersService.saveMainStockCard(objMain, id)
                                        .then(function () {
                                            defer.resolve();
                                        });

                                    return defer.promise;

                                }).then(function () {
                                    $scope.getOnline();
                                    LxNotificationService.success('นำเข้ารายการเสร็จเรียบร้อยแล้ว');
                                    LxDialogService.close('mdlOnlineDetail');
                                });

                            }, function (err) {
                                console.log(err);
                                LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู log');
                            });
                        }
                    });
            }
        });
    };

    // close online order detail
    $scope.closingOnlineDetail = function () {
        $scope.productOnline = null;
        $scope.orderOnlineDetail = null;
        $scope.approved_date = null;
        $scope.approved_by = null;
        $scope.approve_orders_id = null;
    };

    // Cancel orders online
    $scope.cancelOrder = function (ordersCode) {
        LxNotificationService.confirm('ยืนยันการยกเลิก', 'คุณต้องการยกเลิกรายการนี้ ใช่หรือไม่?', {
            ok: 'ใช่, ฉันต้องการยกเลิก',
            cancel: 'ไม่ใช่'
        }, function (res) {
            if (res) {
                OrdersService.doCancelOnline(ordersCode)
                    .then(function (data) {
                        if (data.ok) {
                            // update send online
                            OrdersService.doCancelOnlineStatus(ordersCode)
                                .then(function () {
                                    LxNotificationService.success('ยกเลิกรายการเสร็จเรียบร้อยแล้ว');
                                    $scope.getOnline();
                                }, function (err) {
                                    LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู log');
                                    console.log(err);
                                });

                        } else {
                            if (angular.isObject(data.msg)) {
                                console.log(data.msg);
                                LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู log');
                            } else {
                                LxNotificationService.error(data.msg);
                            }
                        }
                    }, function (err) {
                        console.log(err);
                        LxNotificationService.error('เกิดข้อผิดพลาดกรุณาดู log');
                    });
            }
        });
    };

    $scope.getOnline();
    $scope.getStatusList();

});
