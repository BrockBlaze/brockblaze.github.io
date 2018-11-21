fetch('https://api.openweathermap.org/data/2.5/weather?&id=5604473&units=imperial&APPID=c837d202aac77367d90725ec4b9c7ce2')
  .then(function (response) {
    return response.json();
  })
  .then(function (jsObject) {

    console.log(jsObject);


    let temperature = parseFloat(document.getElementById('temp').innerHTML = jsObject.main.temp);
    let s = parseFloat(document.getElementById('windspeed').innerHTML = jsObject.wind.speed);
    let windchill = 35.74 + 0.6215 * temperature - 35.75 * Math.pow(s, .16) + .4275 * temperature * Math.pow(s, .16);


    document.getElementById("windchill").innerHTML = windchill.toFixed(1);
    
  });