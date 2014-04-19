app.filter("recipeNameFilter", function() {
    return function (recipes, filterValue) {
        if (!filterValue) return recipes;

        var matches = [];
        filterValue = filterValue.toLowerCase();
        
        for (var i = 0; i < recipes.length; i++) {
            var recipe = recipes[i];

            if (recipe.Name.toLowerCase().indexOf(filterValue) > -1)
                matches.push(recipe);
        }

        return matches;
    };
});