var n1count = 0;

function n1() {
    document.getElementById("n1").innerHTML = "This is a Question?";
    document.getElementById("n1").style.fontSize = "24px";
    n1count += 1;
    if (n1count >= 2)
    {
        document.getElementById("n1").innerHTML = "Answer";
    }
}

function Debug() {
    document.getElementById("debug").innerHTML = "";
}