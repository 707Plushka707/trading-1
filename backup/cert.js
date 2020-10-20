var url = require('url');
var WebSocket = require('ws');
var HttpsProxyAgent = require('https-proxy-agent');

// HTTP/HTTPS proxy to connect to
//var proxy = process.env.http_proxy || 'http://175.141.69.200:80';
var proxy = process.env.http_proxy || 'http://124.158.175.19:8080';
console.log('using proxy server %j', proxy);

// WebSocket endpoint for the proxy to connect to
var endpoint = process.argv[2] || 'wss://stream.binance.c:9443/ws/btcusdt@trade';
var parsed = url.parse(endpoint);
console.log('attempting to connect to WebSocket %j', endpoint);

// create an instance of the `HttpsProxyAgent` class with the proxy server information
var options = url.parse(proxy);

var agent = new HttpsProxyAgent(options);

// finally, initiate the WebSocket connection
var socket = new WebSocket(endpoint, { agent: agent });

socket.on('open', function () {
  console.log('"open" event!');
  socket.send('hello world');
});

socket.on('message', function incoming(data){
  console.log(data);
});