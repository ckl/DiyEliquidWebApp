app.service("modalService", function ($modal, recipeService) {
    
    this.showRecipe = function(recipe, template, ctrl) {

        // Get list of recipe ingredients
        recipeService.getRecipeIngredients(recipe.Id,
            function(data) {
                // Success callback
                var ingredients = data;

                var modalInstance = $modal.open({
                    templateUrl: 'app/views/' + template + ".html",
                    controller: ctrl,
                    resolve: {
                        recipeObject: function() {
                            return recipe;
                        },

                        recipeIngredients: function() {
                            return ingredients;
                        }
                    }
                });

                modalInstance.result.then(function() {
                });
            },
            function(data) {
                // error callback
                alert("Error: " + data);
            }
        );
    };
});