/**
 * This file provided by Facebook is for non-commercial testing and evaluation purposes only.
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');
var https = require('http');

var googleTranslate = require('google-translate')('AIzaSyBTtH6Mna2tpcaFZ2zmo6l8wAZqcDO5rzw');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/comments.json', function(req, res) {
  fs.readFile('comments.json', function(err, data) {
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

app.post('/comments.json', function(req, res) {  
  // save to the file
  fs.readFile('comments.json', function(err, data) {    
    var comments = JSON.parse(data);
    comments.unshift(req.body);
    fs.writeFile('comments.json', JSON.stringify(comments, null, 4), function(err) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(JSON.stringify(comments));
    });
  });
});

app.get('/giphy', function (request, response) {
    console.log(request);
    var offset = Math.floor(Math.random() * 5);

    var optionsget = {
        host: 'api.giphy.com',
        port: 80,
        path: '/v1/gifs/search?offset=' + offset + '&q=' + request.query.text.split(' ').join('+') + '&api_key=dc6zaTOxFJmzC&limit=1&rating=pg-13',
        //path: '/v1/gifs/search?q=hi&api_key=dc6zaTOxFJmzC',
        method: 'GET'        
    };
    var msg = '';
    var statusCode = 0;
    console.log(optionsget.path);
        
    // do the GET request
    var reqGet = setupSimpleRequestHandlers(response, optionsget);
    console.log('reqGet ' + reqGet.data);

    reqGet.end();    
});

app.get('/sentimentAnalysis', function (request, response) {
 
    var optionsget = {
        host: 'api.idolondemand.com',
        port: 80,
        path: '/1/api/sync/analyzesentiment/v1?text=' + request.query.text.split(' ').join('+') + '&apikey=7cd8a69d-0c00-4c64-a9bf-f922bb361a8f',        
        method: 'GET'        
    };
    var msg = '';
    var statusCode = 0;
        
    // do the GET request
    var reqGet = setupSimpleRequestHandlers(response, optionsget);
    console.log('reqGet ' + reqGet.data);

    reqGet.end();    
});

app.get('/translate', function (request, response) {
    googleTranslate.translate(request.query.text, 'en', function(err, translation) {
    console.log(translation);
    response.json(translation);  
});
});

function setupSimpleRequestHandlers(response, requestOptions) {
    var reqGet = http.request(requestOptions, function (res) {

        res.setEncoding('utf8');

        var msg = '';
        res.on('data', function (chunk) {
            msg += chunk;
        });
        res.on('end', function () {
            response.status(res.statusCode).json(responseJson(res, msg));
        });
    });

    reqGet.on('error', function (err) {
        console.error(err);
        response.status(500).json({message: err});
    });
    
    return reqGet;
}

function setupSecureRequestHandlers(response, requestOptions) {

    var reqGet = https.request(requestOptions, function (res) {

        res.setEncoding('utf8');

        // console.log("statusCode: ", res.statusCode);
        // console.log("headers: ", res.headers);

        var msg = '';
        res.on('data', function (chunk) {
            msg += chunk;
        });
        res.on('end', function () {
            console.info('\n\nCall completed');        
            
            response.status(res.statusCode).json(responseJson(res, msg));
        });
    });

    reqGet.on('error', function (err) {
        console.error(err);
        response.status(500).json({message: err});
    });
    console.log(reqGet);
    
    return reqGet;
} 

function responseJson(response, msg) {
    console.info('msg' + msg);

    var statusCode = response.statusCode;
    return JSON.parse(msg);
}

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
