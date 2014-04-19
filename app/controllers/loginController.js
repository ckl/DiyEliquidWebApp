app.controller("loginController", function($scope, $modalInstance, Auth) {

    $scope.username = "";
    $scope.password = "";
    $scope.rememberme = false;
    $scope.buttonDisabled = false;

    $scope.login = function () {

        $scope.buttonDisabled = true;

        Auth.login({
                username: $scope.username,
                password: $scope.password,
                rememberme: $scope.rememberme
            },
            function(results) {
                $scope.buttonDisabled = false;
                $scope.close();
            },
            function(data) {
                alert(data);
                $scope.buttonDisabled = false;
            }
        );
    };

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };

});