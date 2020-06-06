var n1count = 1;
var m1count = 1;
var a1count = 1;
var h1count = 1;
var i1count = 1;

setInterval(Debug,1000);

function n1() {
    
    if (n1count == 0)
    {
        document.getElementById("n1").style.fontSize = "56px";
        document.getElementById("n1").innerHTML = "100";
    }
    if (n1count == 1)
    {
        document.getElementById("n1").style.fontSize = "24px";
        document.getElementById("n1").innerHTML = "This is a Question?";
    }
    if (n1count == 2)
    {
        document.getElementById("n1").innerHTML = "Answer";
    }
    if (n1count == 3)
    {
        document.getElementById("n1").innerHTML = "Done";
    }
    n1count ++;
}

function m1() {
    
    if (m1count == 0)
    {
        document.getElementById("m1").style.fontSize = "56px";
        document.getElementById("m1").innerHTML = "100";
    }
    if (m1count == 1)
    {
        document.getElementById("m1").style.fontSize = "24px";
        document.getElementById("m1").innerHTML = "This is a Question?";
    }
    if (m1count == 2)
    {
        document.getElementById("m1").innerHTML = "Answer";
    }
    if (m1count == 3)
    {
        document.getElementById("m1").innerHTML = "Done";
    }
    m1count += 1;
}

function a1() {
    
    if (a1count == 0)
    {
        document.getElementById("a1").style.fontSize = "56px";
        document.getElementById("a1").innerHTML = "100";
    }
    if (a1count == 1)
    {
        document.getElementById("a1").style.fontSize = "24px";
        document.getElementById("a1").innerHTML = "This is a Question?";
    }
    if (a1count == 2)
    {
        document.getElementById("a1").innerHTML = "Answer";
    }
    if (a1count == 3)
    {
        document.getElementById("a1").innerHTML = "Done";
    }
    a1count += 1;
}

function h1() {
    
    if (h1count == 0)
    {
        document.getElementById("h1").style.fontSize = "56px";
        document.getElementById("h1").innerHTML = "100";
    }
    if (h1count == 1)
    {
        document.getElementById("h1").style.fontSize = "24px";
        document.getElementById("h1").innerHTML = "This is a Question?";
    }
    if (h1count == 2)
    {
        document.getElementById("h1").innerHTML = "Answer";
    }
    if (h1count == 3)
    {
        document.getElementById("h1").innerHTML = "Done";
    }
    h1count += 1;
}

function i1() {
    
    if (i1count == 0)
    {
        document.getElementById("i1").style.fontSize = "56px";
        document.getElementById("i1").innerHTML = "100";
    }
    if (i1count == 1)
    {
        document.getElementById("i1").style.fontSize = "24px";
        document.getElementById("i1").innerHTML = "This is a Question?";
    }
    if (i1count == 2)
    {
        document.getElementById("i1").innerHTML = "Answer";
    }
    if (i1count == 3)
    {
        document.getElementById("i1").innerHTML = "Done";
    }
    i1count += 1;
}

function n1reset() {
    n1count = 0;
}

function m1reset() {
    m1count = 0;
}

function a1reset() {
    a1count = 0;
}

function h1reset() {
    h1count = 0;
}

function i1reset() {
    i1count = 0;
}

function Debug() {
    document.getElementById("debug").innerHTML = "";
}