fetch('https://api.openweathermap.org/data/2.5/weather?&id=5604473&units=imperial&APPID=c837d202aac77367d90725ec4b9c7ce2')
    .then(function (response) {
        return response.json();
    })
    .then(function (jsObject) {

        console.log(jsObject);

        document.getElementById('des').innerHTML = jsObject.weather[0].description;
        document.getElementById('des1').innerHTML = jsObject.weather[0].description;
        document.getElementById('temp').innerHTML = jsObject.main.temp;
        document.getElementById('hum').innerHTML = jsObject.main.humidity;
        document.getElementById('windspeed').innerHTML = jsObject.wind.speed;


        let imagesrc = 'http://openweathermap.org/img/w/' + jsObject.weather[0].icon + '.png';
        let desc = jsObject.weather[0].description;
        document.getElementById('weatherimage').innerHTML = imagesrc;
        document.getElementById('icon').setAttribute('src', imagesrc);
        document.getElementById('icon').setAttribute('alt', desc);
        

    });