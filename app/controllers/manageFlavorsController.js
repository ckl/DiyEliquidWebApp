app.controller("manageFlavorsController", function($scope, recipeService, transpose) {

    $scope.flavorData = {};
    $scope.flavorsTransposed = {};

    init();
    
    function init() {
        recipeService.getAllFlavors(function(data) {
            // success callback
            $scope.flavorData = data;
            $scope.flavorsTransposed = transpose(data);
        }, function(data) {
            // error callback
            alert("Error: " + data);
        });
    }
    

});