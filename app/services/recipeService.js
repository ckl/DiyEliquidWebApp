﻿app.service("recipeService", function($http, Auth) {

    var flavors = [];
    var recipeList = [];
    var flavorBrands = [];
    var recipeFlavors = {};
    var allFlavorsDict = {};
    var usersFlavors = [];
    var currentFlavorBrand = 1;

    var usersFlavorsDirty = true;

    this.getAllRecipes = function(success, error) {
        if (recipeList.length == 0) {
            $http.post("/Flavor/SearchRecipe/").success(function(data, status, headers, config) {
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

    this.getAllFlavors = function(success, error) {
        if (allFlavorsDict.length == undefined || allFlavorsDict.length == 0) {
            $http.post("/Flavor/GetAllFlavors").success(function(data, status, headers, config) {
                allFlavorsDict = data;
                success(data);
            }).error(function(data, status) {
                error(data);
            });
        }
        else {
            success(allFlavorsDict);
        }
    };

    this.GetAllFlavorsByBrand = function(flavorBrandId, success, error) {
        if (currentFlavorBrand != flavorBrandId || flavors.length == 0) {
            $http.post("/Flavor/GetAllFlavorsByBrand", { flavorBrandId: flavorBrandId }).success(function (data, status, headers, config) {
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

    this.getAllFlavorsForUser = function(success, error) {
        if (usersFlavors.length == 0 || usersFlavorsDirty || ! Auth.isSessionValid()) {
            $http.post("/Flavor/GetFlavorsForUser").success(function (data, status, headers, config) {
                usersFlavors = data;
                usersFlavorsDirty = false;
                success(data);
            }).error(function(data, status) {
                error(data);
            });
        }
        else {
            success(usersFlavors);
        }
    };

    this.updateFlavors = function(addList, remList, success, error) {
        $http.post("/Flavor/UpdateUserFlavor", { addList: addList, remList: remList }).success(function(data, status, headers, config) {
            usersFlavorsDirty = true;
            success(data);
        }).error(function (data, status) {
            error(data);
        });
    };

    this.getAllFlavorBrands = function(success, error) {
        if (flavorBrands.length == 0) {
            $http.post("/Flavor/GetAll").success(function (data, status, headers, config) {
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
        $http.post("/Flavor/GetRecipe", { id: recipeId }).success(function(data, status, headers, config) {
            success(data);
        }).error(function(data, status, headers, config) {
            error(data);
        });
    };

    this.getRecipeIngredients = function(recipeId, success, error) {
        if (!(recipeId in recipeFlavors)) {
            $http.post("/Flavor/GetIngredients", { recipeId: recipeId }).success(function(data, status, headers, config) {
                recipeFlavors[recipeId] = data;
                success(data);
            }).error(function(data, status, headers, config) {
                error(data);
            });
        } else {
            success(recipeFlavors[recipeId]);
        }
    };

    this.updateRecipe = function (recipeObj, flavorList, success, error) {
        $http.post("/Flavor/UpdateRecipe", { recipe: recipeObj, flavors: flavorList }).success(function (data, status, headers, config) {
            usersFlavorsDirty = true;
            success(data);
        }).error(function (data, status) {
            error(data);
        });
    };


    this.deleteRecipe = function (recipeId, success, error) {
        $http.post("/Flavor/DeleteRecipe", { recipeId: recipeId }).success(function(data, status, headers, config) {
            success(data);
        }).error(function (data, status, headers, config) {
            error(data);
        });
    };
});