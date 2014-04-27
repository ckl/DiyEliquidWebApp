app.factory("flavorDropdownFactory", function($http, $cookieStore, flavorDropdownModel) {

    var selects = {
        m: [new flavorDropdownModel()]
    };

    init();
    
    function init() {
        
    }

    return {
        getFlavorDropdown: function (flavorsByBrand, success, error) {
            selects.m = [];

            angular.forEach(flavorsByBrand, function(brand) {
                angular.forEach(brand.Flavors, function(flavor) {
                    var op = {
                        FlavorBrandId: brand.FlavorBrandId,
                        FlavorId: flavor.Id
                    };

                    selects.m.push(op);
                });
            });

            return selects;
        },
        
        setFlavorDropdownByBrand: function(flavorBrandSelect, success, error) {
            
        },
        
        refreshSelects: function(scopeSelects, success, error) {
            selects = scopeSelects;
        },
        
        getSelects: function() {
            return selects;
        }

    };

});
