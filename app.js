;(function(window) {
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    angular.module('app', ['ngRoute'])
    .factory('googleAuth', function() {
        return function() {
            return {
                onSignIn: function onSignIn(googleUser) {
                   // Useful data for your client-side scripts:
                   var profile = googleUser.getBasicProfile();
                   console.log("ID: " + profile.getId()); // Don't send this directly to your server!
                   console.log('Full Name: ' + profile.getName());
                   console.log('Given Name: ' + profile.getGivenName());
                   console.log('Family Name: ' + profile.getFamilyName());
                   console.log("Image URL: " + profile.getImageUrl());
                   console.log("Email: " + profile.getEmail());

                   // The ID token you need to pass to your backend:
                   var id_token = googleUser.getAuthResponse().id_token;
                   console.log("ID Token: " + id_token);
                 }
            }
        }
    })
    .config(function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'login.html',
            controller: 'LoginController',
            controllerAs: 'login'
        })
        .when('/tasks', {
            templateUrl: 'main.html'
        })
    })
    .controller('LoginController', function($scope, $location, googleAuth) {
        var self = this;
        self.login = function() {
            $location.path('/tasks');
        }
        self.onSignIn = googleAuth.onSignIn;
        window.onSignIn = function(googleUser) {
            alert('ahhh');
        };
    })
    .controller('TaskController', function($scope) {
        var self = this;
        self.tasks = [
            {name: 'test', checked: false},
            {name: 'fake', checked: false},
            {name: 'fake', checked: true}
        ];

        self.addTask = function(taskTitle) {
            self.tasks.push({
                name: taskTitle,
                checked: false
            });
            self.saveTasks();
        };

        self.removeTask = function(task) {
            self.tasks.splice(self.tasks.indexOf(task), 1);
            self.saveTasks();
        };

        self.saveTasks = function() {
            var tasksJSON = JSON.stringify(self.tasks);
            document.cookie = 'tasks='+tasksJSON+'; expires=Fri, 3 Aug, 2035, 20:47:11 UTC; path=/';
        }

        self.loadTasks = function() {
            var tasksJSON = getCookie('tasks');
            if(tasksJSON != undefined) {
                self.tasks = JSON.parse(tasksJSON);
            }
        }

        self.loadTasks();

        self.saveTasks();
    })
    .directive('tasklist', function() {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'tasklist.html',
            controller: 'TaskController as tasks'
        };
    })
    .directive('task', function() {
        return {
            restrict: 'E',
            transclude: 'true',
            require: '^tasklist',
            templateUrl: 'task.html'
        };
    })
    .directive('googlelogin', function() {
        return {
            restrict: 'E',
            template: '<div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>',
            link: function(scope, element) {
                var script = angular.element('<script/>');
                script.attr({
                    src: 'https://apis.google.com/js/platform.js',
                    type: 'text/javascript'
                });
                element.append(script);
            }
        };
    })
})(window);
