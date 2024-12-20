let a = "";
let b = "";
let c = "";
let o = null;
let h = null;

let output = document.getElementById("output");

function button(nv) {
    if(o == null)
    {
        a += document.getElementById(nv).value;
        document.getElementById("output").innerHTML = a;
    }
    if(o != null)
    {
        b += document.getElementById(nv).value;
        document.getElementById("output").innerHTML = b;
    }
}

function operator(ov) {
    if (a != "" && b == "" && c == "")
    {
        h = document.getElementById("output").innerHTML;
        o = document.getElementById(ov).value;
        document.getElementById("history").innerHTML = h
        document.getElementById("output").innerHTML = o;
    }
    if (a != "" && b != "" && c != "")
    {  
        h = document.getElementById("output").innerHTML;
        o = document.getElementById(ov).value;
        document.getElementById("history").innerHTML = h
        document.getElementById("output").innerHTML = o;
        a = c.toString();
        b = "";
    }

}

function equals() {
    let x = parseInt(a);
    let y = parseInt(b);

    if (o == "+")
    {
        h = document.getElementById("output").innerHTML;
        c = x + y; 
        document.getElementById("history").innerHTML = h
        document.getElementById("output").innerHTML = c;
    }

    if (o == "-")
    {
        h = document.getElementById("output").innerHTML;
        c = x - y; 
        document.getElementById("history").innerHTML = h
        document.getElementById("output").innerHTML = c;
    }

    if (o == "*")
    {
        h = document.getElementById("output").innerHTML;
        c = x * y; 
        document.getElementById("history").innerHTML = h
        document.getElementById("output").innerHTML = c;
    }

    if (o == "/")
    {
        h = document.getElementById("output").innerHTML;
        c = x / y; 
        document.getElementById("history").innerHTML = h
        document.getElementById("output").innerHTML = c;
    } 
}

function clear() {
    window.location.reload();
}
