app.controller("addFlavorController", function ($scope, $modalInstance, $http, flavors) {

    $scope.flavors = flavors;

    $scope.addFlavor = function() {

        $scope.buttonDisabled = true;

        if ($scope.selectedBrand == null) {
            alert("Select a flavor brand");
            $scope.buttonDisabled = false;
            return;
        }

        if ($scope.flavorName == null) {
            alert("Enter a name for the flavor");
            $scope.buttonDisabled = false;
            return;
        }

        // TODO: move http.post into recipeService
        var params = { flavorBrandId: $scope.selectedBrand, flavorName: $scope.flavorName, notes: $scope.flavorNotes };
        $http.post("/Flavor/AddFlavor", params).
            success(function(data, status, headers, config) {

                alert("Created flavor");
                $scope.buttonDisabled = false;

                $modalInstance.close({ result: data });
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