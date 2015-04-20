App.config(function ($routeProvider) {
   $routeProvider
       .when('/', {
           templateUrl: '../products/Main.html',
           controller: 'MainController'
       })
       .when('/card/:icode', {
           templateUrl: '../products/StockCard.html',
           controller: 'StockCardController'
       });
});