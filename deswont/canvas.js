const c = document.getElementById('canvas')
const eqe = document.getElementById('eq-box')//equation element
const eqc = document.getElementById('eq-color')//equation color
const ctx = c.getContext("2d")
var mS = 1;
var tS = 1;

c.addEventListener('mousemove', function(e){if(e.buttons==1){moveCam({x:e.movementX*-cv.sx,y:e.movementY*cv.sy})}})// drag to move
c.addEventListener('wheel', function(e){const f=1+0.1*Math.atan(0.04*e.deltaY);moveCam({sx:f,sy:f});e.preventDefault();return false;},false)

var cv = {// camera/canvas values
    xo: 0,// x offset (ie, center of canvas is at x=xo)
    yo: 0,// y offset
    sx: 0.01,// x scaling factor
    sy: 0.01// y scaling factor
};// camera view

function drawBacking(){
    ctx.moveTo(0,0)
    c.width=c.clientWidth;
    c.height=c.clientHeight;

    // background #111
    ctx.fillStyle="#111"
    ctx.fillRect(0,0,c.width,c.height)

    const scaleX = Math.round(Math.log10(cv.sx))+2;
    const scaleY = Math.floor(Math.log10(cv.sy)+0.2)+2;

    const iX = Math.pow(10, scaleX)
    const iY = Math.pow(10, scaleY)

    const startX = Math.floor((cv.xo-cv.sx*700)/iX);
    const startY = Math.floor((cv.yo-cv.sy*400)/iY);

    for(var i = startX;i<startX+70;i++){// x axis gradation
        const a = nTC(i*iX, 0);

        ctx.fillStyle="#333"// guide lines
        ctx.fillRect(a.x-1, 0, 2, c.height)


        ctx.fillStyle="#aaa"// ticks
        ctx.fillRect(a.x-1, a.y-6, 2, 12)
        ctx.fillText(Number((i*iX).toPrecision(11)), a.x+4,a.y+14)
    }
    for(var i = startY;i<startY+50;i++){// y axis
        const a = nTC(0, iY*i);

        ctx.fillStyle="#333"// guides
        ctx.fillRect(0,a.y-1, c.width, 2)

        ctx.fillStyle="#aaa"// ticks
        ctx.fillRect(a.x-6, a.y-1, 12, 2)
        ctx.fillText(Number((i*iY).toPrecision(11)), a.x+4,a.y+14)
    }

    // x and y axes
    ctx.fillStyle="#aaa"
    ctx.fillRect(0, nTC(0, 0).y-1, c.width, 2)
    ctx.fillStyle="#aaa"
    ctx.fillRect(nTC(0,0).x-1, 0, 2, c.height)


    // drawPoint(1, 1)
    // drawPoint(2, 1)
    // drawPoint(3, 1)
    // drawPoint(4, 1)
}

function drawPoint(x, y){// takes numberspace
    ctx.fillStyle=eqc.value
    const a = nTC(x, y);
    ctx.fillRect(a.x-1, a.y-1, 2, 2)
}

function moveCam(by){
    if(by.x!=undefined){cv.xo+=by.x}
    if(by.y!=undefined){cv.yo+=by.y}
    if(by.sx!=undefined){cv.sx*=by.sx}
    if(by.sy!=undefined){cv.sy*=by.sy}
    
    draw()
}

function draw(){
    drawBacking()
    plot()
    eqe.style.color=eqc.value;
}
window.onresize=draw;


function plot(){
    const eq = processText(eqe.innerText)
    drawBacking()
    ctx.beginPath()
    // try{x=0.13;eval(eq)}catch(e){console.log("bad eq, "+e);return}// evaluated at x=0.13 so that ones that dont work on 0 or 1 or wtv still are valid

    const ns = cTN(0, 0);// numberspace
    const cs = nTC(ns.x, evaluate(eq,ns.x));// canvasspace of point

    ctx.moveTo(cs.x,cs.y)
    // ctx.moveTo(0,0)
    ctx.strokeStyle=eqc.value

    var prev=0;

    for(var i = 0; i < c.width; i ++){
        const ns = cTN(i, 0);// numberspace
        const cs = nTC(ns.x, evaluate(eq,ns.x));// canvasspace of point
        // drawPoint(ns.x, evaluate(eq, ns.x))

        if(Math.abs(cs.y-prev)>500&&(cs.y*prev)<0){
            ctx.moveTo(cs.x,cs.y)// jump if the pixel change is greater than 500 and sign change (to deal w asymmetrical asymptotes)
        }else{
            ctx.lineTo(cs.x,cs.y);// otherwise draw a smooth line
        }
        prev=cs.y;
    }
    ctx.stroke()
}

draw()
