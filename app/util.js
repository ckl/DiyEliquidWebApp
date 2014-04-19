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