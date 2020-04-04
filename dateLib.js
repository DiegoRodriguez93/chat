exports.Time = date => {return date.format("hh:mm:ss tt");}

exports.Date = function (date){

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let niceMonth = month < 10 ? "0"+month : month;
    let day = date.getDate() < 10 ? '0'+date.getDate() : date.getDate();

    return day+'/'+niceMonth+'/'+year ;

}

exports.dateTime = function (date){

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let niceMonth = month < 10 ? "0"+month : month;
    let day = date.getDate() < 10 ? '0'+date.getDate() : date.getDate();

    let hour = date.getHours() < 10 ? '0'+date.getHours() : date.getHours();
    let minute = date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes();

    if(month.length == 1){
        month = 0 + month;
    }

    if(day.length == 1){
        day = 0 + day;
    }

    if(hour.length == 1){
        hour = 0 + hour;
    }

    return day+'/'+niceMonth+'/'+year+' '+hour+':'+minute;

}
