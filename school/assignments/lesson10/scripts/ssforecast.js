fetch('https://api.openweathermap.org/data/2.5/forecast?&id=5607916&units=imperial&APPID=c837d202aac77367d90725ec4b9c7ce2')
    .then(function (response) {
        return response.json();
    })
    .then(function (jsObject) {

        console.log(jsObject);

document.getElementById('forecast1').innerHTML = jsObject.list[0].main.temp;
document.getElementById('forecast2').innerHTML = jsObject.list[1].main.temp;
document.getElementById('forecast3').innerHTML = jsObject.list[2].main.temp;
document.getElementById('forecast4').innerHTML = jsObject.list[3].main.temp;
document.getElementById('forecast5').innerHTML = jsObject.list[4].main.temp;

});