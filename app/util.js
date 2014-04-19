﻿app.value("transpose", function(items) {

    var results = { headers: [], values: [] };
    angular.forEach(items, function(value, key) {

        results.headers.push(key);
        angular.forEach(value, function(inner, index) {
            results.values[index] = results.values[index] || [];
            results.values[index].push(inner);
        });
    });

    return results;
});

// TODO: convert this to app.value()
function ShowRecipeModalDialog(recipe) {

    // Get list of recipe ingredients
    var params = { recipeId: recipe.Id };
    $http.post("/Flavor/GetIngredients", params).success(function(data) {

        var ingredients = data;

        var modalInstance = $modal.open({
            templateUrl: 'app/views/viewRecipe.html',
            controller: 'viewRecipeController',
            resolve: {
                recipeObject: function() {
                    return recipe;
                },

                recipeIngredients: function() {
                    return ingredients;
                }
            }
        });

        modalInstance.result.then(function () {
            
        });
    });
}