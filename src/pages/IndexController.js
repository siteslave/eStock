App.controller('IndexController', function ($scope, $window) {

    var username = $window.sessionStorage.getItem('username');

    if (!username) {
        $window.location.href = '../login/Login.html';
    }

});