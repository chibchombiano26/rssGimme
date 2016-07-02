var express = require('express');
var app = express();
var HttpsProxyAgent = require('https-proxy-agent');
var http = require("https");
var request = require("request");

var urlRequest = "http://gimmeproxy.com/api/getProxy?cookies=true&post=true&supportsHttps=true&maxCheckPeriod=3600&get=true&country=US";
var path;
var res;

app.get('/gce', function (req, response) {
  path = req.param('path');
  res = response;
  doRequestProxy(urlRequest);
});


var doRequestProxy =  function(){
  request(urlRequest, function(error, response, body) {
    var body = JSON.parse(body);
    doRequest(body);
  });
}


function doRequest(body){

  var proxy = "http://" + body.ipPort;
  var agent = new HttpsProxyAgent(proxy);
  
  if(path.indexOf('http') == -1){
    path = 'https://www.facebook.com/' + path;
  }

request({
  uri: path,
  method: "GET" ,
  agent: agent,
  timeout: 10000,
  followRedirect: true,
  maxRedirects: 10,
  headers: {
    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
  },
}, function(error, response, body) {
  
    
  
    if(error){
      console.log("Error" + error);
      doRequestProxy();  
    }
    else{
      
      if(body.indexOf('500 Internal Privoxy Error') > -1 
      || body.indexOf('captcha') > -1 
      || body.indexOf('The requested URL') > -1) {
        doRequestProxy();
        return;
      }
      
      //console.log("Response: " + response);
      //console.log("Body: "+ body);
      res.status(200).send(body);
    }
    
});
  
}

app.listen(process.env.PORT, process.env.IP, function () {
  console.log('Example app listening on port 3000!');
});


