/*var db = require("./config");

db.connect(function(err) {
    if (err) throw err;
    
    let sql = "SELECT * FROM m_user";

    db.query(sql, function (err, result) {
        db.query('SELECT * from t_signal', function (err, result) {
            console.log(xx);
        });
    });
});*/
const WebSocket = require('ws');

const ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
    ws.on('message', function incoming(data) {
        var pair = JSON.parse(data);
        console.log(pair);
    })