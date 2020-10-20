const axios = require('axios');
const username = 'PAIJOKATES'
const password = '111111'

//const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDI1NTc0MjcsImp0aSI6IkU4Znk5QWRpd1FNY20xckUybExRXC9RPT0iLCJpc3MiOiJTVE9DS0JJVCIsIm5iZiI6MTYwMjU1NzQyNywiZXhwIjoxNjA0MzcxODI3LCJkYXRhIjp7InVzZSI6InBhaWpva2F0ZXMiLCJlbWEiOiJ0aW1haGltNzMwQHppazJ6aWsuY29tIiwiZnVsIjoicGFpam8iLCJzZXMiOiJjM2ZweXJJcXFBZVlNZkQ3IiwiZHZjIjoiIn19.7GP-eLWx0Hu9aNamQ25WtCw1hIAhJ7guy0rvdbpBZpM';

const url = 'https://api.stockbit.com/v2.4/orderbook/'
const data = {
  username : username,
  password : password
}

function loading(){
  var twirlTimer = (function() {
    var P = ["\\", "|", "/", "-"];
    var x = 0;
    return setInterval(function() {
      process.stdout.write("\r" + P[x++]);
      x &= 3;
    }, 500);
  })();
}

async function makeRequest() {

  const config = {
      method: 'get',
      url: 'https://api.stockbit.com/v2.4/orderbook/',
      headers: { 'Authorization': `Bearer ${token}` }
  }

  let res = await axios(config)

  let data = res.data;
  let datax = data.data;
  let item = datax.item;
  for(let i=0;i<item.length;i++){
    let price = item[i].close;
    let pair = item[i].symbol;
    console.log(pair + ' : ' +price);
  }
}
var requestLoop = setInterval(function(){
  loading();
  makeRequest();
},1000);

requestLoop;