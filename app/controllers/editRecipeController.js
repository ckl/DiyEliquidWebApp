app.controller("editRecipeController", function ($scope, $http, $dialogs, $routeParams, recipeService, flavorDropdownModel) {

    $scope.recipeId = $routeParams.recipeId;
    $scope.recipe = { id: '', name: '', description: '' };
    $scope.flavors = [];
    $scope.buttonDisabled = false;

    init();
    
    function init() {
        // get the recipe name, description, and ingredients

        recipeService.getRecipe($scope.recipeId, function(data) {
            $scope.recipe = {
                id: data.Id,
                name: data.Name,
                description: data.Description
            };

            var ingredients = [];
            angular.forEach(data.Ingredients, function(item) {
                ingredients.push(new Model2({
                    id: item.FlavorId,
                    flavorId: item.FlavorId,
                    name: item.FlavorName,
                    amount: item.Amount
                }));
            });
            $scope.ingredients.m = ingredients;

        }, function(data) {
            
        });

        // TODO: move $http.post into recipeService
        $http.post("/Flavor/GetAllFlavorsByBrand").success(function (data) {
            $scope.flavors = data;
        });
    }

    $scope.updateRecipe = function () {

        $scope.buttonDisabled = true;

        var missingAmount = false;
        var missingFlavor = false;

        $scope.ingredients.m.forEach(function(item) {
            if (item.amount == null)
                missingAmount = true;
            if (item.flavorId == null)
                missingFlavor = true;
        });

        if ($scope.recipe.name == null) {
            alert("Enter a name for the recipe");
            $scope.buttonDisabled = false;
            return;
        }

        if ($scope.ingredients.m.length == 0) {
            alert("You must select at least 1 flavor");
            $scope.buttonDisabled = false;
            return;
        }

        if (missingFlavor) {
            alert("Please select a flavor for each dropdown");
            $scope.buttonDisabled = false;
            return;
        }

        if (missingAmount) {
            alert("Please enter an amount (%) for each ingredient");
            $scope.buttonDisabled = false;
            return;
        }

        recipeService.updateRecipe($scope.recipe, $scope.ingredients.m,
            function (data) {
                // success callback
                $scope.buttonDisabled = false;
            }, function(data) {
                // error callback
                $scope.buttonDisabled = false;
            });
    };

    $scope.deleteRecipe = function () {

        var dlg = $dialogs.confirm("Delete " + $scope.recipe.name + "?");
        dlg.result.then(function(btn) {
            recipeService.deleteRecipe($scope.recipeId, function (data) {
                // success callback
                alert("Recipe deleted");
                location.href = "/";
            }, function (data) {
                // error callback
                alert("Error: " + data);
            });
        }, function(btn) {

        });

        
    };

    $scope.ingredients = {
        m: [new flavorDropdownModel()]
    };

    $scope.add = function () {
        $scope.ingredients.m.push(new Model2());
    };

    $scope.remove = function (select) {
        var index = $scope.ingredients.m.indexOf(select);
        if (index >= 0) {
            $scope.ingredients.m.splice(index, 1);
        }
    };
});

function Model2(json) {
    json = json || {};
    this.id = json.id || null;
    this.flavorId = json.id || null;
    this.name = json.name || null;
    this.amount = json.amount || null;
    this.delete = json.delete || false;
}