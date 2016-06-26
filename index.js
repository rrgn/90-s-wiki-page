var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(request, response) {
  response.render('home');
});

app.get('/:pageName', function (request, response) {
  response.render('placeholder', {pageName: request.params.pageName});
});

app.get('/:pageName/edit', function(request, response) {
  response.render('edit', {pageName: request.params.pageName});
});

app.get('/:pageName', function (request, response) {
  response.render('placeholder', {pageName: request.params.pageName});
});

app.post('/:pageName/save', function(request, response) {
  var data = request.body;
  var pagename = request.params.pageName;
  var page = 'pages/' + pagename + '.txt';

  console.log(data, pagename);
  fs.writeFile(page, data.contents, function(err) {
    if (err) {
      console.log("Error", err);
      return;
    }
    console.log(data.contents);
  });

  fs.readFile(page, function(err, buffer) {
    var string = buffer.toString();
    if (err) {
      console.log('Error',err);
      return;
    }
    console.log(string);
    response.render('show-text', {contents: string});
  });

});

app.listen(8080, function() {
  console.log("listening on 8080");
});
