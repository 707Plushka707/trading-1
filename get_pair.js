const WebSocket = require('ws');
var db = require("./config");
var dateTime = require('node-datetime');
const request = require('request');
var mysql = require('mysql');

const axios = require('axios');
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDI2NTc4NjEsImp0aSI6IkV0YmZaN3ozck52bzZqQnlMS3p4RVE9PSIsImlzcyI6IlNUT0NLQklUIiwibmJmIjoxNjAyNjU3ODYxLCJleHAiOjE2MDQ0NzIyNjEsImRhdGEiOnsidXNlIjoicGFpam9rYXRlcyIsImVtYSI6InRpbWFoaW03MzBAemlrMnppay5jb20iLCJmdWwiOiJwYWlqbyIsInNlcyI6IjNQMjR2Q0NtdjU3RWpjRnYiLCJkdmMiOiIifX0.5J366j3Ifi6NV-iBD8aCoZicWDsNAPkXzY8ie1DA4D0';


let url = "https://indodax.com/api/webdata";
let options = {json: true};

//const ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
//const ws = new WebSocket('wss://kline.indodax.com/ws/btcidr.kline.1m');
function loading() {
    var twirlTimer = (function () {
        var P = ["\\", "|", "/", "-"];
        var x = 0;
        return setInterval(function () {
            process
                .stdout
                .write("\r" + P[x++]);
            x &= 3;
        }, 500);
    })();
}

//StockBitch//

async function makeRequest() {

    const config = {
        method: 'get',
        url: 'https://api.stockbit.com/v2.4/watchlist/company/700979?page=1&limit=500&nochart=1',
        headers: { 'Authorization': `Bearer ${token}` }
    }
  
    let res = await axios(config)
    let data = res.data;
    let datax = data.data;
    let row = datax.result;  
  
    db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "st"
    });
    //# QUERY
    db.connect(function(err) {
        if (err) throw err;
        let arr = [];
        var dt = dateTime.create();
        var tdate = dt.format('Y-m-d H:M:S');
        //Show Signal Query
        let sql = "SELECT * FROM m_pair WHERE market_id='4'";
        db.query(sql, function (err, result) {
            for(let i =0;i<result.length;i++){
                arr.push(result[i].pair);
            }

            //Looping raw
            for(let j=0;j<row.length;j++){
                if(arr.includes(row[j].symbol)){
                    db.query(`UPDATE m_pair set price='${row[j].last}' WHERE pair='${row[j].symbol}'`, 
                    function (err, result) {});
                    console.log(row[j].symbol + ' Update ' + row[j].last);
                }else{
                    db.query(`INSERT into m_pair(market_id,pair) VALUES('4','${row[j].symbol}')`, 
                    function (err, result) {});
                    console.log(row[j].symbol + 'inserted');
                }
            }
        });
    }); //Db Connect End
}

//Indodax//
var requestLoop = setInterval(function(){
    db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "st"
    });
    request(url, options, (error, res, data) => {
        if (error) {
            return  console.log(error)
        }; //# Error Scrap Data

        //# Success Scrap Data, Lalu Execute
        if (!error && res.statusCode == 200) {
            let obj = data.prices;
            var row = Object.keys(obj).map((key) => [key, obj[key]]);
        }; //# End Scrape == Status 200

        //# QUERY
        db.connect(function(err) {
            var dt = dateTime.create();
            var tdate = dt.format('Y-m-d H:M:S');
            let arr = [];
            let sql = "SELECT * FROM m_pair where market_id='3'";
            db.query(sql, function (err, result) {
                for(let i =0;i<result.length;i++){
                    arr.push(result[i].pair);
                }

                //Looping raw
                for(let j=0;j<row.length;j++){
                    if(arr.includes(row[j][0])){
                        db.query(`UPDATE m_pair set price='${row[j][1]}' WHERE pair='${row[j][0]}'`, 
                        function (err, result) {});
                        console.log(row[j][0] + ' Update ' + row[j][1]);
                    }else{
                        db.query(`INSERT into m_pair(market_id,pair) VALUES('3','${row[j][0]}')`, 
                        function (err, result) {});
                        console.log(row[j][0] + 'inserted');
                    }
                }
            });

        }); //Db Connect End
        
    }); //# Request End (Error or 200 code)
    loading();
    makeRequest(); //StockBitch
},5000);

db.connect(function(err) {
    if (err) throw err;
    /** INDODAX */
    //requestLoop;
    //makeRequest();
    /** BINANCE */
    /*
    ws.on('message', function incoming(data) {
        var row = JSON.parse(data);
        var dt = dateTime.create();
        var tdate = dt.format('Y-m-d H:M:S');
        db.query(sql, function (err, result) {
            for(let i =0;i<result.length;i++){
                arr.push(result[i].pair);
            }

            //Looping raw
            for(let j=0;j<row.length;j++){
                if(arr.includes(row[j][s])){
                    db.query(`UPDATE m_pair set price='${row[j][c]}' WHERE pair='${row[j][c]}'`, 
                    function (err, result) {});
                    console.log(row[j][s] + ' Update ' + row[j][c]);
                }else{W
                    db.query(`INSERT into m_pair(market_id,pair) VALUES('3','${row[j][s]}')`, 
                    function (err, result) {});
                    console.log(row[j][0] + 'inserted');
                }
            }
        });
        ws.close();
    }) // Ws BINANCE End
    */
}); //Db Connect End



    