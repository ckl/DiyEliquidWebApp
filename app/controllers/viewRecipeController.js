'use strict';
app.controller('viewRecipeController', function ($scope, $modalInstance, recipeObject, recipeIngredients) {

    $scope.recipeObject = recipeObject;
    $scope.recipeIngredients = recipeIngredients;


    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };

});