app.controller("navItemController", function($scope, $modal, $http, Auth) {

    $scope.user = Auth.user;

    $scope.isLoggedIn = function() {
        if (Auth.isLoggedIn()) {
            $scope.user = Auth.getUser();
            return true;
        }
        return false;

    };

    $scope.isAdmin = function() {
        return Auth.isAdmin();
    };

    $scope.login = function() {
        var modalInstance = $modal.open({
            templateUrl: 'app/views/login.html',
            controller: 'loginController',
            resolve: {
                
            }
        });

        modalInstance.result.then(function (data) {
            $scope.user = Auth.getUser();
        });
    };

    $scope.register = function() {
        var modalInstance = $modal.open({
            templateUrl: 'app/views/register.html',
            controller: 'registerController',
            resolve: {
                
            }
        });

        modalInstance.result.then(function(data) {
            $scope.user = Auth.getUser();
        });
    };

    $scope.logout = function() {
        Auth.logout(function() {
            // Success callback
            location.href = "/";
        }, function() {
            // Error callback
            location.href = "/";
        });
    };

});