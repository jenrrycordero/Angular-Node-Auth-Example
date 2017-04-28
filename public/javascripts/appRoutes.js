'use strict';

/**********************************************************************
 * Angular Application
 **********************************************************************/
var app = angular.module('appRoutes', ['ui.router'])

    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        //================================================
        // Check if the user is connected
        //================================================
        var checkLoggedin = function ($q, $timeout, $http, $state) {
            // Initialize a new promise
            var deferred = $q.defer();

            var token = window.localStorage.getItem('token');

            if (!token) {
                deferred.reject();
                $state.go('login');
            }

            // Make an AJAX call to check if the user is logged in
            $http.post('http://localhost:3000/loggedin', {token: token}).success(function (res) {
                // Authenticated
                if (res.success) {
                    deferred.resolve(res);
                }
                else {
                    // Not Authenticated
                    console.log('You need to log in.');
                    deferred.reject();
                    $state.go('login');
                }
            });

            return deferred.promise;
        };



        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'public/views/main.html'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'public/views/login.html',
                controller: 'LoginCtrl'

            })
            .state('register', {
                url: '/register',
                templateUrl: 'public/views/register.html',
                controller: 'RegisterCtrl'

            })
            .state('admin', {
                url: '/admin',
                views: {
                    '': {
                        templateUrl: 'public/views/admin.html'
                    },
                    'adminHeader@admin': {
                        templateUrl: 'public/views/adminMenu.html',
                        controller: 'AdminCtrl',
                    },
                    'adminContent@admin': {
                        templateUrl: 'public/views/adminDashboard.html',
                    }
                },
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('admin.users', {
                url: '/users',
                views: {
                    'adminContent@admin': {
                        templateUrl: 'public/views/usersList.html',
                        controller: 'UsersCtrl'
                    }
                },
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('admin.createuser', {
                url: '/admin/create-user',
                views:{
                    'adminContent@admin': {
                        templateUrl: 'public/views/userCreate.html',
                        controller: 'UserCreateCtrl'
                    }
                },
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('admin.user', {
                url: '/admin/user/:id',
                views:{
                    'adminContent@admin': {
                        templateUrl: 'public/views/userEdit.html',
                        controller: 'UserEditCtrl'
                    }
                },
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('admin.vehicles', {
                url: '/vehicles',
                views: {
                    'adminContent@admin': {
                        templateUrl: 'public/views/vehiclesList.html',
                        controller: 'VehiclesCtrl'
                    }
                },
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('admin.createvehicle', {
                url: '/admin/create-vehicle',
                views:{
                    'adminContent@admin': {
                        templateUrl: 'public/views/vehicleCreate.html',
                        controller: 'VehicleCreateCtrl'
                    }
                },
                resolve: {
                    loggedin: checkLoggedin
                }
            })


    }]); // end of config()

