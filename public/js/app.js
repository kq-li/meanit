var app = angular.module('meanit', ['ui.router']);

app.factory('posts', [
  '$http',
  'auth',
  function ($http, auth) {
    var service = {
      posts: []
    };

    service.getAllPosts = function () {
      return $http.get('/posts').success(function (data) {
        angular.copy(data, service.posts);
      });
    };

    service.createPost = function (post) {
      return $http.post('/posts', post, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).success(function (data) {
        service.posts.push(data);
      });
    };

    service.upvotePost = function (post) {
      return $http.put('/posts/' + post._id + '/upvote', null, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).success(function (data) {
        post.upvotes++;
      });
    };

    service.getPost = function (id) {
      return $http.get('/posts/' + id).then(function (res) {
        return res.data;
      });
    };

    service.addComment = function (id, comment) {
      return $http.post('/posts/' + id + '/comments', comment, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      });
    };      

    service.upvoteComment = function (id, comment) {
      return $http
        .put('/posts/' + id + '/comments/' + comment._id + '/upvote', null, {
          headers: {
            Authorization: 'Bearer ' + auth.getToken()
          }
        })
        .success(function (data) {
          comment.upvotes++;
        });
    };
    
    return service;
  }
]);

app.factory('auth', [
  '$http',
  '$window',
  function ($http, $window) {
    var auth = {};

    auth.saveToken = function (token) {
      $window.localStorage['meanit-token'] = token;
    };

    auth.getToken = function () {
      return $window.localStorage['meanit-token'];
    };

    auth.isLoggedIn = function () {
      var token = auth.getToken();

      if (token) {
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
      } 

      return false;
    };

    auth.currentUser = function () {
      if (auth.isLoggedIn()) {
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        return payload.username;
      }
    };

    auth.register = function (user) {
      return $http.post('/register', user).success(function (data) {
        auth.saveToken(data.token);
      });
    };

    auth.login = function (user) {
      return $http.post('/login', user).success(function (data) {
        auth.saveToken(data.token);
      });
    };
        
    auth.logout = function () {
      $window.localStorage.removeItem('meanit-token');
    };
    
    return auth;
  }
]);

app.controller('MainCtrl', [
  '$scope',
  'posts',
  'auth',
  function ($scope, posts, auth) {
    $scope.posts = posts.posts;
    $scope.isLoggedIn = auth.isLoggedIn;

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
  'auth',
  function ($scope, posts, post, auth) {
    $scope.post = post;
    $scope.isLoggedIn = auth.isLoggedIn;
    
    $scope.addComment = function () {
      posts.addComment(post._id, {
        body: $scope.body
      }).success(function (comment) {
        $scope.post.comments.push(comment);
      });
      
      $scope.body = '';
    };
    
    $scope.upvote = function (comment) {
      posts.upvoteComment(post._id, comment);
    };
  }
]);

app.controller('AuthCtrl', [
  '$scope',
  '$state',
  'auth',
  function ($scope, $state, auth) {
    $scope.user = {};

    $scope.register = function () {
      auth.register($scope.user).error(function (error) {
        $scope.error = error;
      }).then(function () {
        $state.go('home');
      });
    };

    $scope.login = function () {
      auth.login($scope.user).error(function (error) {
        $scope.error = error;
      }).then(function () {
        $state.go('home');
      });
    };
  }
]);      

app.controller('NavCtrl', [
  '$scope',
  'auth',
  function ($scope, auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logout = auth.logout;
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
      })
      .state('register', {
        url: '/register',
        templateUrl: '/views/register.html',
        controller: 'AuthCtrl',
        onEnter: [
          '$state',
          'auth',
          function ($state, auth) {
            if (auth.isLoggedIn())
              $state.go('home')
          }
        ]
      })
      .state('login', {
        url: '/login',
        templateUrl: '/views/login.html',
        controller: 'AuthCtrl',
        onEnter: [
          '$state',
          'auth',
          function ($state, auth) {
            if (auth.isLoggedIn())
              $state.go('home')
          }
        ]
      });
    
    $urlRouterProvider.otherwise('home');
  }
]);
