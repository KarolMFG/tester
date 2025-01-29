
// we ballign
function modifyList(input, amount){

    for(var i = 0; i < input.length;i++){
        if(typeof input[i] == 'object'){
            // console.log("objec")
            input[i] = modifyList(input[i], amount);
        }else{
            // console.log("num")
            // console.log(input[i])
            if(Math.random()<(amount>1?0.1:0.01)){
            input[i] += (Math.random()*amount - amount/2);
            input[i] = Math.atan(input[i])
            }
            // console.log(input[i])
        }
    }
    return input;
}

function averageList(input){
    sum = 0;
    for(var i = 0; i < input.length;i++){
        if(typeof input[i] == 'object'){
            // console.log("objec")
            sum += averageList(input[i]);
        }else{
            // console.log("num")
            // console.log(input[i])
            sum+=input[i];
            // console.log(input[i])
        }
    }
    return sum / 100;// close neough to av, dont actually care
}

function copy(object){
    return JSON.parse(JSON.stringify(object))
}

function normalizeValues(values){
    // takes [x1, x2, x3...]
    // gives [o1, o2, o3...] squashed to -1 -> 1
    var output = [];
    for(var i = 0; i < values.length;i ++){
        output.push(Math.atan(values[i])*0.637);// close enough to 2/pi
    }

    return output;

}

function evaluateWeights(inputs, weights){
    // inputs of the form [x1, x2, x3...]
    // weights of the form [
        // [bias, w1, w2, w3...], 
        // [bias, w1, w2, w3...], 
        // [bias, w1, w2, w3...], 
        // ...
    // ]
    // returns the form [o1, o2, o3...]

    // does not need inputs and outputs to be same length,
    // but does need weights[k].length == inputs.length+1

    var output = [];// output is added to per weight set

    for(var i = 0; i < weights.length; i ++){
        toAdd = weights[i][0];// bias
        for(var ii = 0; ii<inputs.length;ii++){
            toAdd += inputs[ii] * weights[i][ii+1];
        }
        output.push(toAdd);
    }

    return output;
}

// testing (difficult to conceputlaize)
var testWeights = [// this layer takes 3, outs 3
    [0, 1, 1, 1],
    [0, 2, 0, 0],
    [3, 0, 0, 0]
];
var testInput = [5, 9, 2];
// console.log(evaluateWeights(testInput, testWeights));// all works, so far

function inputToOutput(inputs, weightSet){
    // takes inputs in the form [x1, x2, x3...]
    // takes weightset in the form [
        // [
        //     [bias, w1, w2, w3...],
        //     [bias, w1...]
        //     ...
        // ],
        // [
        //     <as above>
        // ]
        // ...
    // ]
    // outputs in the form [o1, o2, o3...]
    workingLayer = copy(inputs)//copy(inputs));// jank, so they are not linked up, though linkup should be fine (this is only a theoretical problem idk)

    for(var i = 0; i < weightSet.length;i++){
        workingLayer = evaluateWeights(copy(workingLayer), weightSet[i])
    }

    return processOutput(normalizeValues(workingLayer))//copy(workingLayer));// this decoupling is probably necessary, but will enable later if needed :)
}

// var testWeightSet = [copy(testWeights), copy(testWeights), [[0, 1, 1, 1], [0, 1, 1, 1]]]; // looks to work, these models are small enough i can verify them by hand
// console.log(inputToOutput([1, 1, 1], testWeightSet));

function generateRandomWeights(){
    // specs for game ai:
    // inputs: 13 nodes
    // hidden layer 1: 6 nodes (arbitrary)
    // hidden layer 2: 6 nodes (arbitrary)
    // outputs: 4 nodes

    // weightset:
    //  weights 1: 6 x (13 + bias)
    //  weights 2: 6 x (6 + bias) (removed)
    //  weights 3: 4 x (6 + bias)
    var output = [];
    var toAdd = [];
    for(var i = 0; i<6;i++){
        toAddi = [];
        for(var ii = 0; ii < 14; ii ++){
            // toAddi.push(Math.random()-0.5);
            toAddi.push(0);
        }
        toAdd.push(toAddi);
    }
    output.push(toAdd);

    // toAdd = []; // extra layer, prob not needed
    // for(var i = 0; i<6;i++){
    //     toAddi = [];
    //     for(var ii = 0; ii < 7; ii ++){
    //         toAddi.push(Math.random()-0.5);
    //     }
    //     toAdd.push(toAddi);
    // }
    // output.push(toAdd);

    toAdd = [];
    for(var i = 0; i<4;i++){
        toAddi = [];
        for(var ii = 0; ii < 7; ii ++){
            // toAddi.push(Math.random()-0.5);
            toAddi.push(0);
        }
        toAdd.push(toAddi);
    }
    output.push(toAdd);

    return output;
}

function processOutput(input){// takes in [x1, x2...] and gives bool array (0.5+ threshold)
    var output = [];
    for(var i = 0; i < input.length; i ++){
        output.push((input[i]>0.5));
    }
    return output;
}

// var fullTestInputs = [0.2, 0, 0, 0, 1, 0.2, 0, 0, 0, 0.8, 0, 0, 0];

// var fullTestWeightSet = generateRandomWeights();
// console.log(inputToOutput(fullTestInputs,fullTestWeightSet));
// fullTestWeightSet = modifyList(copy(fullTestWeightSet), 0.3);// need copy
// console.log(inputToOutput(fullTestInputs,fullTestWeightSet));




const groundHeight = 360;

const pBMR = 0.2;//player ball mass ratio (0.2 = player moves 20% the required distance, ball moves 80%)
const pMT = 0.1;//player momentum transfer
const width = 640;const height = 360;

var pD = 0;// point differential (red +, yellow -) (NOT p. Diddy)
var p1score = 0;
var p2score = 0;

var speedFactor = 1;

abs = function(x){
    if(x<0){return -x;}
    return x;
}

var Player = function(id, respawnLoc, getInputs, options = {difficulty:0}){
    return {
        w: false,
        a: false,
        s: false,
        d: false,
        e: false,
        hx: respawnLoc.x,
        hy: respawnLoc.y,
        id: id,
        x: 320,
        y: 180,
        r: 15,
        vx: 0,
        vy: 0,
        isGrounded: false,
        extra: options,
        airTimer: 0,
        update: function(){
            this.x+=this.vx * speedFactor;
            this.y+=this.vy * speedFactor;
            if(this.x > 660){this.x=-20;}
            if(this.x < -20){this.x=660;}
            const dragFactor = (1-speedFactor*0.03);
            this.vx*=dragFactor;
            this.vy*=dragFactor;
            this.vy+=0.4*speedFactor;

            if(this.y+this.r>groundHeight){
                //within 25px of ground and going down is enough for ball slam (allowing for chained)
                if(this.isGrounded==false&&this.vy > 11.5 && abs(by-(groundHeight-br))<25 && bvy>=-0.5){
                    bvy*=10;bvy+=Math.max(0,144-(abs(this.x-bx)));
                }//pushed down so it bounces, and if its already going down it goes muy fast

                this.y=groundHeight-this.r;
                this.vy=0;
                this.isGrounded = true;
                this.airTimer = 0;
            }

            this.airTimer+=1*speedFactor;
            if(this.airTimer>60){this.isGrounded=false;}

            var horizontalFactor = !!(this.d)-!!(this.a);//scuffed type manipulation
            
            if(this.isGrounded){
                this.vx*=(1-speedFactor*(1-
                    0.9*Math.min((abs(0.3*this.vx)+0.7),1-Math.atan(abs(this.vx)/500))
                ));
                const speed = 0.7;
                this.vx+=horizontalFactor*speed*speedFactor;
                if(this.w){if(this.y+this.r!=groundHeight){this.isGrounded=false;this.vx+=horizontalFactor*(Math.abs(this.vx)+2);}this.vy-=9;this.y-=1;}
            }
            if(this.s){
                if(this.vy < 12){
                    this.vy+=10.5;// why not
                }
                this.isGrounded=false;
            }

            // if(ainput[this.e]){this.x = this.hx;this.y = this.hy;}
            

        },
        doCollisions: function(){
            var bdist2p = Math.sqrt((bx-this.x)*(bx-this.x) + (by-this.y)*(by-this.y));// b dist to player
            if(bdist2p < br+this.r){
                var bang2p = Math.atan2(by-this.y, bx-this.x);//b angle
                var dx = Math.cos(bang2p) * -(bdist2p-(br + this.r));
                var dy = Math.sin(bang2p) * -(bdist2p-(br + this.r));
                
                this.vx+=dx*-pBMR*speedFactor;this.x+=dx*-pBMR*speedFactor;
                this.vy+=dy*-pBMR*speedFactor;this.y+=dy*-pBMR*speedFactor;

                bvx += dx * (1-pBMR);bx+=dx * (1-pBMR) * speedFactor;
                bvy += dy * (1-pBMR);by+=dy * (1-pBMR) * speedFactor;
                bcol++;
                bvx += this.vx*0.2*speedFactor;
                bvy += this.vy*0.2*speedFactor;
                
            }
        },
        decideInputs: getInputs

    };
}

var bx,by,bvx,bvy;
var br = 12;
var bcol = 0;

var starts = [{x:40,y:250},{x:600,y:250}];
const aiinput = function(){// player two, ai
this.w=false;this.a=false;this.s=false;this.d=false;this.e=false;
// code to decide whether w,a,s,d should be pressed
//e is deprecated

var otherplayerx = -1000;
var otherplayervx;
for(var i = 0; i < players.length;i++){
if(players[i].id!=this.id){
    if(abs(players[i].x-this.x)<abs(this.x-otherplayerx)){
        otherplayerx=players[i].x;
        otherplayervx=players[i].vx;
    }
}
}

const isRight = this.hx > 640/2;// true if ai defending to the right, false otherwise

var desiredx = bx + (isRight? br-5 : -br+5);

if((abs(bx-this.hx) > 150)||// if the ball is away from home, attack
((isRight && otherplayerx > bx)||// or if the player is not on the right side of the ball, attack
(!isRight && otherplayerx < bx))||
((isRight && otherplayerx + otherplayervx * 20 + 300 < this.x)||// or if the player is 300px away from this in the attacking direction
(!isRight && otherplayerx + otherplayervx * 20 - 300 > this.x))//false
){

// if attacking and player further from ball than 300px in attacking direction
// jump to initiate pinch
if(
    (isRight && abs(otherplayerx-(bx-150))>300)||(!isRight && abs(otherplayerx-(bx+150)>300)) && this.extra.difficulty > 0 // only on medium and higher
){
    if(abs(this.x-desiredx)<100 && by+br==groundHeight){// if close enough to justify a jump, and the ball is grounded
        if(this.y+this.r==groundHeight){// jump
            this.w=true;
        }
    }   
}

}else{// defending

if(isRight){
    desiredx = Math.min(Math.max(this.hx, bx+10),640);
}else{
    desiredx = Math.max(Math.min(this.hx, bx-10),0);
}
if(abs(this.hx-this.x)<100){// if in position ish
    if(by < this.y && bvy < -2){// jump if ball is up, and going up
        if(this.y+this.r==groundHeight){// jump
            this.w=true;
        }
        if(by < this.y - 30 && by + bvy*10 < this.y + this.vy*10){
            desiredx=this.x;// prevent sideways motion
            this.w = true;// if ball is above and moving upwards faster
        }
    }

    if(abs(otherplayerx - this.x) > 200){// if player is away
        desiredx = bx + (isRight? 40 : -40);
    }
}



}

// if above ball, line xs
if(this.y < by - 20){
desiredx = bx + (isRight? br-5 : -br+5)// + (this.y-by)*0.1*(isRight?1:-1); // adjust desiredx to account for travel time during slam

if(// if the linear extension of current x according to vx is within a tolerance of a quarter radius of the target point
    abs((bx + bvx*((this.y-by)/14) + (isRight? br : -br))-(// if vx 3 in that direction would hit well
        this.x + (this.vx < 0? -4:4)*((this.y-by)/14)
    ))<br/4+this.r/4 &&
    ((isRight && bx < this.x)||(!isRight && bx > this.x))// ball is on attacking side
){
    this.s=true;// slam
}
}

if(
((this.y + 10*this.vy + 40 < by + 10*bvy || by + bvy*10 < this.y + 10*this.vy - 200) 
|| abs(this.x-bx) > 30*(this.vx+bvx)) && 
(!this.isGrounded&&this.y < groundHeight-100)
){

    this.s=true;// no floating around, we stay on the ground in this zone

}

// if in air, and ball is diagonally to the up-attack dir, double jump into ball
if((this.y + this.r != groundHeight)&&this.isGrounded&&// is in air (double jump)
((isRight && bx < this.x)||(!isRight && bx > this.x))&&// ball is in attacking direction
(this.y+this.vy*5 > by+bvy*5)&&// ball is above
(abs((0.7)-abs((this.y+this.vy*5 - by - bvy*5)/(this.x+this.vx*5 - bx - bvx*5)))<0.05)&&// slope between this and ball is around 0.7, given that vx is 3
(abs(this.vx) > 2)// and already has sizeable momentum (doesnt account for directino but shhhhhhhh)
){
this.w=true;if(isRight){this.a=true;}else{this.d=true;}
}
// console.log((isRight && bx < this.x)||(!isRight && bx > this.x)) // checking if attack direction code is correct
// if on ground, and ball is real high
if((this.y + this.r == groundHeight)&&// is on ground
((isRight && bx < this.x)||(!isRight && bx > this.x))&&// ball is in attacking direction
(this.y+this.vy*5 > by+bvy*5 + 30)&&// ball is above
(abs((2*abs(this.vx)/3)-abs((this.y+this.vy*5 - by - bvy*5)/(this.x+this.vx*5 - bx - bvx*5)))<1)&&// slope between this and ball is around 2, given that vx is 3 (high tolerance)
(abs(this.vx) > 1)){// and already has some momentum (doesnt account for directino but shhhhhhhh
this.w=true;// hawk jump
desiredx=bx;// seek on that thang
}

// if ball is directly above, air dribble
if((this.y+this.vy*5 > by+bvy*5)&&// ball is above
(by + 40 > this.y)&&(// but not by that much
(isRight && bx < this.x)||(!isRight && bx > this.x))&&// in attacking direction
(this.y < groundHeight - 50)&&// and above ground
(abs(this.vy)<3&&abs(bvy)<3)// and both are not doing crazy vy
){
this.w = true;// jump and dribble
desiredx=bx;
}

// if ball is above and to the left (ie, right after a challenge), jump into it
if(
((isRight && bx < this.x && this.x < bx + 20)||(!isRight && bx > this.x && this.x > bx - 20))&&
(by+20 < this.y && this.y < by+30)
){
this.w = true;
desiredx = bx;
}

if(// if its joever, attempt screenwrap
(abs(otherplayerx-bx) < abs(this.x -  bx))&&// if the player is closer to the ball and youre not in the way to defend
((isRight && otherplayerx > this.x) ||
(!isRight && otherplayerx < this.x)) &&
this.extra.difficulty > 0// only for medium and above ai, easy doesnt attempt screenwrap
){// do a 180 to screenwrap
desiredx = (isRight? -50 : 690);// 50 offscreen (so wavedash works alright)
}


if(abs(this.x-desiredx)>5){// only go if not within 5 px, to avoid jittering

if(desiredx < this.x){
    this.a=true;
}
if(desiredx > this.x){
    this.d=true;
}

// wavedash (actually insane, not fair at all)
if(this.extra.difficulty > 1){
    if(abs(this.x-desiredx) > 200 && abs(otherplayerx-bx) > 80){// if far away, and player is not in balling range, wavedash
        if(this.isGrounded){
            this.w = true;
        }else if(this.y+this.r < groundHeight-10 && !this.isGrounded){
            this.s = true;
        }
    }
}

if(Math.random() < 0.05 * Math.max(0, 3-this.extra.difficulty)){this.a=false;}// randomness for ai
if(Math.random() < 0.05 * Math.max(0, 3-this.extra.difficulty)){this.d=false;}
if(Math.random() < 0.05 * Math.max(0, 3-this.extra.difficulty)){this.s=false;}
if(Math.random() < 0.05 * Math.max(0, 3-this.extra.difficulty)){this.w=false;}

}



if(abs(this.y-by)<25&&// if ys are within 25px and the ball is within the 20px away to the defensive side
    ((isRight&&abs(this.x-(bx+10))<20)||(!isRight&&abs(this.x-(bx-10))<20))
){
if(isRight){d=false;}else{a=false;}// cancel back to defense movement
// console.log("cancelled to safety")
}
if(// jump if would otherwise push the ball backwards
    (isRight && bx > this.x && bx + 10*bvx < this.x + 100 && by+br > groundHeight-10) ||
    (!isRight && bx < this.x && bx + 10*bvx < this.x - 100 && by+br > groundHeight-10)
){
if(this.y+this.r==groundHeight){// jump
    this.w=true;
}
}


if(this.extra.difficulty == 0){
this.s = false;// no slam
if(this.isGrounded && this.y+this.r < groundHeight){this.w=false;}// no double jump
}



}

const nninput = function(){// neural net input
    this.w=false;this.a=false;this.s=false;this.d=false;this.e=false;
    const isRight = this.hx > 640/2;// true if ai defending to the right, false otherwise
    // inputs:
    // xpos, ypos, vx, vy, isgrounded, bx, by, bvx, bvy, opxpos, opypos, opvx, opvy
    var inputs = [];// 1 in inputspace = 100px
    inputs.push(
        isRight?(width-this.x)/100 : this.x/100
    );
    inputs.push((groundHeight-this.y)/100);
    inputs.push(this.vx * (isRight?-1:1));
    inputs.push(this.vy);
    inputs.push(this.isGrounded?1:0);
    if(abs(this.x-bx)>width/2){// respect wraparound
        inputs.push(-(width-(
            isRight?(this.x-bx):(bx-this.x)
        ))/100);
    }else{
        inputs.push(
            isRight?(this.x-bx)/100:(bx-this.x)/100
        );
    }   
    inputs.push((this.y - by)/100);
    inputs.push(bvx * (isRight?-1:1));
    inputs.push(bvy);
    var otherplayerx = -1000;
    var otherplayery;
    var otherplayervy;
    var otherplayervx;
    for(var i = 0; i < players.length;i++){
        if(players[i].id!=this.id){
            if(abs(players[i].x-this.x)<abs(this.x-otherplayerx)){
                otherplayerx=players[i].x;
                otherplayervx=players[i].vx;
                otherplayervy=players[i].vy;
                otherplayery=players[i].y;
            }
        }
    }
    inputs.push(
        isRight?(otherplayerx)/100 : (width-otherplayerx)/100
    );
    inputs.push((groundHeight-otherplayery)/100);
    inputs.push(otherplayervx * (isRight?-1:1));
    inputs.push(otherplayervy);

    if(halt){console.log(inputs)
        console.log(inputs[5])
    }

    const outputs = inputToOutput(inputs, this.extra.weights);

    this.w=outputs[0];
    this.a=isRight?outputs[1]:outputs[3];
    this.s=outputs[2];
    this.d=isRight?outputs[3]:outputs[1];

    // console.log(outputs)


}

// var players = [Player(0,starts[0],aiinput,{difficulty:1}),Player(1,starts[1],aiinput, {difficulty:0})];
var players = [];

// players.pop();// get rid of ai for testing


// init code (not much)

function init(){
    for(var i = 0; i < players.length;i++){
        players[i].x = players[i].hx;
        players[i].y = players[i].hy;
        players[i].vx = 0;
        players[i].vy = 0;
        players[i].isGrounded = false;
    }
    bvx = 0;bvy = -5;bx=320;by=250;
}


function runFrame(){

            bx+=bvx*speedFactor;by+=bvy*speedFactor;
            bvy+=0.3*speedFactor;
            if(by+br>groundHeight){by=groundHeight-br;bvy = Math.min(0, Math.max(-0.5*bvy + 0.4,-Math.sqrt(Math.max(0,bvy))));}
            bvx*=(1-0.03*speedFactor);
            bvy*=(1-0.03*speedFactor);

            for(var i = 0;i<players.length;i++){
                players[i].doCollisions();
            }

            

            if(bcol==players.length&&bcol!=1){bvy=-5*speedFactor;bvx=(320-bx)*0.02*speedFactor;}


            if(bx < 0){pD--;p2score++;init();}// removed init() call, caused issues (undid)
            if(bx > 640){pD++;p1score++;init();}


            bcol = 0;

            for(var i = 0;i<players.length;i++){

                players[i].decideInputs();
                players[i].update();

                // var bdist2p = sqrt((bx-players[i].x)*(bx-players[i].x) + (by-players[i].y)*(by-players[i].y));// b dist to player
                // if(bdist2p < br+players[i].r){
                //     var bang2p = atan2(by-players[i].y, bx-players[i].x);//b angle
                //     var dx = cos(bang2p) * -(bdist2p-(br + players[i].r));
                //     var dy = sin(bang2p) * -(bdist2p-(br + players[i].r));
                //     dx*=(1-pBMR);dy*=(1-pBMR);
                //     bvx+=dx;bx+=dx;
                //     bvy+=dy;by+=dy;
                //     bvx += players[i].vx * pMT;
                //     bvy += players[i].vy * pMT;
                // }

            }

        };

// players = [Player(0,starts[0],aiinput,{difficulty:1}),
// Player(1, starts[1],nninput, {weights:generateRandomWeights()})];



function testRelativeFitness(player1, player2){
    players = [
        player1, player2
    ]
    init();
    var frames = 0;
    while(frames < 1000 && p1score == 0 && p2score == 0){
        frames++;
        runFrame();
    }
    if(p1score > 0){p1score=0;return 1;}
    if(p2score > 0){p2score=0;return 2;}
    return -1;// if neither won
}

function getFitnessAtFrame(player){
    const isRight = (player.hx > 320);
    var fitness = 0;
    if(player.y < groundHeight-30){
        fitness+=0.05*(abs(player.vy));
        fitness+=0.1*(1 -0.05*abs(player.x-bx));
    }

    // fitness+=0.3*(1-0.05*abs(players[id].x-bx));
    // fitness += -0.1*abs(player.x-bx);// get to ball
    const closerWrap = abs(player.x-bx) > width/2
    const distToBall = (closerWrap ? width - abs(player.x-bx) : abs(player.x-bx));// wrap around distance (to promote wraparound)
    fitness -= 0.4*distToBall;

    if((isRight?player.x > bx:player.x<bx)){fitness+=50;}// assuming isRight, which is true as of now
    if(player.d){fitness+=(isRight?2:10);}
    if(player.a){fitness+=(isRight?10:2);}
    fitness += ((isRight?width-bx:bx) / 20);
    if((isRight?player.x > bx:player.x<bx)){
        // fitness+=3*(closerWrap?-1:1)*(player.vx);
        if((isRight && player.vx < 0)||(!isRight && player.vx > 0)){
            fitness+=10*abs(player.vx);
        }else{
            fitness-=10*abs(player.vx);
        }
    }

    return fitness;
}

function testFitness(weights){
    players = [
        (Math.random() < 0.2 ? 
        Player(0, starts[0], aiinput, {difficulty:0}):
        Player(0, starts[0], function(){
            this.a=false;this.d=false;this.w=false;this.s=false;// stationary
        }, {difficulty:0})
        ),
        Player(1, starts[1], nninput, {weights:weights})
    ];

    var fitness = 0;

    init();
    var frames = 0;
    const id = 1;
    while(frames < 1000){
        frames++;
        runFrame();
        fitness+=getFitnessAtFrame(players[id]);

        if(Math.random()<0.01){
            by = Math.random()*groundHeight;
            bx = Math.random()*width;
            players[0].x = Math.random()*width;
            players[0].y = Math.random()*groundHeight;
            players[1].x = Math.random()*width;
            players[1].y = Math.random()*groundHeight;

        }

    }
    fitness-=5000*p1score;
    fitness+=5000*p2score;
    p1score=0;
    p2score=0;
    return fitness;
}

var halt = false;
function haltNow(){halt=true;}

async function trainFor(iterations, starting){
    const start = Date.now();
    var currentWeights = starting;
    var currFitness = -999999;
    for(var i = 0; i < iterations; i ++){
        if(halt){break;}
        if(i%500==0){console.log(`${i} iterations in ${Date.now()-start} ms`);}
        if((i+1)%5000==0){console.log(`checkpoint ${(i+1)/5000}: `);console.log(JSON.stringify(currentWeights))}

        if(i%2==0){
            const mod = 0.3;
            var p1w = modifyList(currentWeights, mod);
            var p2w = modifyList(currentWeights, mod);
            var result = testRelativeFitness(
                Player(0, starts[0], nninput, {weights:p1w}),
                Player(1, starts[1], nninput, {weights:p2w})
            );
            if(result == 1){currentWeights = p1w;continue;}
            if(result == 2){currentWeights = p2w;continue;}
            // currentWeights = modifyList(currentWeights, mod/2);//lil smt smt
            // currFitness = testFitness(currentWeights);// "get real"
        }else{

            const mod = (0.3)
            var w1 = modifyList(currentWeights, mod);
            var thisFit = testFitness(w1);
            if(thisFit > currFitness){
                currentWeights=w1;
                currFitness = thisFit;
            }else{
                currFitness-=100;// so an unrealistic lucky run dont stop progress forever
            }

        }

    }
    console.log("trained in " + (Date.now()-start) + " ms");
    return currentWeights;
}

const wasdplayer = Player(0, starts[0], function(){
    this.w = ainput[87];
    // this.w = true;
    this.a = ainput[65];
    this.d = ainput[68];
    this.s = ainput[83];
    ainput[87]=false;
    ainput[83]=false;
    // console.log((bx-this.x)/100)
    });

async function train(){
    // players=[
    players = [Player(0, starts[0], function(){
    this.w = ainput[87];
    // this.w = true;
    this.a = ainput[65];
    this.d = ainput[68];
    this.s = ainput[83];
    ainput[87]=false;
    ainput[83]=false;
    }, {difficulty:0}),
    Player(1, starts[1], nninput, {weights:await trainFor(5000, generateRandomWeights())})]
}

var ainput = [];

function duplicate(){
    players[0] = Player(0, starts[0], nninput,
        {weights:modifyList(players[1].extra.weights, 0.1)}
    );
}

function ai(){
    players[0] = Player(0, starts[0], aiinput, {difficulty:0})
}

function load(weights){
    players = 
    [
        Player(0, starts[0], function(){
            this.w = ainput[87];
            // this.w = true;
            this.a = ainput[65];
            this.d = ainput[68];
            this.s = ainput[83];
            ainput[87]=false;
            ainput[83]=false;
            }, {difficulty:0}),
            Player(1, starts[1], nninput, {weights:Array.from(weights)})  
    ]
}

async function startCanvas(){
    // players[0]=Player(0,starts[0],aiinput,{difficulty:0})
    var sketchProc = function(processingInstance) {
        with (processingInstance) {
        size(640, 360);
        frameRate(60);

        init();

        keyPressed = function(){
            ainput[keyCode] = true;
            // console.log(keyCode)
        };
        keyReleased = function(){
            ainput[keyCode] = false;

            // console.log(keyCode)
        };

        console.log(averageList(players[1].extra.weights))

            draw = function(){     

                console.log("ai:"+getFitnessAtFrame(players[1]));
                console.log("player:"+getFitnessAtFrame(players[0]));

                // background(25,25,25,10);
                fill(25,25,25,180);
                rect(-10,-10,660,380);
                noStroke();


                runFrame();
                // console.log("p2 inputs:")
                // console.log("w "+players[1].w + " | a "+players[1].a + " | s "+players[1].s + " | d "+players[1].d)


                // text("vs", 0, 20, 640, 100);
                fill(100);
                text(p1score, 0, 20, 100, 100);
                text(p2score, 540, 20, 100, 100);


                fill(255);
                ellipse(bx,by,br*2,br*2);

                for(var i = 0;i<players.length;i++){


                    fill((i+1)*255, i*255, (i-2)*255);
                    ellipse(players[i].x, players[i].y, players[i].r*2, players[i].r*2);

                }


            }
        
        }};

    //Get the canvas that Processing-js will use

    var canvas = document.getElementById("canvas");
    //Pass the function sketchProc (defined in myCode.js) to Processing's constructor.
    var processingInstance = new Processing(canvas, sketchProc);
}
