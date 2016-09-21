;(function(window) {
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    angular.module('app', [])
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
})(window);
