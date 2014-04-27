app.controller("searchRecipesByIngredientController", function ($scope, $modal, $http, Auth, modalService, recipeService, flavorDropdownFactory, flavorDropdownModel) {
    $scope.flavors = [];
    $scope.numMissingFlavors = 1;

    $scope.selects = {
        m: [new flavorDropdownModel()]
    };

    var usersFlavors = [];

    

    function init() {

        recipeService.getAllFlavors(function(data) {
            $scope.flavors = data;

        }, function(data) {
            alert("Error: " + data);
        });

        if (Auth.isLoggedIn()) {
            recipeService.getAllFlavorsForUser(function(data) {

                usersFlavors = data;
                $scope.selects.m = [];

                // build option sets, push into model, and update the flavor dropdown based on the flavorbrand
                $scope.selects = flavorDropdownFactory.getFlavorDropdown(data);

                angular.forEach($scope.selects.m, function(op) {
                    $scope.updateFlavorDropdown(op);
                });

            }, function(data) {
                //alert("Error: " + data);
            });
        }
    }

    $scope.addSelect = function() {
        $scope.selects.m.push(new flavorDropdownModel());
    };

    $scope.removeSelect = function(select) {
        var index = $scope.selects.m.indexOf(select);
        if (index >= 0)
            $scope.selects.m.splice(index, 1);
    };
    
    $scope.doSearch = function () {
        $scope.currentPage = 1;
        searchRecipes();
    };

    $scope.showRecipeModal = function(recipe) {
        modalService.showRecipe(recipe, "viewRecipe", "viewRecipeController");
    };

    // Sets the flavors dropdown to the correct brand of flavors
    $scope.updateFlavorDropdown = function (op) {
        angular.forEach($scope.flavors, function(item) {
            if (item.FlavorBrandId == op.FlavorBrandId) {
                var index = $scope.selects.m.indexOf(op);

                if (index != -1)
                    $scope.selects.m[index].flavors = item.Flavors;
            }
        });
    };
    
    // TODO: move the $http.post call into recipeService
    function searchRecipes() {

        var params = [];
        var len = $scope.selects.m.length;
        for (var i = 0; i < len; i++) {
            if ($scope.selects.m[i].hasOwnProperty("FlavorId"))
                params.push($scope.selects.m[i].FlavorId);
        }

        var data = JSON.stringify({ 'flavors': params, 'numMissingFlavors': $scope.numMissingFlavors });
        $http.post("/Flavor/SearchRecipeByIngredient/", data).success(function (results) {

            if (results == null)
                $scope.recipes = "No results found";
            else
                $scope.recipes = results;
        });
    }

    init();
});
