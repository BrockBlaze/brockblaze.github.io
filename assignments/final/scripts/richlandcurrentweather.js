fetch('https://api.openweathermap.org/data/2.5/weather?&lat=46.2778&lon=-119.277&units=imperial&APPID=c837d202aac77367d90725ec4b9c7ce2')
    .then(function (response) {
        return response.json();
    })
    .then(function (jsObject) {

        console.log(jsObject);

        document.getElementById('rtemp').innerHTML = jsObject.main.temp;
       

        let imagesrc = 'http://openweathermap.org/img/w/' + jsObject.weather[0].icon + '.png';
        let desc = jsObject.weather[0].description;
        document.getElementById('ricon').setAttribute('src', imagesrc);
        document.getElementById('ricon').setAttribute('alt', desc);
        

    });