
/*const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'ioQrTU8BEItN9nMIjjYmWq9PGPyCs62ADiTlmj1aFz83hnohjHteiurTVcl5oWvn',
  APISECRET: 'hmubUwcoaoZKnmBrKXvIJbTa5tlxmItgLYKbm0W9Urj74xIBDCmJgHDq9D8tI7l1'
});
*/
const WebSocket = require('ws');
var db = require("./config");
var dateTime = require('node-datetime');
var someVar = [];

const ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
//const ws = new WebSocket('wss://kline.indodax.com/ws/btcidr.kline.1m');

    db.connect(function(err) {
      if (err) throw err;
      /**Ws Start */
      
      ws.on('message', function incoming(data) {
        var row = JSON.parse(data);
        var dt = dateTime.create();
        var tdate = dt.format('Y-m-d H:M:S');

        //Show Signal Query
        let sql = "SELECT * FROM t_signal";
        db.query(sql, function (err, result) {
            if (err) throw err;
            /** Looping Signal ID  */
            for(let i=0;i<result.length;i++){
              let openposition = result[i].openposition;
              let signal_id = result[i].signal_id;
              let cutloss = result[i].cl;
              let signal_pair = result[i].pair;
              let endprocess = false;

              /** OPEN AND PRICE INITIAL */
              let open_price;
              let tp_price;
              /** Long Case */
              if(openposition == 1){
                /** Looping Data Dari Market */
                for(let d =0;d<row.length;d++){
                  let price = row[d].c;
                  let pair = row[d].s;
                  /** Jika ditemukan PAIR Yang SAMA */ /** EXAMPLE : BTCUSDT */
                  if(signal_pair === pair){
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
                              open_price = data_open[o].price;
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
                              console.log(`OPEN SUCCESS ! ID :${signal_id} | ${signal_pair} | $${price} | ${open_pct}% `);
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
                                console.log(`TP SUCCESS! ID: ${signal_id} | ${signal_pair} | ${price} | ${tp_pct}`);
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
                        /** Cek apakah udah kecentang dan harga sama atau di bawah open END */
                        if(endprocess === true){
                          if(price <= temp_open_price){
                            // END TASK
                            let Amount =((harga_tp/100) - (harga_open /100) / 100); 
                            let winloss = ((harga_tp - harga_open) < 0) ? -1 : 1; 
                            let statuswin = ((harga_tp - harga_open) < 0) ? 'LOSS' : 'WIN'; 
                            db.query(`UPDATE t_signal 
                            SET status='${winloss}',tdate='${tdate}' WHERE signal_id='${signal_id}'`, function (err, result) {
                              console.log(`END TRADE! |${signal_id}| ${signal_pair} | ${statuswin} | Amount : ${Amount}% `);
                            });
                          }
                        }
                        //ws.close();
                        /** END Logic */
                      }) //Tp Query ENd
                    })
                  }
                }
              }else{
              /** Short Case */
              } // Short Case END
            }
        });
      }) // Ws End
    }); //Db Connect End

    function setValue(value) {
      someVar = value;
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