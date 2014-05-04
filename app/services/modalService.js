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

    // http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: 'modal.html'
    };

    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        headerText: 'Proceed?',
        bodyText: 'Perform this action?'
    };

    this.showModal = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = 'static';
        return this.show(customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
        //Create temp objects to work with since we're in a singleton service
        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = function($scope, $modalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function(result) {
                    $modalInstance.close(result);
                };
                $scope.modalOptions.close = function(result) {
                    $modalInstance.dismiss('cancel');
                };
            };
        }

        return $modal.open(tempModalDefaults).result;
    };

});