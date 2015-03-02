App.config(function ($routeProvider) {
   $routeProvider
       .when('/', {
           templateUrl: '../products/Main.html',
           controller: 'MainController'
       });
});