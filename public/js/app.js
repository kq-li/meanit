var app = angular.module('meanit', ['ui.router']);

app.factory('posts', [
  '$http',
  function ($http) {
    var service = {
      posts: []
    };

    service.getAllPosts = function () {
      return $http.get('/posts').success(function (data) {
        angular.copy(data, service.posts);
      });
    };

    service.createPost = function (post) {
      return $http.post('/posts', post).success(function (data) {
        service.posts.push(data);
      });
    };

    service.upvotePost = function (post) {
      return $http.put('/posts/' + post._id + '/upvote').success(function (data) {
        post.upvotes++;
      });
    };

    service.getPost = function (id) {
      return $http.get('/posts/' + id).then(function (res) {
        return res.data;
      });
    };

    service.addComment = function (id, comment) {
      return $http.post('/posts/' + id + '/comments', comment);
    };      

    service.upvoteComment = function (id, comment) {
      return $http
        .put('/posts/' + id + '/comments/' + comment._id + '/upvote')
        .success(function (data) {
          comment.upvotes++;
        });
    };
    
    return service;
  }
]);

app.controller('MainCtrl', [
  '$scope',
  'posts',
  function ($scope, posts) {
    $scope.posts = posts.posts;

    $scope.addPost = function () {
      if (!$scope.title || $scope.title === '')
        return;

      posts.createPost({
        title: $scope.title,
        link: $scope.link
      });
      
      $scope.title = '';
      $scope.link = '';
    };

    $scope.upvote = function (post) {
      posts.upvotePost(post);
    };
  }
]);

app.controller('PostsCtrl', [
  '$scope',
  'posts',
  'post',
  function ($scope, posts, post) {
    $scope.post = post;
    
    $scope.addComment = function () {
      posts.addComment(post._id, {
        author: $scope.author,
        body: $scope.body
      }).success(function (comment) {
        $scope.post.comments.push(comment);
      });
      
      $scope.author = '';
      $scope.body = '';
    };
    
    $scope.upvote = function (comment) {
      posts.upvoteComment(post._id, comment);
    };
  }
]);

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/views/home.html',
        controller: 'MainCtrl',
        resolve: {
          postPromise: [
            'posts',
            function (posts) {
              return posts.getAllPosts();
            }
          ]
        }                      
      })
      .state('posts', {
        url: '/posts/{id}',
        templateUrl: '/views/posts.html',
        controller: 'PostsCtrl',
        resolve: {
          post: [
            '$stateParams',
            'posts',
            function ($stateParams, posts) {
              return posts.getPost($stateParams.id);
            }
          ]
        }
      });
    
    $urlRouterProvider.otherwise('home');
  }
]);
