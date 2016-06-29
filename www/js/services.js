

angular.module('conFusion.services',['ngResource'])
.constant("baseURL", "https://173.57.126.222:3443/")
.factory('menuFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

    return $resource(baseURL + "dishes/:id", null, {
        'update': {
            method: 'PUT'
        }
    });

}])

.factory('commentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

        return $resource(baseURL + "dishes/:id/comments/:commentId", {id:"@Id", commentId: "@CommentId"}, {
            'update': {
                method: 'PUT'
            }
        });

}])

.factory('promotionFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        return $resource(baseURL + "promotions/:id");
}])

.factory('corporateFactory', ['$resource', 'baseURL', function($resource, baseURL) {

        return $resource(baseURL + "leadership/:id");

}])

.factory('feedbackFactory', ['$resource', 'baseURL', function($resource, baseURL) {
    var feedfac = {};

    feedfac.getFeedback = function() {
        return $resource(baseURL + "feedback/:id", null, {
            'save': {
                method: 'POST'
            }
        });
    };

    return feedfac;
}])

.factory('favoriteFactory', ['$resource', 'baseURL', '$localStorage', function($resource, baseURL, $localStorage){
    var favFac = {};
    var favorites = $localStorage.getObject('favorites', '[]');

    favFac.addToFavorites = function (index) {
        for (var i=0; i < favorites.length; i++){
            if (favorites[i].id == index)
                return;
        }

        favorites.push({id: index});
        $localStorage.storeObject('favorites', favorites);
    };

    favFac.getFavorites = function () {
        return favorites;
    };

    favFac.deleteFromFavorites = function (index) {
        for (var i = 0; i<favorites.length; i++){
            if (favorites[i].id == index){
                favorites.splice(i, 1);
            }
        }
        $localStorage.storeObject('favorites', favorites);

    };

    return favFac;
}])

.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    };
}])

.factory('AuthFactory', ['$resource', '$http', '$localStorage', '$rootScope', '$scope','$window', 'baseURL', '$ionicModal', function($resource, $http, $localStorage, $rootScope, $scope, $window, baseURL, $ionicModal){

    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var authToken = undefined;


  function loadUserCredentials() {
    var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.username !== undefined) {
      useCredentials(credentials);
    }
  }

  function storeUserCredentials(credentials) {
    $localStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }

  function useCredentials(credentials) {
    isAuthenticated = true;
    username = credentials.username;
    authToken = credentials.token;

    // Set the token as header for your requests!
    $http.defaults.headers.common['x-access-token'] = authToken;
  }

  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['x-access-token'] = authToken;
    $localStorage.remove(TOKEN_KEY);
  }

    authFac.login = function(loginData) {

        $resource(baseURL + "users/login")
        .save(loginData,
           function(response) {
              storeUserCredentials({username:loginData.username, token: response.token});
              $rootScope.$broadcast('login:Successful');
           },
           function(response){
              isAuthenticated = false;

              var message = '\
                <div class="">\
                <div><h3>Login Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + '</p><p>' +
                    response.data.err.name + '</p></div>' +
                '<div class="">\
                    <button dark outline type="button" ng-click=confirm("OK")>OK</button>\
                </div>';

                $scope.model.show({ template: message, plain: 'true'});
           }

        );

    };

    authFac.logout = function() {
        $resource(baseURL + "users/logout").get(function(response){
        });
        destroyUserCredentials();
    };

    authFac.register = function(registerData) {

        $resource(baseURL + "users/register")
        .save(registerData,
           function(response) {
              authFac.login({username:registerData.username, password:registerData.password});
            if (registerData.rememberMe) {
                $localStorage.storeObject('userinfo',
                    {username:registerData.username, password:registerData.password});
            }

              $rootScope.$broadcast('registration:Successful');
           },
           function(response){

              var message = '\
                <div class="">\
                <div><h3>Registration Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message +
                  '</p><p>' + response.data.err.name + '</p></div>';

                $scope.modal.show({ template: message, plain: 'true'});

           }

        );
    };

    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };

    authFac.getUsername = function() {
        return username;
    };

    loadUserCredentials();

    return authFac;

}])
;
