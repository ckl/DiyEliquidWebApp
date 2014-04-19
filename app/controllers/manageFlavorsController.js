app.controller("manageFlavorsController", function($scope, recipeService, transpose, arrayContains) {

    $scope.flavorData = {};
    $scope.flavorsTransposed = {};

    var addList = [];
    var remList = [];

    $scope.buttonDisabled = false;

    init();
    
    function init() {
        recipeService.getAllFlavors(function(data) {
            // success callback
            $scope.flavorData = data;
            $scope.flavorsTransposed = transpose(data);
        }, function(data) {
            // error callback
            alert("Error: " + data);
        });
    }

    $scope.toggleCheckbox = function(item) {

        if (item.IsOwned) {
            if ( ! arrayContains(remList, item.Id))
                remList.push(item.Id);
            
            // just added it to the RemoveList. If it's in the AddList, take it out
            if (arrayContains(addList, item.Id)) {
                var index = addList.indexOf(item.Id);
                addList.splice(index, 1);
            }
            item.IsOwned = false;
        }
        else {
            if (! arrayContains(addList, item.Id)) {
                addList.push(item.Id);
            }

            // we just (possibly) added it to AddList. If it's in RemoveList, take it out
            if ( arrayContains(remList, item.Id)) {
                var index = remList.indexOf(item.Id);
                remList.splice(index, 1);
            }
            item.IsOwned = true;
        }

    };

    $scope.updateFlavors = function() {
        recipeService.updateFlavors(addList, remList, function (data) {
            // success callback
            alert("success");
        }, function(data) {
            // error callback
            alert("Error: " + data);
        });
    };
});