## meanit
# Getting Started
Reddit-style forum written in MEAN stack.  
  
Dependencies listed in package.json. To run project:  

    $ git clone https://github.com/noobbyte/meanit  
    $ cd meanit  
    $ npm install  
    $ node server.js  
      
Then navigate to http://127.0.0.1.  
  
# Features  
Reddit-style forum, i.e.
* Posts have titles, links, accompanying text, and comments
* Posts and comments are sorted by overall rating
* Registered and authenticated users can make or rate posts or comments
* Posts or comments can only be rated once
* User pages contain links to all posts and comments by that user

# Organization
    /meanit
      /config
        passport.js - User validation and authentication
      /models - Contains Mongoose object models
        Comments.js
        Posts.js
        Users.js
      /public
        /js - Client-side JavaScript
          app.js - Angular app
        /less - Uncompiled client-side CSS
          styles.less - Less stylesheet
      /routes
        index.js - Express routing and middleware
      /shared
        Util.js - Utility functions
      /views - Uncompiled Pug HTML templates
        home.pug
        index.pug
        login.pug
        posts.pug
        register.pug
        users.pug
      gulpfile.js - Gulp tasks for Less and Pug compilation
      package.json - Dependency list for npm
      server.js - Main Node/Express server
