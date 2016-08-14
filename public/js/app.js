var app = angular.module('meanit', ['ui.router']);

var x;

app.factory('posts', [
  '$http',
  'auth',
  function ($http, auth) {
    var postServ = {
      posts: []
    };
    
    postServ.getAllPosts = function () {
      return $http.get('/api/posts', {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).success(function (data) {
        angular.copy(data, postServ.posts);
      });
    };

    postServ.createPost = function (post) {
      return $http.post('/api/posts', post, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).success(function (data) {
        postServ.posts.push(data);
      });
    };

    postServ.upvotePost = function (post) {
      var outer = this;
      
      return $http.put('/api/posts/' + post._id + '/upvote', null, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).success(function (data) {
        outer.updatePost(post, data);
      });
    };

    postServ.downvotePost = function (post) {
      var outer = this;
      
      return $http.put('/api/posts/' + post._id + '/downvote', null, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).success(function (data) {
        outer.updatePost(post, data);
      });
    };

    postServ.hasUpvotedPost = function (post) {
      return post.hasUpvotedPost;
    };

    postServ.hasDownvotedPost = function (post) {
      return post.hasDownvotedPost;
    };
    
    postServ.getPost = function (id) {
      return $http.get('/api/posts/' + id, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        return res.data;
      });
    };

    postServ.sendPost = function (post, newPost) {
      var outer = this;
      
      return $http.post('/api/posts/' + post._id + '/edit', newPost, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).success(function (data) {
        outer.updatePost(post, data);
      });
    };
    
    postServ.updatePost = function (post, data) {
      post.rating = data.rating;
      post.hasUpvotedPost = data.hasUpvotedPost;
      post.hasDownvotedPost = data.hasDownvotedPost;
      post.body = data.body;
    };

    postServ.addComment = function (id, comment) {
      return $http.post('/api/posts/' + id + '/comments', comment, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      });
    };      

    postServ.upvoteComment = function (id, comment) {
      var outer = this;
      
      return $http
        .put('/api/posts/' + id + '/comments/' + comment._id + '/upvote', null, {
          headers: {
            Authorization: 'Bearer ' + auth.getToken()
          }
        })
        .success(function (data) {
          outer.updateComment(comment, data);
        });
    };

    postServ.downvoteComment = function (id, comment) {
      var outer = this;
      
      return $http
        .put('/api/posts/' + id + '/comments/' + comment._id + '/downvote', null, {
          headers: {
            Authorization: 'Bearer ' + auth.getToken()
          }
        })
        .success(function (data) {
          outer.updateComment(comment, data);
        });
    };

    postServ.hasUpvotedComment = function (comment) {
      return comment.hasUpvotedComment;
    };

    postServ.hasDownvotedComment = function (comment) {
      return comment.hasDownvotedComment;
    };

    postServ.sendComment = function (comment, newComment) {
      var outer = this;
      
      return $http
        .post('/api/posts/' + comment.post + '/comments/' + comment._id + '/edit', newComment, {
          headers: {
            Authorization: 'Bearer ' + auth.getToken()
          }
        })
        .success(function (data) {
          outer.updateComment(comment, data);
        });
    };
    
    postServ.updateComment = function (comment, data) {
      comment.rating = data.rating;
      comment.hasUpvotedComment = data.hasUpvotedComment;
      comment.hasDownvotedComment = data.hasDownvotedComment;
      comment.body = data.body;
    };

    return postServ;
  }
]);

app.factory('users', [
  '$http',
  'auth',
  function ($http, auth) {
    var userServ = {
      users: []
    };

    userServ.getAllUsers = function () {
      return $http.get('/api/users/').success(function (data) {
        angular.copy(data, userServ.users);
      });
    };

    userServ.getUser = function (name) {
      return $http.get('/api/users/' + name).then(function (res) {
        return res.data;
      });
    };

    return userServ;
  }
]);

app.factory('auth', [
  '$http',
  '$window',
  function ($http, $window) {
    var authServ = {};
    
    authServ.saveToken = function (token) {
      $window.localStorage['meanit-token'] = token;
    };

    authServ.getToken = function () {
      return $window.localStorage['meanit-token'];
    };

    authServ.isLoggedIn = function () {
      var token = authServ.getToken();

      if (token) {
        try {
          var payload = JSON.parse($window.atob(token.split('.')[1]));
          var valid = payload.exp > Date.now() / 1000;

          if (valid) 
            return true;

          authServ.logout();
        } catch (e) {

        }
      }

      return false;
    };

    authServ.currentUser = function () {
      if (authServ.isLoggedIn()) {
        var token = authServ.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        return payload.username;
      }
    };

    authServ.register = function (user) {
      return $http.post('/api/register', user).success(function (data) {
        authServ.saveToken(data.token);
      });
    };

    authServ.login = function (user) {
      return $http.post('/api/login', user).success(function (data) {
        authServ.saveToken(data.token);
      });
    };
        
    authServ.logout = function () {
      $window.localStorage.removeItem('meanit-token');
      $window.location.reload(true);
    };
    
    return authServ;
  }
]);

app.controller('MainCtrl', [
  '$scope',
  'posts',
  'auth',
  function ($scope, posts, auth) {
    $scope.posts = posts.posts;
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.hasUpvotedPost = posts.hasUpvotedPost;
    $scope.hasDownvotedPost = posts.hasDownvotedPost;
    
    $scope.addPost = function () {
      if (!$scope.title || $scope.title === '')
        return;

      posts.createPost({
        title: $scope.title,
        link: $scope.link,
        body: $scope.body
      });
      
      $scope.title = '';
      $scope.link = '';
      $scope.body = '';
    };

    $scope.upvotePost = function (post) {
      posts.upvotePost(post);
    };

    $scope.downvotePost = function (post) {
      posts.downvotePost(post);
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
    $scope.currentUser = auth.currentUser;
    $scope.hasUpvotedComment = posts.hasUpvotedComment;
    $scope.hasDownvotedComment = posts.hasDownvotedComment;

    $scope.postForm = {
      isAuthor: $scope.currentUser() === $scope.post.author,
      isEditing: false,
      body: ''
    };

    $scope.commentForms = {};

    for (var i = 0; i < $scope.post.comments.length; i++)
      $scope.commentForms[$scope.post.comments[i]._id] = {
        isAuthor: $scope.currentUser() === $scope.post.comments[i].author,
        isEditing: false,
        body: ''
      };
    
    $scope.addComment = function () {
      posts.addComment(post._id, {
        body: $scope.body
      }).success(function (comment) {
        post.comments.push(comment);

        $scope.commentForms[comment._id] = {
          isAuthor: true,
          isEditing: false,
          body: ''
        };
      });
      
      $scope.body = '';
    };

    $scope.editPost = function () {
      $scope.setForm($scope.postForm, true, $scope.post.body);
    };

    $scope.sendPost = function () {
      posts.sendPost($scope.post, {
        body: $scope.postForm.body
      });
      
      $scope.setForm($scope.postForm, false, '');
    };
    
    $scope.upvoteComment = function (comment) {
      posts.upvoteComment(comment.post, comment);
    };

    $scope.downvoteComment = function (comment) {
      posts.downvoteComment(comment.post, comment);
    };

    $scope.editComment = function (comment) {
      $scope.setForm($scope.commentForms[comment._id], true, comment.body);
    };        
    
    $scope.sendComment = function (comment) {
      posts.sendComment(comment, {
        body: $scope.commentForms[comment._id].body
      });

      $scope.setForm($scope.commentForms[comment._id], false, '');
    };

    $scope.setForm = function (form, isEditing, body) {
      form.isEditing = isEditing;
      form.body = body;
    };
  }
]);

app.controller('UsersCtrl', [
  '$scope',
  'auth',
  'posts',
  'users',
  'user',
  function ($scope, auth, posts, users, user) {
    $scope.user = user;
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.hasUpvotedPost = posts.hasUpvotedPost;
    $scope.hasDownvotedPost = posts.hasDownvotedPost;
    $scope.hasUpvotedComment = posts.hasUpvotedComment;
    $scope.hasDownvotedComment = posts.hasDownvotedComment;

    $scope.upvotePost = function (post) {
      posts.upvotePost(post);
    };

    $scope.downvotePost = function (post) {
      posts.downvotePost(post);
    };
    
    $scope.upvoteComment = function (comment) {
      posts.upvoteComment(comment.post, comment);
    };

    $scope.downvoteComment = function (comment) {
      posts.downvoteComment(comment.post, comment);
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
  '$locationProvider',
  function ($stateProvider, $urlRouterProvider, $locationProvider) {
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
      .state('users', {
        url: '/users/{name}',
        templateUrl: '/views/users.html',
        controller: 'UsersCtrl',
        resolve: {
          user: [
            '$stateParams',
            'users',
            function ($stateParams, users) {
              return users.getUser($stateParams.name);
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

    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('home');
  }
]);
