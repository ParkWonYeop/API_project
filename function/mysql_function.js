const mysql = require("mysql");
const axios = require("axios");
const cheerio = require("cheerio");
const request = require('request');
const api_function = require("./api_function.js");
require("dotenv").config();

//딜레이
const sleep = function(sec){
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

//데이터베이스 접근
const user_database = function(){
    const connection=mysql.createConnection({
        host     : process.env.DB_HOST,    // 호스트 주소
        user     : process.env.DB_USER,           // mysql user
        password : process.env.DB_PASS,       // mysql password
        database : process.env.DB_NAME,         // mysql 데이터베이스
    }); 
    connection.connect();
    return connection;
}

//오류발생한 데이터를 재요청
const check_error = async function(connection){
    await connection.query('SELECT area_code,date,time FROM weather_information where PTY = -100 OR PTY = -101', async function(err, result){
        if(err){
            console.log('데이터베이스 오류');
        }
        else{
            for (let data of result){
                await delete_error(connection)
                if(data.time != undefined){
                    await request_body(connection,data.area_code,data.date,data.time);
                }
                await sleep(0.5);
            };
        }
    });
}

//오류발생한 데이터를 삭제
const delete_error = async function(connection){
    await connection.query('DELETE FROM weather_information where PTY = -100 OR PTY = -101', async function(err, result){
        if(err){
            console.log('데이터베이스 오류');
        }
        else{
            return 0;
        }
    })
}

//지역코드를 요청함
const request_areacode = async function(connection,basedate,basetime){
    let code = [];
    await connection.query('SELECT area_code FROM local_information',async function(err, result){
        if(err){
            console.log('데이터베이스 오류');
        }
        else{
            for (let data of result){
                code.push(data.area_code);
            };
            for(let num in code){
                await request_body(connection,code[num],basedate,basetime);
            }
        }
    });
    return 0;
}

//API에 데이터를 요청
const request_body = async function(connection,code,basedate,basetime){
    await connection.query('SELECT grid_x,grid_y FROM local_information where area_code = ?',[code], function(err, result){ 
        if(err){
            console.log("잘못된 지역코드 입니다.");
        }
        else{
            /* API에 데이터 요청하기 위해 필요한 정보들 */
            const url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
            let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + process.env.API_KEY; /* Service Key*/
            queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); 
            queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1000'); 
            queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('JSON'); /* 데이터 형식 */
            queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(basedate); /* 날짜 */
            queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(basetime); /* 시간 */
            queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(result[0].grid_x); /* 지역 X 좌표 */
            queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(result[0].grid_y); /* 지역 Y 좌표 */

            request({
                url: url + queryParams,
                method: 'GET'
            },async function (err, response, body) {
                console.log(body);
                if(body != undefined){
                    let errorcode = await api_function.check_apierror(body);
                    if(errorcode != 0){
                        await error_insert(connection,errorcode,basedate,basetime,code);
                    }
                    else{
                        await api_function.save_data(body,code,connection,basedate,basetime);
                    }
                }
            });
        }
    });
    return 0;
}

//API에서 온 데이터에 오류가 있는지 확인함
const error_insert = async function(connection,error,basedate,basetime,code){
    let errorcode;

    if(error == 1){
        errorcode = -100;
    }
    else if(error == 2){
        errorcode = -101;
    }

    await connection.query('INSERT INTO weather_information (date,time,PTY,area_code) VALUES (?,?,?,?)',[basedate,basetime,errorcode,code],function(err, rows) {
        if (err) {
            console.log("에러");
        }
        else{
            console.log("Complete");
            return 0;
        }
    });
}

module.exports = {
    user_database:user_database,
    request_areacode:request_areacode,
    request_body:request_body,
    error_insert:error_insert,
    check_error:check_error
};