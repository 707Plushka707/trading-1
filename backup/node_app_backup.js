const request = require('request');
const db = require("././config");
const dateTime = require('node-datetime');

let url = "https://indodax.com/api/webdata";
let options = {json: true};

var requestLoop = setInterval(function(){
    request(url, options, (error, res, data) => {
        if (error) {
            return  console.log(error)
        };

        if (!error && res.statusCode == 200) {
            let obj = data.prices;
            var prices = Object.keys(obj).map((key) => [key, obj[key]]);
            for(let i=0;i<prices.length;i++){
                let pair = prices[i];
                if(pair[0] == 'btcidr'){
                    console.log(pair[0] + ' -> ' + pair[1]);
                }
            }
        };
    });
},5000);

requestLoop;