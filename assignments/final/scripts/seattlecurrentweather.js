fetch('https://api.openweathermap.org/data/2.5/weather?&lat=47.6038&lon=-122.3301&units=imperial&APPID=c837d202aac77367d90725ec4b9c7ce2')
    .then(function (response) {
        return response.json();
    })
    .then(function (jsObject) {

        console.log(jsObject);

        document.getElementById('stemp').innerHTML = jsObject.main.temp;
       

        let imagesrc = 'http://openweathermap.org/img/w/' + jsObject.weather[0].icon + '.png';
        let desc = jsObject.weather[0].description;
        document.getElementById('sicon').setAttribute('src', imagesrc);
        document.getElementById('sicon').setAttribute('alt', desc);
        

    });