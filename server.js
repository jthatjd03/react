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

app.get('/comments.json', function(req, res) {
  fs.readFile('comments.json', function(err, data) {
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

app.get('/hotels', function (request, response) {

        var optionsget = {
            host: 'http://getaways-content-service-vip.snc1/v2/getaways/content/hotelId?idType=uuid&idValue=0273fdce-d2c9-4966-a7d3-8e0983e36727',
            port: 80,
            path: 
            method: 'GET',
            headers: {
                'Groupon-User-Id': 324234234,
                'X-client-roles': 'android',
                'X-Request-Id': request.param('xid')
            }
        };

        var queryString = url.parse(request.url, false).query;
        console.log(queryString);

        optionsget.path += "?" + queryString;
        console.log(optionsget.path);
        response.header('logPath', optionsget.host + optionsget.path);

        var msg = '';
        var statusCode = 0;

        console.info('SEARCH::: Options prepared:');
        console.info('Do the GET call');

        // do the GET request
        var reqGet = setupSimpleRequestHandlers(response, optionsget);
        reqGet.end();
    });

function setupSimpleRequestHandlers(response, requestOptions) {
    var startTime, endTime;
    startTime = new Date();
    console.log(requestOptions);
    var reqGet = http.request(requestOptions, function (res) {

        res.setEncoding('utf8');

        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);

        var msg = '';
        res.on('data', function (chunk) {
            msg += chunk;
        });
        res.on('end', function () {
            endTime = new Date();
            console.info('\n\nCall completed');
            response.header('logTime', endTime - startTime);
            response.status(res.statusCode).json(responseJson(res, msg));
        });
    });

    reqGet.on('error', function (err) {
        console.error(err);
        response.status(500).json({message: err});
    });

    return reqGet;
}


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
