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
var pos = require('pos');
var Typeahead = require('react-typeahead').Typeahead;


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

    var words = new pos.Lexer().lex(request.query.text);
    var taggedWords = new pos.Tagger().tag(words);
    var giphyText = request.query.text;        
    var nouns = '';
    var adjs = '';    
    var wordCount = 0;
    for (i in taggedWords) {
        var taggedWord = taggedWords[i];
        var word = taggedWord[0];
        var tag = taggedWord[1];
        if(tag=='NN'){
            nouns = nouns + ' ' + word;
            wordCount = wordCount + 1;
        }
         if(tag=='JJ'){
            adjs = adjs + ' ' + word;            
            wordCount = wordCount + 1;
        }
        if(wordCount==2){
            break;
        }        
        console.log(word + " / " + tag);
    } 
    if(nouns!='' || adjs!=''){
        giphyText = adjs + nouns;
    }    

    var offset = Math.floor(Math.random() * 5);
    console.log('lookup text:' + giphyText);
    var optionsget = {
        host: 'api.giphy.com',
        port: 80,
        path: '/v1/gifs/search?offset=' + offset + '&q=' + giphyText.split(' ').join('+') + '&api_key=dc6zaTOxFJmzC&limit=1&rating=pg-13',
        method: 'GET'        
    };
    var msg = '';
    var statusCode = 0;
        
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

app.get('/meme', function (request, response) {
    var memeId = Math.floor(Math.random() * 100);
    var memeIds=[61579,438680,101470,61532,61520,347390,61539,61527,61585,5496396,61546,61582,16464531,61544,563423,405658,101288,61533,8072285,1509839,100947,245898,21735,259680,61580,1035805,235589,101287,61516,14230520,6235864,442575,100955,109765,97984,101440,124212,61556,101711,101511,40945639,13757816,195389,444501,101716,922147,1790995,61583,766986,61522,718432,172314,61581,12403754,1367068,18594762,100952,673439,15878567,21604248,8774527,1232104,10628640,100948,61584,13424299,17699,389834,9440985,228024,10672255,1366993,23909796,163573,409403,412211,146381,356615,306319,646581,6531067,371382,7761261,17496002,681831,176908,11557802,27920,107773,138874,61521,265789,24557067,1202623,1232147,17258777,30213495,2005809,100944,1570716]
    memeId=memeIds[memeId];
    var optionsget = {
        host: 'api.imgflip.com',
        port: 80,
        path: '/caption_image?username=jthatjd03&password=chacilla&template_id=' + memeId + '&text0=' + request.query.text.split(' ').join('+'),        
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

    
    return reqGet;
} 

function responseJson(response, msg) {
    var statusCode = response.statusCode;
    return JSON.parse(msg);
}

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
