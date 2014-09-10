angular
  .module('gcloud', ['ngRoute'])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        controller: 'HomeCtrl',
        templateUrl: 'views/home.html'
      })
      .when('/users', {
        controller: 'UsersCtrl',
        templateUrl: 'views/users.html',
        resolve: {
          users: function($http) {
            return $http.get('/api/users').then(function(user) {
              return user.data;
            });
          }
        }
      })
      .when('/users/:id', {
        controller: 'UserCtrl',
        templateUrl: 'views/user.html',
        resolve: {
          user: function($http, $route) {
            var id = $route.current.params.id;
            return $http.get('/api/users/' + id).then(function(user) {
              return user.data;
            });
          }
        }
      });
  })

  .controller('HomeCtrl', function() {})
  .controller('UsersCtrl', function($scope, users, $http, $timeout) {
    $scope.users = users;

    $scope.addUser = function(name) {
      $http
        .post('/api/users', { name: name })
        .then(function() {
          $scope.saved = true;
          $scope.name = '';
          $http.get('/api/users').then(function(res) {
            $scope.users = res.data;
          });
          $timeout(function() { $scope.saving = $scope.saved = false; }, 3000);
        }, function() {
          $scope.saved = false;
          $timeout(function() { $scope.saving = false; }, 3000);
        });
    };
  })
  .controller('UserCtrl', function($scope, user, $http, $routeParams, $timeout) {
    var id = $routeParams.id;
    $scope.user = user;

    $scope.addField = function() {
      $scope.addingField = true;
    };

    $scope.addCreatedField = function(property, value) {
      $scope.user.data[property] = value;
      $scope.addingField = false;
      $scope.property = '';
      $scope.value = '';
    };

    $scope.saving = false;
    $scope.save = function() {
      $scope.saving = true;
      $http
        .post('/api/users/' + id, $scope.user.data)
        .then(function() {
          $scope.saved = true;
          $timeout(function() { $scope.saving = $scope.saved = false; }, 3000);
        }, function() {
          $scope.saved = false;
          $timeout(function() { $scope.saving = false; }, 3000);
        });
    };
  });