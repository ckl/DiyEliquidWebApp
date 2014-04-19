app.controller("addFlavorController", function ($scope, $modalInstance, $http, flavors) {

    $scope.flavors = flavors;

    $scope.addFlavor = function() {

        $scope.buttonDisabled = true;

        if ($scope.flavorName == null) {
            alert("Enter a name for the flavor");
            return;
        }

        var params = { flavorName: $scope.flavorName, notes: $scope.flavorNotes };
        $http.post("/FlavorBrand/AddFlavor", params).
            success(function(data, status, headers, config) {
                $scope.flavors.push(data);
                
                alert("created flavor");
                $scope.buttonDisabled = false;

                $scope.close();
            }).
            error(function(data, status, headers, config) {
                alert("Error: " + data);
                $scope.buttonDisabled = false;
            });
    };

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };

});