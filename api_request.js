require("dotenv").config();

const mysql_function = require("./function/mysql_function.js");
const api_function = require("./function/api_function.js");
const connection = mysql_function.db();

//API데이터 요청
let base_date = api_function.set_date();
let base_time = api_function.set_time();

mysql_function.request_areacode(connection,base_date,base_time);
mysql_function.check_error(connection);

setInterval(function() {
    let compare_date = api_function.set_date();
    let compare_time = api_function.set_time();
    console.log(compare_time);
    mysql_function.check_error(connection);
    if(compare_time != base_time){
        base_time = compare_time;
        mysql_function.request_areacode(connection,compare_date,compare_time);
    }
}, 600000)
//API데이터 요청//




