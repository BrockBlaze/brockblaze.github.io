const htmlElem = document.querySelector("html");
const pElem = document.querySelector("p");
const imgElem = document.querySelector("img");


const bgcolorForm = document.getElementById("bgcolor");
const fontForm = document.getElementById("font");
const imageHeightForm = document.getElementById("imageheight");
const lastV = document.getElementById("lastVisit");



if (!localStorage.getItem("bgcolor")) {
  populateStorage();
} else {
  setStyles();
}

function populateStorage() {
  localStorage.setItem("bgcolor", bgcolorForm.value);
  localStorage.setItem("font", fontForm.value);
  localStorage.setItem("height", imageHeightForm.value);
  localStorage.setItem("lastVisitDate", new Date());
  setStyles();
}

function setStyles() {
    const currentColor = localStorage.getItem("bgcolor");
    const currentFont = localStorage.getItem("font");
    const currentimageHeight = localStorage.getItem("height");
    const currentlastVisit = localStorage.getItem("lastVisitDate");

    bgcolorForm.value = currentColor;
    fontForm.value = currentFont;
    imageHeightForm.value = currentimageHeight;
    lastV.value = currentlastVisit;

    htmlElem.style.backgroundColor = "#" + currentColor;
    pElem.style.fontFamily = currentFont;
    imgElem.setAttribute("src",`https://placekitten.com/200/${currentimageHeight}`);
    lastV.textContent = currentlastVisit;
}

function test()
{
  htmlElem.style.backgroundColor = "#" + bgcolorForm.value;
  pElem.style.fontFamily = fontForm.value;
  imgElem.setAttribute("src",`https://placekitten.com/200/${imageHeightForm.value}`);
  lastVisitDate.textContent = lastV.value;
}

bgcolorForm.addEventListener("change", populateStorage);
fontForm.addEventListener("change", populateStorage);
imageHeightForm.addEventListener("change", populateStorage);

