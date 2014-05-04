app.controller("addRecipeController", function ($scope, $modal, $http, recipeService, flavorDropdownModel, modalService) {
    $scope.flavors = [];
    $scope.selects = {
        m: [new flavorDropdownModel()]  
    };

    init();
    
    function init() {

        recipeService.getAllFlavors(function(data) {
            $scope.flavors = data;
        }, function(data) {
            alert("Error: " + data);
        });

        //recipeService.GetAllFlavorsByBrand(1, function(data) {
        //    // success callback
        //    $scope.flavors = data;
        //}, function(data) {
        //    // error callback
        //    alert("Error: " + data);
        //});
    }


    $scope.add = function () {
        $scope.selects.m.push(new flavorDropdownModel());
    };

    $scope.remove = function (select) {
        var index = $scope.selects.m.indexOf(select);
        if (index >= 0)
            $scope.selects.m.splice(index, 1);
    };

    $scope.addNewFlavor = function() {

        modalService.showModal({
            templateUrl: 'app/views/add-flavor.html',
            controller: 'addFlavorController',
            resolve: {
                flavors: function () {
                    return $scope.flavors;
                }
            }
        }).then (function (result) {
            
            // add the flavor to the correct array in the selects
            for (var i = 0; i < $scope.flavors.length; i++) {
                if ($scope.flavors[i].FlavorBrandId == result.result.FlavorBrandId) {
                    if ($scope.flavors[i].hasOwnProperty("Flavors"))
                        $scope.flavors[i].Flavors.push(result.result);
                }
            }

        }, function(result) {
            
        });

        

        //var modalInstance = $modal.open({
        //    templateUrl: 'app/views/add-flavor.html',
        //    controller: 'addFlavorController',
        //    resolve: {
        //        flavors: function() {
        //            return $scope.flavors;
        //        }
        //    }
        //});

        //modalInstance.result.then(function(flavor) {
        //    alert(flavor);
        //    //$scope.flavors = flavor;
        //});
    };
    
    // Sets the flavors dropdown to the correct brand of flavors
    // TODO: this code is here and in searchRecipesByIngredientController.js. Move dup code
    $scope.updateFlavorDropdown = function (op) {
        angular.forEach($scope.flavors, function (item) {
            if (item.FlavorBrandId == op.FlavorBrandId) {
                var index = $scope.selects.m.indexOf(op);

                if (index != -1)
                    $scope.selects.m[index].flavors = item.Flavors;
            }
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
        var len = $scope.selects.m.length;
        for (var i = 0; i < len; i++) {
            var ingredient = {};

            if ($scope.selects.m[i].hasOwnProperty("FlavorId"))
                ingredient.FlavorId = $scope.selects.m[i].FlavorId;
            else {
                alert("Select a flavor");
                $scope.buttonDisabled = false;
                return;
            }

            if ($scope.selects.m[i].amount != null)
                ingredient.Amount = $scope.selects.m[i].amount;
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
                $scope.ingredients.m = [new flavorDropdownModel()];
            }).
            error(function(results, status, headers, config) {
                alert("Error: " + results);
                $scope.buttonDisabled = false;
            });
    };
});
