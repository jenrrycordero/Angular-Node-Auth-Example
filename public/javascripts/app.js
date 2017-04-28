'use strict';

/**********************************************************************
 * Angular Application
 **********************************************************************/
var app = angular.module('app', ['appRoutes', 'appServices']);

/**********************************************************************
 * Login controller
 **********************************************************************/
app.controller('LoginCtrl', function ($scope, $rootScope, $location, $http, $state, AuthService) {

    // Confirmation from email
    var query_string = $location.search().auth;
   
    if (query_string) {
        $http.post('http://localhost:3000/verify', {auth: query_string})
            .success(function (res) {
                // No error: authentication OK
                //console.log(res);
            })
            .error(function (err) {
                // Error: authentication failed
                console.log('There was an error', err);
            });
    }

    // This object will be filled by the form
    $scope.user = {};

    // Register the login() function
    $scope.login = function () {
        $http.post('http://localhost:3000/login', {
            username: $scope.user.email,
            password: $scope.user.password
        })
            .success(function (res) {
                // No error: authentication OK
                AuthService.setToken(res.token);
                AuthService.setWelcomeName(res.welcomeName);
                AuthService.setWelcomeAvatar(res.welcomeAvatar);
                $state.go('admin');
            })
            .error(function () {
                // Error: authentication failed
                $scope.message = 'Authentication failed.';
                $state.go('login');
            });
    };
});

/**********************************************************************
 * Register controller
 **********************************************************************/
app.controller('RegisterCtrl', function ($scope, $rootScope, $http, $state) {
    // This object will be filled by the form
    $scope.user = {};

    // Register the login() function
    $scope.register = function () {
        $http.post('http://localhost:3000/register', {
            fullname: $scope.user.fullname,
            username: $scope.user.email,
            password: $scope.user.password,
            address1: $scope.user.address1,
            address2: $scope.user.address2,
            city: $scope.user.city,
            state: $scope.user.state,
            zip: $scope.user.zip,
            phone: $scope.user.phone,
            driver_license: $scope.user.driver_license,
            license_exp_month: $scope.user.license_exp_month,
            license_exp_year: $scope.user.license_exp_year,
        })
            .success(function (res) {
                // No error: authentication OK
                if (res.success == false) {
                    $scope.error = 'error';
                    $scope.errorInput = 'error-input';
                    $scope.err_message = res.message;
                }
                if (res.success) {
                    $scope.message = res.message;
                    $scope.errorInput = '';
                    $scope.err_message = '';
                    $scope.user = {};
                }

            })
            .error(function () {
                // Error: authentication failed
                console.log('Authentication failed.');
                $state.go('login');
            });
    };
});

/**********************************************************************
 * Admin Controller
 **********************************************************************/
app.controller('AdminCtrl', function ($scope, $http, AuthService) {

    $scope.welcomeName = AuthService.getWelcomeName();
    $scope.welcomeAvatar = AuthService.getWelcomeAvatar();

    $scope.logout = function () {
        AuthService.logout();
    }

});


/**********************************************************************
 * Users Controller
 **********************************************************************/
app.controller('UsersCtrl', function ($scope, $http, AuthService) {

    var token = {
        'Authorization': AuthService.getToken()
    };

    // List of users got from the server
    $scope.users = [];

    // Fill the array to display it in the page
    $http.get('http://localhost:3000/users', {headers: token}).success(function (res) {
        if (res.status == true)
            $scope.users = res.users;
    });

});

/**********************************************************************
 * User Create Controller
 **********************************************************************/
app.controller('UserCreateCtrl', function ($scope, $http, $state, AuthService) {

    $scope.token = AuthService.getToken();

    $scope.createUser = function(){

        //Create User
        $http.post('http://localhost:3000/userCreate', { user : $scope.user, token: $scope.token}).success(function (res) {
            if (res.status)
                $state.go('admin.users');
        });
    };

});

/**********************************************************************
 * User Edit Controller
 **********************************************************************/
app.controller('UserEditCtrl', function ($scope, $http, $state, $stateParams, AuthService) {

    $scope.token = AuthService.getToken();
    $scope.user_id = $stateParams.id;
    $scope.user = {};

    // User Detail
    $http.post('http://localhost:3000/user', {userId: $scope.user_id, token: $scope.token}).success(function (res) {
        if (res.status == true)
            $scope.user = res.user;
    });


    $scope.userUpdate = function(){
        $http.post('http://localhost:3000/userUpdate', {user: $scope.user, token: $scope.token}).success(function (res) {
            if (res.status == true)
                $state.go('admin.users');
        });
    }

});

/**********************************************************************
 * Vehicles Controller
 **********************************************************************/
app.controller('VehiclesCtrl', function ($scope, $http, AuthService) {

    // var token = {
    //     'Authorization': AuthService.getToken()
    // };
    //
    // // List of users got from the server
    // $scope.users = [];
    //
    // // Fill the array to display it in the page
    // $http.get('http://localhost:3000/vehicles', {headers: token}).success(function (res) {
    //     if (res.status == true)
    //         $scope.vehicles = res.vehicles;
    // });

});


app.controller('VehicleCreateCtrl', function ($scope, $http, AuthService) {

    $scope.vehicle = {
        tag : '',
        color: '',
        mileage: '',
        brand: '',
        model: '',
        year: '',
        drivers: [],
        status: '',
        description: '',
        message: ''
    };

    $scope.drivers = [
        '235235-Alberto Perez',
        '754363-Jenrry Cordero',
        '32222-Alian Nieves',
        '97777-Carlos Apellido',
        '74574754-Igor Something',
        '4670434-Mathew Something Else'
    ];

    //Sort Array
    $scope.drivers.sort();
    //Define Suggestions List
    $scope.suggestions = [];
    //Define Selected Suggestion Item
    $scope.selectedIndex = -1;

    //Function To Call On ng-change
    $scope.search = function(){
        $scope.suggestions = [];
        var myMaxSuggestionListLength = 0;
        for(var i=0; i<$scope.drivers.length; i++){
            var searchItemsSmallLetters = angular.lowercase($scope.drivers[i]);
            var searchTextSmallLetters = angular.lowercase($scope.vehicle.driver);
            if( searchItemsSmallLetters.indexOf(searchTextSmallLetters) !== -1){
                $scope.suggestions.push(searchItemsSmallLetters);
                myMaxSuggestionListLength += 1;
                if(myMaxSuggestionListLength == 5){
                    break;
                }
            }
        }
    };

    //Keep Track Of Search Text Value During The Selection From The Suggestions List
    $scope.$watch('selectedIndex',function(val){
        if(val !== -1) {
            $scope.vehicle.driver = $scope.suggestions[$scope.selectedIndex];
        }
    });


    //Text Field Events
    //Function To Call on ng-keydown
    $scope.checkKeyDown = function(event){
        console.log(event.keyCode);
        if(event.keyCode === 40){//down key, increment selectedIndex
            event.preventDefault();
            if($scope.selectedIndex+1 !== $scope.suggestions.length){
                $scope.selectedIndex++;
            }
        }else if(event.keyCode === 38){ //up key, decrement selectedIndex
            event.preventDefault();
            if($scope.selectedIndex-1 !== -1){
                $scope.selectedIndex--;
            }
        }else if(event.keyCode === 13){ //enter key, empty suggestions array
            event.preventDefault();
            $scope.suggestions = [];
        }
    };

    //Function To Call on ng-keyup
    $scope.checkKeyUp = function(event){
        if(event.keyCode !== 8 || event.keyCode !== 46){//delete or backspace
            if($scope.vehicle.driver == ""){
                $scope.suggestions = [];
            }
        }
    };
    //======================================

    //List Item Events
    //Function To Call on ng-click
    $scope.AssignValueAndHide = function(index){
        $scope.vehicle.driver = $scope.suggestions[index];
        $scope.suggestions=[];

        console.log($scope.selectedIndex);
        $scope.drivers.splice($scope.selectedIndex, 1);
    };
    //======================================

    //Get driver and inserted in vehicle json
    $scope.addDriver = function(){
        $scope.driverError = 0;
        if($scope.vehicle.driver == undefined || $scope.vehicle.driver == ''){
            $scope.vehicle.message = 'You must select a driver first.';
            $scope.driverError = 1;
        }else{
            var res = $scope.vehicle.driver.split('-');
            $scope.vehicle.drivers.push( {license: res[0], fullname: res[1]} );
            $scope.vehicle.driver = '';
            $scope.driverError = 0;
        }

    };
    //======================================

    //Remove driver from the list
    $scope.removeDriver = function (index) {
        var driverInfo = $scope.vehicle.drivers[index].license +"-"+$scope.vehicle.drivers[index].fullname;
        console.log(driverInfo);
        $scope.drivers.push(driverInfo);
        $scope.vehicle.drivers.splice(index, 1);
    };

});