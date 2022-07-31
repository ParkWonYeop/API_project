//날짜 설정
const set_date = function(){
    let today = new Date();
    let year = (today.getFullYear()).toString(); // 년도
    let month = (today.getMonth() + 1).toString();  // 월
    let date = (today.getDate()).toString();  // 날짜

    if(today.getMonth()<9){
        month = "0"+month;
    }
    if(today.getDate()<10){
        date = "0"+date;
    }

    let base_date = year+month+date; /* 날짜 */

    return base_date
}

//시간설정
const set_time = function(){
    let today = new Date();
    let hours = (today.getHours()).toString();

    if(today.getHours()<10){
        hours = "0"+hours;
    }

    let base_time = hours+"00";

    return base_time;
}

//API에 에러가 있는지 체크
const check_apierror = async function(body){
    if(body.search("APPLICATION_ERROR") != -1){
        console.log("어플리케이션 에러");
        return 1;
    }
    else if(body.search("SERVICE ERROR") != -1){
        console.log("서비스에러");
        return 2;
    }
    else if(body.search("인증서비스 내부 오류") != -1){
        console.log("인증서비스 오류");
        return 2;
    }
    else{
        return 0;
    }
}

//데이터를 저장함
const save_data = async function(body,code,connection,basedate,basetime){

    let parser = []; /* Parsing 한 데이터를 저장할 배열 */

    /* JSON으로 받은 데이터를 Parsing함 */
    for(let idx = 0; idx < 8; idx++){
        let start = body.search('baseDate');
        let end = body.search('obsrValue');
        start = body.indexOf('{', start-5);
        end = body.indexOf('}', end);
        let data = body.substring(start,end+1);
        body = body.replace(data,"");
        parser[idx] = JSON.parse(data);
    }
                        
    //let date = parser[0].baseDate; /* 날짜 */
    //let time = parser[0].baseTime; /* 시간 */
    let pty; /* 강수상태 */
    let reh; /* 습도 */
    let rn1; /* 1시간 강수량 */
    let t1h; /* 기온 */
    let uuu; /* 동서바람성분 */
    let vec; /* 풍향 */
    let vvv; /* 남북바람성분 */
    let wsd; /* 풍속 */
                    
    /* 파싱한 JSON에서 데이터별로 뽑아서 정리 */
    for(let idx = 0 ; idx < 8;idx++){
        switch(parser[idx].category){
        case "PTY":
            pty = parser[idx].obsrValue;
            break;
        case "REH":
            reh = parser[idx].obsrValue;
            break;
        case "RN1":
            rn1 = parser[idx].obsrValue;
            break;
        case "T1H":
            t1h = parser[idx].obsrValue;
            break;
        case "UUU":
            uuu = parser[idx].obsrValue;
            break;
        case "VEC":
            vec = parser[idx].obsrValue;
            break;
        case "VVV":
            vvv = parser[idx].obsrValue;
            break;
        case "WSD":
            wsd = parser[idx].obsrValue;
            break;
        }
    }

    await connection.query('INSERT INTO weather_information (date,time,PTY,REH,RN1,T1H,UUU,VEC,VVV,WSD,area_code) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[basedate,basetime,pty,reh,rn1,t1h,uuu,vec,vvv,wsd,code],function(err, rows) {
        if (err) {
            console.log("에러");
        }
        else{
            console.log("Complete");
        }
    });

}
module.exports = {
    set_date:set_date,
    set_time:set_time,
    check_apierror:check_apierror,
    save_data:save_data
};