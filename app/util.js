app.value("transpose", function(items) {

    //var results = { headers: [], values: [] };
    //angular.forEach(items, function(value, key) {

    //    results.headers.push(key);
    //    angular.forEach(value, function(inner, index) {
    //        results.values[index] = results.values[index] || [];
    //        results.values[index].push(inner);
    //    });
    //});

    // pad each items.Flavor array because this transpose doesn't work for jagged arrays
    var longest = 0;
    angular.forEach(items, function(value, key) {
        var size = value.Flavors.length;
        if (size > longest)
            longest = size;
    });
    
    // pad each items.Flavor array with empty objects to the longest
    angular.forEach(items, function(value, key) {
        var len = value.Flavors.length;
        for (var i = len; i < longest; i++) {
            value.Flavors.push({});
        }
    });

    var results = { headers: [], values: [] };
    angular.forEach(items, function(value, key) {

        results.headers.push({ FlavorBrandId: value.FlavorBrandId, FlavorBrandName: value.FlavorBrandName, ShortName: value.ShortName, Website: value.Website });
        angular.forEach(value.Flavors, function(inner, index) {
            results.values[index] = results.values[index] || [];
            results.values[index].push(inner);
        });
    });

    return results;
});

app.value("arrayContains", function(array, value) {
    return (array.indexOf(value) != -1);
});

// TODO: add flavor/flavorbrand dropdown model here
app.value("flavorDropdownModel", function(json) {
    json = json || {};
    this.flavors = json.flavors || [];
    this.selected_brand = json.selected_brand || [];
    this.selected_flavor = json.selected_flavor || [];
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