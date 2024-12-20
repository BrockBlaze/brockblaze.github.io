// connnect using XHR to JSON file
var requestURL = 'https://brockblaze.github.io/assignments/final/scripts/templedata.json';
var request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();

request.onload = function () {

    var templedata = request.response;
    var temples = templedata['temples'];

    for (var i = 0; i < temples.length; i++) {

        if (temples[i].name == 'Spokane' || temples[i].name == 'Seattle' || temples[i].name == 'Columbia River' || temples[i].name == 'Portland') {
            var myArticle = document.createElement('aside');
            var myH2 = document.createElement('h2');
            var myPara1 = document.createElement('p');
            var myPara2 = document.createElement('p');
            var myList1 = document.createElement('ul');
            var myList2 = document.createElement('ul');

            myH2.textContent = temples[i].name;
            myPara1.textContent = 'Services: ';

            var templedata = temples[i].services;
            for (var j = 0; j < templedata.length; j++) {
                var listItem = document.createElement('li');
                listItem.textContent = templedata[j];
                myList1.appendChild(listItem);
            }

            myPara2.textContent = 'Closures: ';


            var templedata = temples[i].closures;
            for (var j = 0; j < templedata.length; j++) {
                var listItem = document.createElement('li');
                listItem.textContent = templedata[j];
                myList2.appendChild(listItem);
            }
           
           
            var section = document.querySelector('section');

            myArticle.appendChild(myH2);
            myArticle.appendChild(myPara1);
            myArticle.appendChild(myList1);
            myArticle.appendChild(myPara2);
            myArticle.appendChild(myList2);
            

            section.appendChild(myArticle);
        }
    }

}