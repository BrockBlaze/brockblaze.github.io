// connnect using XHR to JSON file
var requestURL = 'https://byui-cit230.github.io/weather/data/towndata.json';
var request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();

request.onload = function () {

    var townevents = request.response;
    var towns = townevents['towns'];

    for (var i = 0; i < towns.length; i++) {

        if (towns[i].name == 'Preston') {
            var myArticle = document.createElement('area');
            var myPara = document.createElement('p');
            var myList = document.createElement('ul');

            myPara.textContent = 'Events: ';

            var townevents = towns[i].events;
            for (var j = 0; j < townevents.length; j++) {
                var listItem = document.createElement('li');
                listItem.textContent = townevents[j];
                myList.appendChild(listItem);

                var area = document.querySelector('area');

                myArticle.appendChild(myPara);
                myArticle.appendChild(myList);

                area.appendChild(myArticle);


            }
        }
    }
}