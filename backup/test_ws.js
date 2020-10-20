const WebSocket = require('ws');

const ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
    ws.on('message', function incoming(data) {
        var pair = JSON.parse(data);
        for(let i=0;i<pair.length;i++){
            if(pair[i].s == 'BTCUSDT' || pair[i].s == 'BCHUSDT'){
                console.log(pair[i].s + ' ' + pair[i].c);
            }
        }
    })