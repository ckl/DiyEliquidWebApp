app.factory("flavorDropdownFactory", function($http, $cookieStore) {

    var selects = {
        m: [new Model()]
    };

    return {
        getDropdownFromFlavors: function (flavorsByBrand, success, error) {
            
        },
        
        setFlavorDropdownByBrand: function(flavorBrandSelect, success, error) {
            
        },
        
        refreshSelects: function(scopeSelects, success, error) {
            selects = scopeSelects;
        }

    };

});

function Model(json) {
    json = json || {};
    this.flavors = json.flavors || [];
    this.selected_brand = json.selected_brand || null;
    this.selected_flavor = json.selected_flavor || null;
}