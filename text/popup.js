const popup = document.getElementById('popup-main')
var ctimer;

function makePopup(text){
    popup.style.right="0px"

    document.getElementById('popup-title').innerText=text.title;
    document.getElementById('popup-text').innerText=text.text;

    clearTimeout(ctimer)

    ctimer=setTimeout(reducePopup, 500);
}

async function reducePopup(){
    const cur = Number(popup.style.right.split("px")[0]);
    const amtToChange=(-(cur-10))/50
    popup.style.right = `${cur-amtToChange}px`
    if(cur > -270){
        ctimer=setTimeout(reducePopup, 5);
    }
}