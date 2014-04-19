app.factory("Auth", function ($http, $cookieStore) {

    var userRoles = {
        anonymous: 'anonymous',
        user: 'user',
        admin: 'admin'
    };

    var currentUser = $cookieStore.get("user") || { username: "", roles: [userRoles.anonymous] };

    function changeUser(user, roles) {
        currentUser = { username: user.username, roles: roles };
        $cookieStore.put("user", currentUser);
    }

    return {
        register: function(user, success, error) {
            $http.post("/Account/Register", user).success(function(data, status, headers, config) {
                changeUser(user, [userRoles.user]);
                success();
                
            }).error(function(data, status, headers, config) {
                error(data);
            });
        },

        login: function(user, success, error) {
            $http.post("/Account/Login", user).success(function(roles, status, headers, config) {
                changeUser(user, roles);
                success();
                }).error(function(data, status, headers, config) {
                    error(data);
                });
        },

        isLoggedIn: function() {
            var retval = false;
            angular.forEach(currentUser.roles, function(role) {
                if (role.toLowerCase() == userRoles.user || role.toLowerCase() == userRoles.admin)
                    retval = true;
            });
            return retval;
        },
        
        isAdmin: function() {
            var retval = false;
            angular.forEach(currentUser.roles, function(role) {
                if (role.toLowerCase() == userRoles.admin)
                    retval = true;
            });

            return retval;
        },

        logout: function(success, error) {
            $http.post("/Account/Logout").success(function () {
                changeUser({username: ''}, [userRoles.anonymous]);
                success();
            }).error(error);
        },
        
        getUser: function () {
            return currentUser;
        }
    };

});