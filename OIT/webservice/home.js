const main = document.querySelector('.main');
let Mname = "";
let con = document.getElementById("SearchResults");

async function getMovies(Mname)
{
    con.innerHTML = ``;
    let res = await fetch(`${movie_search}?api_key=${api_key}&query=${Mname}`)
    if (res.ok)
    {
        let data = await res.json();
        let results = data.results;
        console.log(data);
        console.log(results[1]);
        makeSearchResults(results);
    }
}

function getName()
{
    let Mname = document.getElementById('Mname').value;
    getMovies(Mname)
}



function makeSearchResults(results)
{
    con.innerHTML += `
    <div class="movie-list">


        <h1 class="movie-category">Search Results</h1>

        <div class="movie-container" id="${results.id}">
        </div>

    </div>
    `;
    makeNameCards(results);
}

function makeNameCards(results)
{
    let i = 0;
    while (i < 10)
    {
        con.innerHTML += `
        <div class="movie" onclick="location.href = '/${results[i].id}'">
            <img src="${img_url}${results[i].backdrop_path}" alt="">
            <p class="movie-title">${results[i].title}</p>
        </div>
        `;
        i++
    }
    

}
