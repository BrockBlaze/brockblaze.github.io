fetch('https://api.openweathermap.org/data/2.5/weather?&lat=47.6579&lon=-117.4213&units=imperial&APPID=c837d202aac77367d90725ec4b9c7ce2')
    .then(function (response) {
        return response.json();
    })
    .then(function (jsObject) {

        console.log(jsObject);

        document.getElementById('temp').innerHTML = jsObject.main.temp;
       

        let imagesrc = 'http://openweathermap.org/img/w/' + jsObject.weather[0].icon + '.png';
        let desc = jsObject.weather[0].description;
        document.getElementById('icon').setAttribute('src', imagesrc);
        document.getElementById('icon').setAttribute('alt', desc);
        

    });