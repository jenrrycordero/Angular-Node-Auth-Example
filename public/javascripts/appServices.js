'use strict';

/**********************************************************************
 * Angular Application
 **********************************************************************/
var app = angular.module('appServices', []);

/**********************************************************************
 * Authentication Service / Factory
 **********************************************************************/
app.service('AuthService', function ($location) {

    this.logout = function () {
        localStorage.removeItem('token');
        localStorage.removeItem('welcomeName');
        localStorage.removeItem('welcomeAvatar');
        $location.url('/home');
    };

    this.setToken = function (token) {
        window.localStorage.setItem('token', token);
    };

    this.getToken = function () {
        return window.localStorage.getItem('token');
    };

    this.setWelcomeName = function (welcomeName) {
        window.localStorage.setItem('welcomeName', welcomeName);
    };

    this.getWelcomeName = function () {
        return window.localStorage.getItem('welcomeName');
    };

    this.setWelcomeAvatar = function (welcomeAvatar) {
        window.localStorage.setItem('welcomeAvatar', welcomeAvatar);
    };

    this.getWelcomeAvatar = function () {
        return window.localStorage.getItem('welcomeAvatar');
    };

});