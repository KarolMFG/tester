
window.onload = function(){
    document.getElementById('canvas').focus();// convenience

}



var sketchProc = function(processingInstance) {
    with (processingInstance) {
       size(640, 360);
       frameRate(60);

        var ainput = [];// continuous input
        var binput = [];// non-continuous input

        keyPressed = function(){
            binput[keyCode] = true;
            ainput[keyCode] = true;
        };
        keyReleased = function(){
            ainput[keyCode] = false;
            // binput[keyCode] = false;
        };

        const groundHeight = 360;

        const pBMR = 0.2;//player ball mass ratio (0.2 = player moves 20% the required distance, ball moves 80%)
        const pMT = 0.1;//player momentum transfer

        var pD = 0;// point differential (red +, yellow -) (NOT p. Diddy)
        var p1score = 0;
        var p2score = 0;

        var speedFactor = 1;

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
                            bvy*=10;bvy+=max(0,144-(abs(this.x-bx)));
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
                            0.9*min((abs(0.3*this.vx)+0.7),1-atan(abs(this.vx)/500))
                        ));
                        const speed = 0.7;
                        this.vx+=horizontalFactor*speed*speedFactor;
                        if(this.w){if(this.y+this.r!=groundHeight){this.isGrounded=false;this.vx+=horizontalFactor*(abs(this.vx)+2);}this.vy-=9;this.y-=1;}
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
                    var bdist2p = sqrt((bx-this.x)*(bx-this.x) + (by-this.y)*(by-this.y));// b dist to player
                    if(bdist2p < br+this.r){
                        var bang2p = atan2(by-this.y, bx-this.x);//b angle
                        var dx = cos(bang2p) * -(bdist2p-(br + this.r));
                        var dy = sin(bang2p) * -(bdist2p-(br + this.r));
                        
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
            desiredx = min(max(this.hx, bx+10),640);
        }else{
            desiredx = max(min(this.hx, bx-10),0);
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
        (!this.isGrounded&&this.y < groundHeight-100)// if has no business in air
    ){

        var willHit = false;
        var tx = this.x;
        var ty = this.y;
        var tbx = bx;
        var tby = by;
        var tbvy = bvy;
        for(var i = 0; i < 15;i++){
            tx+=this.vx;ty=this.vy;tbx+=bvx;tby+=tbvy;
            tbvy++;
            if((tx-tbx)*(tx-tbx)+(ty-tby)*(ty-tby) < (br+this.r-3)*(br+this.r-3)){
                willHit = true;
            }
        }// not if on collision course

        if(!willHit){// avoid missing the ball
            this.s=true;// no floating around, we stay on the ground in this zone
        }

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
// const funnyinput = function(){
//     if(abs(this.x-bx) > 200 && abs(otherplayerx-bx) > 80){// if far away, and player is not in balling range, wavedash
//         if(this.isGrounded){
//             this.w = true;
//         }else if(this.y+this.r < groundHeight-10 && !this.isGrounded){
//             this.s = true;
//         }
//     }
// }
const wasdinput = function(){// player one, uses wasde
    this.w = binput[87];
    this.a = ainput[65];
    this.d = ainput[68];
    this.s = binput[83];
    this.e = ainput[69];// unused
};
const arrowsinput = function(){// player two, uses arrow keys
    this.w = binput[38];
    this.a = ainput[37];
    this.d = ainput[39];
    this.s = binput[40];
    this.e = ainput[69];// unused
};

var players = [Player(0,starts[0],wasdinput),Player(1,starts[1],arrowsinput)];

    // players.pop();// get rid of ai for testing


        // init code (not much)

        var init = function(){
            textAlign(CENTER);
            textSize(70);
            for(var i = 0; i < players.length;i++){
                players[i].x = players[i].hx;
                players[i].y = players[i].hy;
                players[i].vx = 0;
                players[i].vy = 0;
                players[i].isGrounded = false;
            }
            bvx = 0;bvy = -5;bx=320;by=250;
        }
        init();


        draw = function(){

            if(updated){// if selection has been changed

                speedFactor = document.getElementById('speedslider').value / 50;

                switch(document.getElementById("player1select").selectedIndex){
                    default:break;
                    case 0:
                        players[0] = Player(0, starts[0], wasdinput);
                        break;
                    case 1:
                        players[0] = Player(0, starts[0], arrowsinput);
                        break;
                    case 2:
                        players[0] = Player(0, starts[0], aiinput);
                        break;
                    case 3:
                        players[0] = Player(0, starts[0], aiinput, {difficulty:1});
                        break;
                    case 4:
                        players[0] = Player(0, starts[0], aiinput, {difficulty:2});
                        break;
                        
                }

                switch(document.getElementById("player2select").selectedIndex){
                    default:break;
                    case 0:
                        players[1] = Player(1, starts[1], wasdinput);
                        break;
                    case 1:
                        players[1] = Player(1, starts[1], arrowsinput);
                        break;
                    case 2:
                        players[1] = Player(1, starts[1], aiinput);
                        break;
                    case 3:
                        players[1] = Player(1, starts[1], aiinput, {difficulty:1});
                        break;
                    case 4:
                        players[1] = Player(1, starts[1], aiinput, {difficulty:2});
                        break;
                }

                init();
                pD=0;
                p1score=0;p2score=0;
                updated=false;
            }

            // background(25,25,25,10);
            fill(25,25,25,180);
            rect(-10,-10,660,380);
            noStroke();

            bx+=bvx*speedFactor;by+=bvy*speedFactor;
            bvy+=0.3*speedFactor;
            if(by+br>groundHeight){by=groundHeight-br;bvy = min(0, max(-0.5*bvy + 0.4,-sqrt(max(0,bvy))));}
            bvx*=(1-0.03*speedFactor);
            bvy*=(1-0.03*speedFactor);

            for(var i = 0;i<players.length;i++){
                players[i].doCollisions();
            }

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

                fill((i+1)*255, i*255, (i-2)*255);
                ellipse(players[i].x, players[i].y, players[i].r*2, players[i].r*2);

            }

            if(bcol==players.length&&bcol!=1){bvy=-5*speedFactor;bvx=(320-bx)*0.02*speedFactor;}

            fill(255);
            ellipse(bx,by,br*2,br*2);

            if(bx < 0){pD--;p2score++;init();}
            if(bx > 640){pD++;p1score++;init();}

            // text("vs", 0, 20, 640, 100);
            fill(100);
            text(p1score, 0, 20, 100, 100);
            text(p2score, 540, 20, 100, 100);


            binput = [];//reset
            bcol = 0;

        };
       
    }};

   // Get the canvas that Processing-js will use
var canvas = document.getElementById("canvas");
   // Pass the function sketchProc (defined in myCode.js) to Processing's constructor.
var processingInstance = new Processing(canvas, sketchProc);

var updated = false;
modifyPlayer = function(){
    updated = true;
}
changeSpeedFactor = function(){
    updated = true;
    if(document.getElementById('speeddisplay').innerText != document.getElementById('speedslider').value/50){
    document.getElementById('speeddisplay').innerText=document.getElementById('speedslider').value/50;
    if(document.getElementById('speedslider').value%50==0){document.getElementById('speeddisplay').innerText+=".0";}// give it a .0 for effect
    }
}
