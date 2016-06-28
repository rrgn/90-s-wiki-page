var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var wikiLinkify = require('wiki-linkify');
app.set('view engine', 'hbs');
var session = require('express-session');

app.use(session({
  secret: 'theBirdIsTheWord',
  cookie: {
    maxAge: 60000000000
  }
}));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/login', function(request, response) {
  response.render('login');
});

app.post('/login-submit', function(request, response) {
  var cred = request.body;
  if (cred.username === 'Matt' && cred.password === 'isawesome') {
    request.session.user = cred.username;
    response.redirect(request.session.requestUrl);
  } else {
    response.redirect('/login');
  }
});

app.get('/', function(request, response) {
  var nameOfUser = request.session.user;
  console.log(nameOfUser);
  response.render('home', {user: nameOfUser});
});

app.get('/AllPages', function(request, response) {
  fs.readdir('pages', function(err, pages) {
    if (err) {
      console.log(err);
      return;
    } else {
      var noExt = pages.map(function(idx) {
       var newIdx =idx.replace(/\.[^/.]+$/, "");
       return newIdx;
      });
      console.log(noExt);
      response.render('AllPages.hbs', {somePages: noExt});
    }
  });
});

app.get('/:pageName', function (request, response) {
  var pagename = request.params.pageName;
  var page = 'pages/' + pagename + '.txt';
  // console.log(pagename);
  fs.access(page, fs.F_OK, function(err) {
    if (err) {
      response.render('placeholder', {pageName: request.params.pageName});
    } else {
      fs.readFile(page, function(err, buffer) {
        var string = buffer.toString();
        var wikiContent = wikiLinkify(string);
        if (err) {
          console.log('Error',err);
          return;
        }
        response.render('show-text.hbs', {
        contents: wikiContent,
        pageName: pagename
        });
      });
    }
  });
});

app.get('/:pageName/edit', authRequired, function(request, response) {
  var pageName = request.params.pageName;
  var page = 'pages/' + pageName + '.txt';
  fs.readFile(page, function(err, buffer) {
    if (err) {
      response.render('edit', {
        title: 'Edit ' + pageName,
        pageName: pageName
      });
      return;
    }
    var string = buffer.toString();
    console.log(string);
    response.render('edit', {
      title: 'Edit ' + pageName,
      pageName: pageName,
      contents: string
    });
  });
});

app.post('/:pageName/save', authRequired, function(request, response) {
  var data = request.body.contents;
  var pagename = request.params.pageName;
  var page = 'pages/' + pagename + '.txt';
  fs.writeFile(page, data, function(err) {
    if (err) {
      console.log("Error", err);
      return;
    }
    console.log(data);
    response.redirect('/' + pagename);
  });
});

function authRequired(request, response, next) {
 request.session.requestUrl = request.url;
 console.log('some label', request.session.requestUrl);
  if (!request.session.user) {
    response.redirect('/login');
    // console.log('No access bitch');
  } else {
    next();
  }
}

app.get('/logout', function(request, response) {
    request.session.user = null;
    response.redirect('/');
});

app.listen(8080, function() {
  console.log("listening on 8080");
});
