;(function(window) {
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    angular.module('app', ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'login.html',
            controller: 'LoginController',
            controllerAs: 'login'
        })
        .when('/', {
            templateUrl: 'main.html'
        })
    })
	.factory('googleAuth', function($q) {
		var user, deffered;
		deffered = $q.defer();
		function onSuccess(googleUser) {
			user = googleUser;
			deffered.resolve();
		}
		return {
			renderButton: function(element) {
				gapi.signin2.render(element, {
					'scope': 'profile email',
					'width': 240,
					'height': 50,
					'longtitle': true,
					'theme': 'dark',
					'onsuccess': onSuccess,
					'onfailure': function(x) {
						deffered.reject(x);
					}
				});
				return deffered.promise;
			},
			isSignedIn: function() {
				return user != undefined;
			},
			getUser: function() {
				return user.getBasicProfile().getName();
			}
		};
	})
	.factory('myJson', function($q, $http) {
		return {
			storeData: function(data) {
				var deffered = $q.defer();
				$http.post('https://api.myjson.com/bins', data).then(function(data) {
					deffered.resolve(data);
				}, function(error) {
					deffered.reject(error);
				});
				return deffered.promise;
			},
			retrieveData: function(id) {
				var deffered = $q.defer();
				$http.get('https://api.myjson.com/bins/'+id).then(function(data) {
					deffered.resolve(data);
				}, function(error) {
					deffered.reject(error);
				});
				return deffered.promise;
			},
			updateData: function(id, data) {
				var deffered = $q.defer();
				$http.put('https://api.myjson.com/bins/'+id, data).then(function(data) {
					deffered.resolve(data);
				}, function(error) {
					deffered.reject(error);
				});
				return deffered.promise;
			}
		}
	})
    .controller('LoginController', function($scope, $location, googleAuth) {
        var self = this;

		googleAuth.renderButton('googlelogin').then(function() {
			$location.path('/tasks');
		});
    })
    .controller('TaskController', function($scope, googleAuth, myJson) {
        var self = this;
        self.tasks = [];

		if(googleAuth.isSignedIn()) {
			alert(googleAuth.getUser());
		}

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
			myJson.updateData('4lj7c', tasksJSON).then(function(d) {
			}, function(e) {
				console.log(e);
			});
            //document.cookie = 'tasks='+tasksJSON+'; expires=Fri, 3 Aug, 2035, 20:47:11 UTC; path=/';
        }

        self.loadTasks = function() {
            //var tasksJSON = getCookie('tasks');
			myJson.retrieveData('4lj7c').then(function(d) {
				console.log(d);
				self.tasks = d.data;
			}, function(e) {
				alert(e.status);
			});
            /*if(tasksJSON != undefined) {
                self.tasks = JSON.parse(tasksJSON);
            }*/
        }

        self.loadTasks();

		setInterval(self.loadTasks, 1000);
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
    /*.directive('googlelogin', function() {
        return {
            restrict: 'E',
            template: '<a class="g-signin2" data-onsuccess="console.log" data-theme="dark"></a>',
            link: function(scope, element) {
                var script = angular.element('<script/>');
                script.attr({
                    src: 'https://apis.google.com/js/platform.js?onload=login.renderButton',
                    type: 'text/javascript'
                });
                element.append(script);
            }
        };
    })*/
})(window);
