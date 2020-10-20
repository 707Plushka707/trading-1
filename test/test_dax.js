const request = require('request');

let url = "https://indodax.com/api/webdata";
let options = {json: true};

var requestLoop = setInterval(function(){
    request(url, options, (error, res, data) => {
        if (error) {
            return  console.log(error)
        }; //# Error Scrap Data

        //# Success Scrap Data, Lalu Execute
        if (!error && res.statusCode == 200) {
            let obj = data.prices;
            var row = Object.keys(obj).map((key) => [key, obj[key]]);
            console.log(row);
        }; //# End Scrape == Status 200
        
    }); //# Request End (Error or 200 code)
},1000);

requestLoop;