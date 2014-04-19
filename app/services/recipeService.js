﻿app.service("recipeService", function($http) {

    var flavors = [];
    var recipeList = [];
    var flavorBrands = [];
    var recipeFlavors = {};
    var currentFlavorBrand = 1;

    this.getAllRecipes = function(success, error) {
        if (recipeList.length == 0) {
            $http.post("/FlavorBrand/SearchRecipe/").success(function(data, status, headers, config) {
                recipeList = data;
                success(recipeList);
            }).error(function (data, status, headers, config) {
                error(data);
            });
        }
        else
            success(recipeList);
    };

    this.refreshRecipes = function(success, error) {
        recipeList = [];
        getAllRecipes(success, error);
    };

    this.getAllFlavors = function(flavorBrandId, success, error) {
        if (currentFlavorBrand != flavorBrandId || flavors.length == 0) {
            $http.post("/FlavorBrand/GetAllFlavors", { flavorBrandId: flavorBrandId }).success(function (data, status, headers, config) {
                flavors = data;
                currentFlavorBrand = flavorBrandId;
                success(data);
            }).error(function(data, status, headers, config) {
                error(data);
            });
        }
        else {
            success(flavors);
        }
    };

    this.getAllFlavorBrands = function(success, error) {
        if (flavorBrands.length == 0) {
            $http.post("/FlavorBrand/GetAll").success(function (data, status, headers, config) {
                flavorBrands = data;
                success(data);
            }).error(function(data, status, headers, config) {
                error(data);
            });
        } else {
            success(flavorBrands);
        }
    };

    this.getRecipe = function(recipeId, success, error) {
        $http.post("/FlavorBrand/GetRecipe", { id: recipeId }).success(function(data, status, headers, config) {
            success(data);
        }).error(function(data, status, headers, config) {
            error(data);
        });
    };

    this.getRecipeIngredients = function(recipeId, success, error) {
        if (!(recipeId in recipeFlavors)) {
            $http.post("/FlavorBrand/GetIngredients", { recipeId: recipeId }).success(function(data, status, headers, config) {
                recipeFlavors[recipeId] = data;
                success(data);
            }).error(function(data, status, headers, config) {
                error(data);
            });
        } else {
            success(recipeFlavors[recipeId]);
        }
    };

    this.updateRecipe = function(recipe, success, error) {
        $http.post("/FlavorBrand/UpdateRecipe", recipe).success(function(data, status, headers, config) {
            success(data);
        }).error(function(data, status, headers, config) {
            error(data);
        });
    };

    this.deleteRecipe = function (recipeId, success, error) {
        $http.post("/FlavorBrand/DeleteRecipe", { recipeId: recipeId }).success(function(data, status, headers, config) {
            success(data);
        }).error(function (data, status, headers, config) {
            error(data);
        });
    };
});