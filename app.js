var app = angular.module('meanit', ['ui.router']);

app.factory('posts',
            [function () {
              var o = {
                posts: [{title: 'post 1', upvotes: 5},
                        {title: 'post 2', upvotes: 12},
                        {title: 'post 3', upvotes: 9},
                        {title: 'post 4', upvotes: 1},
                        {title: 'post 5', upvotes: 3}]
              };

              return o;
            }]);

app.controller('MainCtrl',
               ['$scope',
                'posts',
                function ($scope, posts) {
                  $scope.test = 'Hello World!';
                  $scope.posts = posts.posts;

                  $scope.addPost = function () {
                    $scope.posts.push({
                      title: $scope.title,
                      link: $scope.link,
                      upvotes: 0,
                      comments: [{
                        author: 'Ted',
                        body: 'I love it',
                        upvotes: 0
                      }, {
                        author: 'Alice',
                        body: 'Amazing!',
                        upvotes: 0
                      }]
                    });
                    
                    $scope.title = '';
                    $scope.link = '';
                  };

                  $scope.upvote = function (post) {
                    post.upvotes++;
                  };
                }]);

app.controller('PostsCtrl',
               ['$scope',
                '$stateParams',
                'posts',
                function ($scope, $stateParams, posts) {
                  $scope.post = posts.posts[$stateParams.id];
                }]);

app.config(['$stateProvider',
            '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {
              $stateProvider
                .state('home', {
                  url: '/home',
                  templateUrl: '/home.html',
                  controller: 'MainCtrl'
                })
                .state('posts', {
                  url: '/posts/{id}',
                  templateUrl: '/posts.html',
                  controller: 'PostsCtrl'
                });

              $urlRouterProvider.otherwise('home');
            }]);


