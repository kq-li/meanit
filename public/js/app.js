var app = angular.module('meanit', ['ui.router']);

app.factory('posts',
            [function () {
              var o = {
                posts: [{title: 'post 1', upvotes: 5, comments: []},
                        {title: 'post 2', upvotes: 12, comments: []},
                        {title: 'post 3', upvotes: 9, comments: []},
                        {title: 'post 4', upvotes: 1, comments: []},
                        {title: 'post 5', upvotes: 3, comments: []}]
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

                  $scope.addComment = function () {
                    $scope.post.comments.push({
                      author: $scope.author,
                      body: $scope.body,
                      upvotes: 0
                    });

                    $scope.author = '';
                    $scope.body = '';
                  };
                  
                  $scope.upvote = function (comment) {
                    comment.upvotes++;
                  };
                }]);

app.config(['$stateProvider',
            '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {
              $stateProvider
                .state('home', {
                  url: '/home',
                  templateUrl: '/views/home.html',
                  controller: 'MainCtrl'
                })
                .state('posts', {
                  url: '/posts/{id}',
                  templateUrl: '/views/posts.html',
                  controller: 'PostsCtrl'
                });

              $urlRouterProvider.otherwise('home');
            }]);


