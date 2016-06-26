var app = angular.module('meanit', []);

app.controller('MainCtrl',
               ['$scope',
                function ($scope) {
                  $scope.test = 'Hello World!';
                  $scope.posts = [{title: 'post 1', upvotes: 5},
                                  {title: 'post 2', upvotes: 12},
                                  {title: 'post 3', upvotes: 9},
                                  {title: 'post 4', upvotes: 1},
                                  {title: 'post 5', upvotes: 3}];

                  $scope.addPost = function () {
                    $scope.posts.push({title: $scope.title, upvotes: 0});
                    $scope.title = '';
                  };
                }]);
