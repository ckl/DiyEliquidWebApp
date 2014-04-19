app.controller("registerController", function($scope, $modalInstance, Auth) {

    $scope.username = "";
    $scope.password = "";
    $scope.passwordConfirm = "";
    $scope.email = "";
    $scope.buttonDisabled = false;

    init();
    
    function init() {
    }

    $scope.register = function () {

        $scope.buttonDisabled = true;
        var errorMsg = "";

        if ($scope.username === "")
            errorMsg = "Please enter a username";

        if ($scope.password === "")
            errorMsg += "\nPlease enter a password";

        if ($scope.password != $scope.passwordConfirm)
            errorMsg += "\nPasswords do not match";
        
        if ($scope.email === "")
            errorMsg += "\nPlease enter an email address";

        if (errorMsg != "") {
            alert(errorMsg);
            $scope.buttonDisabled = false;
            return;
        }

        Auth.register({
            username: $scope.username,
            password: $scope.password,
            email: $scope.email,
        }, function() {
            // Success callback
            location.href = "/";
        }, function(data) {
            // Error callback
            alert("Error: " + data);
            $scope.buttonDisabled = false;
        });
    };

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
});