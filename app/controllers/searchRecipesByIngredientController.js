app.controller("searchRecipesByIngredientController", function ($scope, $modal, $http, modalService, recipeService) {
    $scope.flavors = [];
    $scope.numMissingFlavors = 1;
    
    init();
    
    function init() {

        recipeService.getAllFlavors(function(data) {
            $scope.flavors = data;
        }, function(data) {
            alert("Error: " + data);
        });

        //recipeService.getAllFlavorBrands(function (data) {
        //    // success callback
        //    $scope.FlavorBrands = data;
        //}, function (data) {
        //    // error callback
        //    alert("Error: " + data);
        //});

        //recipeService.GetAllFlavorsByBrand(1, function (data) {
        //    // success callback
        //    $scope.flavors = data;
        //}, function (data) {
        //    // error callback
        //    alert("Error: " + data);
        //});
    }

    $scope.selects = {
        m: [new Model()]
    };

    $scope.addSelect = function() {
        $scope.selects.m.push(new Model());
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

    $scope.updateFlavors = function(op) {
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
});

function Model(json) {
    json = json || {};
    this.flavors = json.flavors || [];
    this.selected_brand = json.selected_brand || null;
    this.selected_flavor = json.selected_flavor || null;
}