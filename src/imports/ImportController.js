App.controller('ImportController', function ($scope, $timeout, LxNotificationService, LxProgressService) {

    $scope.isSuccess = false;

    $scope.btnMsg = 'Import drug data from the cloud server';

    $scope.showProgress = function () {

        LxNotificationService.confirm('Confirmation.', 'Do you want to import drug data from cloud server?', {
            ok: 'Yes, I\'m so sure',
            cancel: 'No'
        }, function (res) {
            if (res) {
                $scope.isSuccess = false;
                $scope.btnMsg = 'Importing...';
                LxProgressService.linear.show('#009688', '#progress');

                $timeout(function () {
                    LxNotificationService.success('Imported successfully.');
                    LxProgressService.linear.hide('#progress');
                    $scope.btnMsg = 'Drug data has been imported successfully';
                    $scope.isSuccess = true;
                }, 5000);
            }
        });
    };

});
