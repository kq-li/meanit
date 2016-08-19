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
      var url = '/api/posts';
      
      return $http.get(url, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        angular.copy(res.data, postServ.posts);
        return res;
      });
    };

    postServ.createPost = function (post) {
      var url = '/api/posts';
      
      return $http.post(url, post, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        postServ.posts.push(res.data);
        return res;
      });
    };

    postServ.getPost = function (id) {
      var url = '/api/posts/' + id;
      
      return $http.get(url, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        return res;
      });
    };

    postServ.upvotePost = function (post) {
      var url = '/api/posts/' + post._id + '/upvote';
      
      return $http.put(url, null, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        postServ.refresh(post, res.data);
        return res;
      });
    };

    postServ.downvotePost = function (post) {
      var url = '/api/posts/' + post._id + '/downvote';
      return $http.put(url, null, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        postServ.refresh(post, res.data);
        return res;
      });
    };
    
    postServ.updatePost = function (post, newPost) {
      var url = '/api/posts/' + post._id + '/edit';
      return $http.post(url, newPost, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        postServ.refresh(post, res.data);
        return res;
      });
    };

    postServ.deletePost = function (post) {
      var url = '/api/posts/' + post._id + '/delete';
      return $http.put(url, null, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        postServ.posts.splice(postServ.posts.indexOf(res.data));
        return res;
      });
    };
        
    postServ.addComment = function (post, comment) {
      var url = '/api/posts/' + post._id + '/comments';
      
      return $http.post(url, comment, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        post.comments.push(res.data);
        return res;
      });
    };

    postServ.upvoteComment = function (comment) {
      var url = '/api/posts/' + comment.post + '/comments/' + comment._id + '/upvote';
      
      return $http.put(url, null, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        postServ.refresh(comment, res.data);
        return res;
      });
    };

    postServ.downvoteComment = function (comment) {
      var url = '/api/posts/' + comment.post + '/comments/' + comment._id + '/downvote';
      
      return $http.put(url, null, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        postServ.refresh(comment, res.data);
        return res;
      });
    };

    postServ.updateComment = function (comment, newComment) {
      var url = '/api/posts/' + comment.post + '/comments/' + comment._id + '/edit';
      
      return $http.post(url, newComment, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        postServ.refresh(comment, res.data);
        return res;
      });
    };
    
    postServ.deleteComment = function (comment) {
      var url = '/api/posts/' + comment.post + '/comments/' + comment._id + '/delete';
      
      return $http.put(url, null, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      })
    };
    
    postServ.hasUpvoted = function (obj) {
      return obj.hasUpvoted;
    };

    postServ.hasDownvoted = function (obj) {
      return obj.hasDownvoted;
    };
    
    postServ.refresh = function (obj, data) {
      Object.keys(data).forEach(function (key) {
        obj[key] = data[key];
      });
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
      var url = '/api/users';
      
      return $http.get(url, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        angular.copy(res.data, userServ.users);
        return res;
      });
    };

    userServ.getUser = function (name) {
      var url = '/api/users/' + name;
      return $http.get(url, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (res) {
        return res;
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
      var url = '/api/register';
      
      return $http.post(url, user).then(function (res) {
        authServ.saveToken(res.data.token);
      });
    };

    authServ.login = function (user) {
      var url = '/api/login';
      
      return $http.post(url, user).then(function (res) {
        authServ.saveToken(res.data.token);
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
    $scope.hasUpvoted = posts.hasUpvoted;
    $scope.hasDownvoted = posts.hasDownvoted;
    $scope.upvotePost = posts.upvotePost;
    $scope.downvotePost = posts.downvotePost;
    
    $scope.addPost = function () {
      if (!$scope.title || $scope.title === '')
        return;

      posts.createPost({
        title: $scope.title,
        link: $scope.link,
        body: $scope.body
      }).then(function (res) {
        $scope.title = '';
        $scope.link = '';
        $scope.body = '';
      });
    };
  }
]);

app.controller('PostsCtrl', [
  '$scope',
  '$state',
  '$window',
  'posts',
  'post',
  'auth',
  function ($scope, $state, $window, posts, post, auth) {
    $scope.post = post;
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.hasUpvoted = posts.hasUpvoted;
    $scope.hasDownvoted = posts.hasDownvoted;
    $scope.upvotePost = posts.upvotePost;
    $scope.downvotePost = posts.downvotePost;
    $scope.upvoteComment = posts.upvoteComment;
    $scope.downvoteComment = posts.downvoteComment;
    
    $scope.postData = {
      isAuthor: $scope.currentUser() === $scope.post.author,
      isEditing: false,
      body: ''
    };

    $scope.commentData = {};

    $scope.post.comments.forEach(function (comment, index) {
      $scope.commentData[comment._id] = {
        isAuthor: $scope.currentUser() === comment.author,
        isEditing: false,
        body: ''
      };
    });
    
    $scope.editPost = function () {
      $scope.setData($scope.postData, {
        isEditing: true,
        body: $scope.post.body
      });
    };

    $scope.updatePost = function () {
      posts.updatePost($scope.post, {
        body: $scope.postData.body
      }).then(function (res) {
        $scope.setData($scope.postData, {
          isEditing: false,
          body: ''
        });
      });
    };

    $scope.deletePost = function () {
      posts.deletePost($scope.post).then(function (res) {
        $state.go('home');
      });
    };
    
    $scope.addComment = function () {
      posts.addComment($scope.post, {
        body: $scope.body
      }).then(function (res) {
        $scope.commentData[res.data._id] = {
          isAuthor: true,
          isEditing: false,
          body: ''
        };

        $scope.body = '';
      });
    };

    $scope.editComment = function (comment) {
      $scope.setData($scope.commentData[comment._id], {
        isEditing: true,
        body: comment.body
      });
    };        
    
    $scope.updateComment = function (comment) {
      posts.updateComment(comment, {
        body: $scope.commentData[comment._id].body
      }).then(function (res) {
        $scope.setData($scope.commentData[comment._id], {
          isEditing: false,
          body: ''
        });
      });
    };

    $scope.deleteComment = function (comment) {
      posts.deleteComment(comment).then(function (res) {
        $scope.post.comments.splice($scope.post.comments.indexOf(res.data));
      });
    };
    
    $scope.setData = function (data, obj) {
      Object.keys(obj).forEach(function (key) {
        data[key] = obj[key];
      });
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
    $scope.hasUpvoted = posts.hasUpvoted;
    $scope.hasDownvoted = posts.hasDownvoted;
    $scope.upvotePost = posts.upvotePost;
    $scope.downvotePost = posts.downvotePost;
    $scope.upvoteComment = posts.upvoteComment;
    $scope.downvoteComment = posts.downvoteComment;
  }
]);

app.controller('AuthCtrl', [
  '$scope',
  '$state',
  'auth',
  function ($scope, $state, auth) {
    $scope.user = {};

    $scope.register = function () {
      auth.register($scope.user).catch(function (error) {
        $scope.error = error;
      }).then(function () {
        $state.go('home');
      });
    };

    $scope.login = function () {
      auth.login($scope.user).catch(function (error) {
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
              return posts.getPost($stateParams.id).then(function (res) {
                return res.data;
              });
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
              return users.getUser($stateParams.name).then(function (res) {
                return res.data;
              });
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
