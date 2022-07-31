require("dotenv").config();

const mysql_function = require("./function/mysql_function.js");
const api_function = require("./function/api_function.js");
const connection = mysql_function.user_database();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app).listen(80);
const ejs = require("ejs");
const body_parser = require("body-parser")
const cookieParser = require('cookie-parser');
const cors = require('cors')
app.use(cors());
const { title } = require("process");
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended:true }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', './views');
const router_api = require('./router/app.js');
app.use('/',router_api);
console.log("server is running...")



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