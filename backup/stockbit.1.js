const axios = require('axios');
const username = 'PAIJOKATES'
const password = '111111'

//const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDI2NTc4NjEsImp0aSI6IkV0YmZaN3ozck52bzZqQnlMS3p4RVE9PSIsImlzcyI6IlNUT0NLQklUIiwibmJmIjoxNjAyNjU3ODYxLCJleHAiOjE2MDQ0NzIyNjEsImRhdGEiOnsidXNlIjoicGFpam9rYXRlcyIsImVtYSI6InRpbWFoaW03MzBAemlrMnppay5jb20iLCJmdWwiOiJwYWlqbyIsInNlcyI6IjNQMjR2Q0NtdjU3RWpjRnYiLCJkdmMiOiIifX0.5J366j3Ifi6NV-iBD8aCoZicWDsNAPkXzY8ie1DA4D0';

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