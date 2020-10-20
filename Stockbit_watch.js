const axios = require('axios');
var db = require("./config");
var mysql = require('mysql');
var dateTime = require('node-datetime');

//const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDI2NTc4NjEsImp0aSI6IkV0YmZaN3ozck52bzZqQnlMS3p4RVE9PSIsImlzcyI6IlNUT0NLQklUIiwibmJmIjoxNjAyNjU3ODYxLCJleHAiOjE2MDQ0NzIyNjEsImRhdGEiOnsidXNlIjoicGFpam9rYXRlcyIsImVtYSI6InRpbWFoaW03MzBAemlrMnppay5jb20iLCJmdWwiOiJwYWlqbyIsInNlcyI6IjNQMjR2Q0NtdjU3RWpjRnYiLCJkdmMiOiIifX0.5J366j3Ifi6NV-iBD8aCoZicWDsNAPkXzY8ie1DA4D0';

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


  let res = await axios(config);
  let data = res.data;
  let row = data.data.result;
  console.log(row);


  db = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "st"
  });
  //# QUERY
  db.connect(function(err) {
      if (err) throw err;
      var dt = dateTime.create();
      var tdate = dt.format('Y-m-d H:M:S');
      //Show Signal Query
      let sql = "SELECT * FROM t_signal WHERE status=0";
      db.query(sql, function (err, result) {
          for(let i=0;i<result.length;i++){
              let openposition = result[i].openposition;
              let signal_id = result[i].signal_id;
              let cutloss = result[i].cl;
              let signal_pair = result[i].pair;
              let endprocess = false;

              /** OPEN AND PRICE INITIAL */
              /** Long Case */
              if(openposition == 1){
                /** Looping Data Dari Market */
                for(let d =0;d<row.length;d++){
                  let price = row[d].last;
                  let pair = row[d].symbol;
                  /** Jika ditemukan PAIR Yang SAMA */ /** EXAMPLE : BTCUSDT */
                  if(signal_pair === pair){
                    console.log(pair + ' ' + price);
                    /** Looping Open Signal */
                    let sql_open = "SELECT * from t_signalopen WHERE t_signalopen.signal_id='"+signal_id+"' ORDER BY PRICE DESC";
                    let sql_tp = "SELECT * from t_signaltp WHERE t_signaltp.signal_id='"+signal_id+"' ORDER BY PRICE ASC";
                    
                    
                    db.query(sql_open, function (err, result,) {
                      let data_open = result;                      
                      db.query(sql_tp, function (err, result) {
                        let data_tp = result;
                        let temp_open_price = 0;
                        let temp_tp_price = 0;
                        let open_price = 0;
                        let harga_open = 0; // Jumlah yang dibeli
                        let sub_open = 0;
                        let sub_tp = 0;
                        let total_open = 0;
                        
                        /** Logic HERE */
                        for(let o=0;o<data_open.length;o++){
                          let signalopen_id = data_open[o].signalopen_id;
                          let open_price = data_open[o].price;
                          let open_status = data_open[o].status;
                          let open_pct = data_open[o].pct;
                              total_open = total_open + open_price;
                          
                          /**Hitung Open Kecentang */
                          if(open_status == 1){
                            sub_open = open_price * open_pct;
                            harga_open = harga_open + sub_open;
                          }

                          temp_open_price = (temp_open_price < open_price && open_status == 1) 
                            ? open_price : temp_open_price;
                          
                          /** CASE 1 */ /**Jika PRICE Market Menyentuh Open atau lebih rendah */
                          
                          if(price <= open_price && open_status == 0){
                            db.query(`UPDATE t_signalopen 
                            SET status='1',tdate='${tdate}' WHERE signal_id='${signal_id}' 
                            AND price >='${price}' `, function (err, result) {
                              console.log('\x1b[36m',`OPEN SUCCESS ! ID :${signal_id} | ${signal_pair} | $${price} | ${open_pct}% `);
                              data_open[o].status = 1;
                            });

                          }
                          /** CASE 1 END */  
                          
                          var harga_tp = 0; // Jumlah yang dijual
                          var total_tp = 0; // Jumlah yang dijual
                          for(let t=0;t<data_tp.length;t++){
                            let signaltp_id = data_tp[t].signaltp_id;
                            let tp_price = data_tp[t].price;
                            let tp_status = data_tp[t].status;
                            let tp_pct = data_tp[t].pct;
                                total_tp =total_tp + tp_price;

                            /** CASE 2 */ /**Jika PRICE Market MENYENTUH TP Atau lebih Besar */
                            if(price >= tp_price && temp_open_price > 0 && tp_status == 0){
                              db.query(`UPDATE t_signaltp 
                              SET status='1',tdate='${tdate}' WHERE signal_id='${signal_id}' 
                              AND price <='${price}' `, function (err, result) {
                                console.log('\x1b[32m',`TP SUCCESS! ID: ${signal_id} | ${signal_pair} | ${price} | ${tp_pct}`);
                                data_tp[t].status;
                              });
                            }
                            if(tp_status == 1){
                              endprocess = true;
                              sub_tp = tp_price * tp_pct;
                              harga_tp = harga_tp + sub_tp;
                            } 
                            /** CASE 2 END */  
                          }
                        }
                        
                        //ws.close();
                        /** END Logic */
                      }) //Tp Query ENd
                    })
                    /** Cek apakah udah kecentang dan harga sama atau di bawah open END */
                    if(endprocess === true){
                      if(price <= temp_open_price){
                        // END TASK
                        let Amount =((harga_tp/100) - (harga_open /100) / 100); 
                        let winloss = ((harga_tp - harga_open) < 0) ? -1 : 1; 
                        let statuswin = ((harga_tp - harga_open) < 0) ? 'LOSS' : 'WIN'; 
                        db.query(`UPDATE t_signal 
                        SET status='${winloss}',tdate='${tdate}' WHERE signal_id='${signal_id}'`, function (err, result) {
                          console.log('\x1b[35m',`END TRADE! |${signal_id}| ${signal_pair} | ${statuswin} | Amount : ${Amount}% `);
                        });
                      }
                    }
                  }
                }
              }else{
              /**
               *  
               * 
               * 
               * Short Case 
               * 
               * 
               * 
               * */
              /** Looping Data Dari Market */
                for(let d =0;d<row.length;d++){
                    
                  let price = row[d].last;
                  let pair = row[d].symbol;
                  /** Jika ditemukan PAIR Yang SAMA */ /** EXAMPLE : BTCUSDT */
                  if(signal_pair === pair){
                    console.log(pair + ' ' + price);
                    /** Looping Open Signal */
                    let sql_open = "SELECT * from t_signalopen WHERE t_signalopen.signal_id='"+signal_id+"' ORDER BY PRICE DESC";
                    let sql_tp = "SELECT * from t_signaltp WHERE t_signaltp.signal_id='"+signal_id+"' ORDER BY PRICE ASC";
                    
                    
                    db.query(sql_tp, function (err, result,) {
                      let data_tp = result;
                      
                      db.query(sql_open, function (err, result) {
                        let data_open = result;
                        let temp_open_price = 0;
                        let temp_tp_price = 0;
                        let open_price = 0;
                        let harga_tp = 0; // Jumlah yang dibeli
                        let sub_open = 0;
                        let total_tp = 0;
                        
                        /** Logic HERE */
                        for(let t=0;t<data_tp.length;t++){
                          let signalopen_id = data_tp[t].signalopen_id;
                          let tp_price = data_tp[t].price;
                          let tp_status = data_tp[t].status;
                          let tp_pct = data_tp[t].pct;
                              total_tp = total_tp + tp_price
                          
                          /**Hitung TP Kecentang */
                          if(tp_status == 1){
                            sub_tp = tp_price * tp_pct;
                            harga_tp = harga_tp + sub_tp;
                          }

                          temp_tp_price = (temp_tp_price < tp_price && tp_status == 1) 
                            ? tp_price : temp_tp_price;
                          
                          /** CASE 1 */ /**Jika PRICE Market Menyentuh TP atau lebih rendah */
                          
                          if(price <= tp_price && tp_status == 0){
                            db.query(`UPDATE t_signaltp 
                            SET status='1',tdate='${tdate}' WHERE signal_id='${signal_id}' 
                            AND price >='${price}' `, function (err, result) {
                              console.log('\x1b[36m',`OPEN SUCCESS ! ID :${signal_id} | ${signal_pair} | $${price} | ${tp_pct}% `);
                              data_tp[t].status = 1;
                            });

                          }
                          /** CASE 1 END */  
                          
                          //** OPEN METHOD */
                          var harga_open = 0; // Jumlah yang dijual
                          var total_open = 0; // Jumlah yang dijual
                          for(let o=0;o<data_open.length;o++){
                            let signalopen_id = data_open[o].signalopen_id;
                            let open_price = data_open[o].price;
                            let open_status = data_open[o].status;
                            let open_pct = data_open[o].pct;
                                total_open = total_open + open_price;

                            /** CASE 2 */ /**Jika PRICE Market MENYENTUH OPEN Atau lebih Besar */
                            if(price >= open_price && temp_tp_price > 0 && open_status == 0){
                              db.query(`UPDATE t_signalopen 
                              SET status='1',tdate='${tdate}' WHERE signal_id='${signal_id}' 
                              AND price <='${price}' `, function (err, result) {
                                console.log('\x1b[31m',`OPEN SUCCESS! ID: ${signal_id} | ${signal_pair} | ${price} | ${open_pct}`);
                                data_open[o].status;
                              });
                            }
                            if(open_status == 1){
                              endprocess = true;
                              sub_open = open_price * open_pct;
                              harga_open = harga_open + sub_open;
                            } 
                            /** CASE 2 END */  
                          }
                        }
                        
                        //ws.close();
                        /** END Logic */
                      }) //Tp Query ENd
                    })
                    /** Cek apakah udah kecentang dan harga sama atau di bawah open END */
                    if(endprocess === true){
                      if(price <= temp_open_price){
                        // END TASK
                        let Amount =((harga_tp/100) - (harga_open /100) / 100); 
                        let winloss = ((harga_tp - harga_open) < 0) ? -1 : 1; 
                        let statuswin = ((harga_tp - harga_open) < 0) ? 'LOSS' : 'WIN'; 
                        db.query(`UPDATE t_signal 
                        SET status='${winloss}',tdate='${tdate}' WHERE signal_id='${signal_id}'`, function (err, result) {
                          console.log('\x1b[35m',`END TRADE! |${signal_id}| ${signal_pair} | ${statuswin} | Amount : ${Amount}% `);
                        });
                      }
                    }
                  }
                }
              } // Short Case END
            }
      });

  }); //Db Connect End
}


var requestLoop = setInterval(function(){
  makeRequest();
},3000);

requestLoop;