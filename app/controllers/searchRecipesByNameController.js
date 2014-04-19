app.controller('searchRecipesByNameController', function ($scope, $modal, $http, $filter, Auth, modalService, recipeService) {
    $scope.recipeInput = "";
    $scope.recipes = [];
    $scope.FlavorBrands = [];
    
    // paging
    $scope.currentPage = 1;
    $scope.pageSize = 20;
    $scope.filteredRecipesCount = 0;

    init();
    
    function init() {
        recipeService.getAllFlavorBrands(function (data) {
            // success callback
            $scope.FlavorBrands = data;
        }, function (data) {
            // error callback
            alert("Error: " + data);
        });

        getRecipes();

        $scope.$watch("recipeInput", function(filterInput) {
            filterRecipes(filterInput);
        });
    }

    function filterRecipes(filterInput) {
        $scope.filteredRecipes = $filter("recipeNameFilter")($scope.recipes, filterInput);
        $scope.filteredRecipesCount = $scope.filteredRecipes.length;
    }

    $scope.showRecipeModal = function(recipe) {
        modalService.showRecipe(recipe, "viewRecipe", "viewRecipeController");
    };
    
    function getRecipes() {

        recipeService.getAllRecipes(function(data) {
            // success callback
            $scope.recipes = data;
            $scope.filteredRecipes = data;
        }, function(data) {
            // error callback
            alert("Error: " + data);
        });
    }

    $scope.isAdmin = function() {
        return Auth.isAdmin();
    };
});