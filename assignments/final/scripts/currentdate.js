    
    var d = new Date();
    var weekday = new Array(7);
    weekday[0] = "Sun";
    weekday[1] = "Mon";
    weekday[2] = "Tue";
    weekday[3] = "Wed";
    weekday[4] = "Thu";
    weekday[5] = "Fri";
    weekday[6] = "Sat";

    var month = new Array(11);
    month[0] = "Jan.";
    month[1] = "Feb.";
    month[2] = "Mar.";
    month[3] = "Apr.";
    month[4] = "May.";
    month[5] = "Jun.";
    month[6] = "Jul.";
    month[7] = "Aug.";
    month[8] = "Sep.";
    month[9] = "Oct.";
    month[10] = "Nov.";
    month[11] = "Dec.";


    var n = weekday[d.getDay()];
    var m = month[d.getMonth()];
    var thedate = n + ", " + d.getDate() + " " + m + " " + d.getFullYear();
    var year = d.getFullYear();
    var day = n;
    document.getElementById("date").innerHTML = year;

