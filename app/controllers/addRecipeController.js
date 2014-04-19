app.controller("addRecipeController", function ($scope, $modal, $http, recipeService) {
    $scope.flavors = [];

    init();
    
    function init() {

        recipeService.GetAllFlavorsByBrand(1, function(data) {
            // success callback
            $scope.flavors = data;
        }, function(data) {
            // error callback
            alert("Error: " + data);
        });
    }

    $scope.ingredients = {
        m: [new Model()]
    };

    $scope.add = function () {
        $scope.ingredients.m.push(new Model());
    };

    $scope.remove = function (select) {
        var index = $scope.ingredients.m.indexOf(select);
        if (index >= 0)
            $scope.ingredients.m.splice(index, 1);
    };

    $scope.addNewFlavor = function() {
        var modalInstance = $modal.open({
            templateUrl: 'app/views/add-flavor.html',
            controller: 'addFlavorController',
            resolve: {
                flavors: function() {
                    return $scope.flavors;
                }
            }
        });

        modalInstance.result.then(function(flavors) {
            $scope.flavors = flavors;
        });
    };
    
    $scope.addRecipe = function () {

        $scope.buttonDisabled = true;

        if ($scope.recipeName == null) {
            alert("Enter a name for the recipe");
            $scope.buttonDisabled = false;
            return;
        }
        
        var params = [];
        var len = $scope.ingredients.m.length;
        for (var i = 0; i < len; i++) {
            var ingredient = {};

            if ($scope.ingredients.m[i].hasOwnProperty("flavors"))
                ingredient.FlavorId = $scope.ingredients.m[i].flavors.Name;
            else {
                alert("Select a flavor");
                $scope.buttonDisabled = false;
                return;
            }

            if ($scope.ingredients.m[i].amount != null)
                ingredient.Amount = $scope.ingredients.m[i].amount;
            else {
                alert("Set an amount for each flavor");
                $scope.buttonDisabled = false;
                return;
            }
            
            params.push(ingredient);
        }

        // TODO: move $http.post call to recipeService
        var data = JSON.stringify({ 'name': $scope.recipeName, 'description': $scope.recipeDescription, 'ingredients': params });
        $http.post("/Flavor/AddRecipe/", data).
            success(function(results, status, headers, config) {
                alert("successfully added recipe");
                $scope.buttonDisabled = false;

                $scope.recipeName = "";
                $scope.recipeDescription = "";
                $scope.ingredients.m = [new Model()];
            }).
            error(function(results, status, headers, config) {
                alert("Error: " + results);
                $scope.buttonDisabled = false;
            });
    };
});

function Model(json) {
    json = json || {};
    this.selected_flavor = json.selected_flavor || null;
    this.amount = json.amount || null;
}