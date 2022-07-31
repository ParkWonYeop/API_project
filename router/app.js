let express = require('express');
const mysql_function = require("../function/mysql_function.js");
let router = express.Router();

router.get('/main', function (req, res) {
    let connection = mysql_function.user_database();
    connection.query('SELECT area_code,County,City,longitude,latitude FROM local_information', function(err, result){ 
        if(err){
          res.send('잘못된 페이지입니다.');
        }
        else{
        let area_code = [];
        let county = [];
        let city = [];
        let longitude = [];
        let latitude = [];
        let idx = 0;
        let area_list = [];
        for (let data of result){
            area_list[idx] ={
                area_code : data.area_code,
                county : data.County,
                city : data.City,
                longitude : data.longitude,
                latitude : data.latitude,
            };
            area_code.push(data.area_code);
            county.push(data.County);
            city.push(data.City);
            longitude.push(data.longitude);
            latitude.push(data.latitude);
            idx++;
      };
      let set = new Set(county);
      let county_list = [...set];
      let gangwon = [];
      let gyeonggi = [];
      let gyeongsangnam = [];
      let gyeongsangbuk = [];
      let gwangju = [];
      let daegu = [];
      let daejeon = [];
      let busan = [];
      let seoul = [];
      let sejong = [];
      let ulsan = [];
      let incheon = [];
      let jeonnam = [];
      let jeonbuk = [];
      let jeju = [];
      let chungbuk = [];
      let chungnam = [];

      for(let num in city){
        if(county[num]=="강원도"){
            gangwon.push(city[num]);
        }
        else if(county[num]=="경기도"){
            gyeonggi.push(city[num]);
        }
        else if(county[num]=="경상남도"){
            gyeongsangnam.push(city[num]);
        }
        else if(county[num]=="경상북도"){
            gyeongsangbuk.push(city[num]);
        }
        else if(county[num]=="광주광역시"){
            gwangju.push(city[num]);
        }
        else if(county[num]=="대구광역시"){
            daegu.push(city[num]);
        }
        else if(county[num]=="대전광역시"){
            daejeon.push(city[num]);
        }
        else if(county[num]=="부산광역시"){
            busan.push(city[num]);
        }
        else if(county[num]=="서울특별시"){
            seoul.push(city[num]);
        }
        else if(county[num]=="세종특별자치시"){
            sejong.push(city[num]);
        }
        else if(county[num]=="울산광역시"){
            ulsan.push(city[num]);
        }
        else if(county[num]=="인천광역시"){
            incheon.push(city[num]);
        }
        else if(county[num]=="전라남도"){
            jeonnam.push(city[num]);
        }
        else if(county[num]=="전라북도"){
            jeonbuk.push(city[num]);
        }
        else if(county[num]=="제주특별자치도"){
            jeju.push(city[num]);
        }
        else if(county[num]=="충청북도"){
            chungbuk.push(city[num]);
        }
        else if(county[num]=="충청남도"){
            chungnam.push(city[num]);
        }
      }

      connection.query('SELECT * FROM weather_information', function(err, results){ 
        if(err){
          res.send('잘못된 페이지입니다.');
        }
        else{
            let j = 0;
            let weather_list = [];
            for (let data of results){
                weather_list[j] ={
                    area_code : data.area_code,
                    date : data.date,
                    time : data.time,
                    PTY : data.PTY,
                    REH : data.REH,
                    RN1 : data.RN1,
                    T1H : data.T1H,
                    UUU : data.UUU,
                    VVV : data.VVV,
                    VEC : data.VEC,
                    WSD : data.WSD
                };
                j++
            }
            res.render('main',{area_code : area_code, County2 : county_list,City : city ,longitude:longitude,latitude:latitude,
                gangwon:gangwon, gyeonggi:gyeonggi, gyeongsangnam:gyeongsangnam, gyeongsangbuk:gyeongsangbuk,gwangju:gwangju,
                daegu:daegu,daejeon:daejeon, busan:busan ,seoul:seoul,sejong:sejong,ulsan:ulsan,incheon:incheon,jeonnam:jeonnam,
                jeonbuk:jeonbuk,jeju:jeju,chungnam:chungnam,chungbuk:chungbuk,areaList:area_list,weatherList:weather_list});
            connection.end();
        }});
      
    }
    })
});

module.exports = router;