const axios = require('axios');
const username = 'PAIJOKATES'
const password = '111111'

//const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
//const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDI1NTc0MjcsImp0aSI6IkU4Znk5QWRpd1FNY20xckUybExRXC9RPT0iLCJpc3MiOiJTVE9DS0JJVCIsIm5iZiI6MTYwMjU1NzQyNywiZXhwIjoxNjA0MzcxODI3LCJkYXRhIjp7InVzZSI6InBhaWpva2F0ZXMiLCJlbWEiOiJ0aW1haGltNzMwQHppazJ6aWsuY29tIiwiZnVsIjoicGFpam8iLCJzZXMiOiJjM2ZweXJJcXFBZVlNZkQ3IiwiZHZjIjoiIn19.7GP-eLWx0Hu9aNamQ25WtCw1hIAhJ7guy0rvdbpBZpM';
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
      url: 'https://api.stockbit.com/v2.4/watchlist/company/700979?page=1&limit=500&nochart=1',
      headers: { 'Authorization': `Bearer ${token}` }
  }

  let res = await axios(config)

  let data = res.data;
  let result = data.data.result;
  for(let i=0;i<result.length;i++){
    let price = result[i].last;
    let pair = result[i].symbol;
    console.log(pair + ' : ' +price);
	}
}
var requestLoop = setInterval(function(){
  loading();
  makeRequest();
},3000);

requestLoop;