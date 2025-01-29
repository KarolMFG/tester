

// const credentials = Realm.Credentials.apiKey("oi4oFeSwYdgKm8RUySFjs3v9ELWzM8JxGE6De0IzzWZWi7EnJ7MH0a26VhqhqTF1"); // dont change <3



var thirst = 0.2;
var hunger = 0.2;
var energy = 0.8;
var wantedness = 0;
var money = 0;
var distance = 50 + Math.round(Math.random()*100);

var state = {carrying:""};// character state, god bless js objects


var lasttext = "";
var currenttext = "";

var curEvent = 0;

function next(){

    var factor = Math.random();
    energy*=0.97;energy-=0.01*factor;
    thirst+=0.03*factor;
    hunger+=0.01*factor;
    wantedness-=0.01*factor;
    wantedness=Math.max(0, wantedness);

    if(thirst > 0.5){lasttext+=" You're thirsty."}
    if(hunger > 0.5){lasttext+=" You're hungry."}
    if(energy < 0.4){lasttext+=" You're feeling tired."}

    if(hunger<0){hunger=0;}if(thirst<0){thirst=0;}if(energy>1){energy=1;}if(energy<0){energy=0;}// bounding on stats

    if(thirst>1||hunger>1){
        if(thirst>1){lasttext+=" You've been thirsty for a while."}
        if(hunger>1){lasttext+=" You've been hungry for a while."}
        if(curEvent == 1){
            lasttext+=" Your indecision gets the better of you, and you pass out."
        }else{
            lasttext+=" Suddenly, it gets the better of you, and you pass out. You will not get to Cleveland."
        }
        curEvent = 10;
    }


    // update status display

    const i = function(n, mi, ma){// interpolate for digit values
        //n within 0,1
        return Math.round((n*(ma-mi))+mi)
    }

    const eb = document.getElementById("energybar");
    eb.style.width = `${Math.min(100, energy*100)}%`;
    eb.style.backgroundColor = `rgb(${i(energy, 150, 50)}, ${i(energy, 50, 150)}, 50)`

    const tb = document.getElementById("thirstbar");
    tb.style.width = `${Math.min(100, thirst*100)}%`;
    tb.style.backgroundColor = `rgb(${i(thirst, 50, 150)}, ${i(thirst, 150, 50)}, 50)`

    const hb = document.getElementById("hungerbar");
    hb.style.width = `${Math.min(100, hunger*100)}%`;
    hb.style.backgroundColor = `rgb(${i(hunger, 50, 150)}, ${i(hunger, 150, 50)}, 50)`

    document.getElementById("statusmoney").innerText=money;
    document.getElementById("statusdistance").innerText=distance;


    act(curEvent);
    if(state.carrying!=""){lasttext+=`\nYou are carrying ${state.carrying}.`}
    document.getElementById('story').innerText=lasttext+"\n"+currenttext;

}

function spendMoney(amount){
    money-=amount;
    if(money<0){
        curEvent=17;
    }
}

function death(){
    showOptions();// clear the options
    // console.log("sdfs")
}

function showOptions(options, outcomes){
    document.getElementById('options').innerHTML="";
    if(typeof options === 'undefined'){return;}
    for(var i = 0; i < options.length;i++){
        var newElement = document.getElementById('sampleOption').cloneNode(true);
        newElement.className="";//remove hidden
        newElement.id="";// remove this
    

        newElement.innerHTML=newElement.innerHTML.replace("[[[TEXT]]]", options[i]).replace("[[[JS]]]", `lasttext=\`${shiftPerspective(options[i])}\`` + "+`\n`;" + (typeof outcomes[i] === 'number' ? `curEvent=${outcomes[i]}` : outcomes[i]) +";next();");
        document.getElementById('options').appendChild(newElement);
        // newElement=undefined;
    }
}


// event key
	// -1: generic driving
	// 0: starting
	// 1: starting, refused (points to itself)
	// 2: leaving house
	// 3: stopping driving, side of road
	// 4: police encounter (chill)
	// 5: police encounter (not chill)
	// 6: police encounter end (chill)
	// 7: police encounter end (not chill)
	// 8: car chase
	// 9: game over (arrested)
	// 10: game over (dead)
	// 11: game over (crash)
    // 12: arrival at cleveland
    // 13: game over (victory, you got to cleveland)
    // 14: fast food entry/ordering
    // 15: fast food idle
    // 16: shady conversation
    // 17: die of shame from being broke

function act(event){
    
    if(event == 8) {
        wantedness+=10;// you will never live this down
        if(Math.random()<0.3) {
            lasttext += "Somehow, you escaped. The police have given up chasing you, for now.";
            event = -1;
        }
    }
    if(event == -1) {
        if(Math.random() > energy * 4) {// only happens at .25 energy or less
            lasttext += ` You've been dulled for a while now, and you can't focus. Suddenly, a tesla veers in front of you, no turn signal (Elon forgot to implement that), and everything goes black.`;
            event = 10;
        }
    }


    if(distance<=0&&event!=13){event=12;}

    switch(event){
        default:
            distance--;
            currenttext="You're driving to Cleveland."
            var choices = [ "I drive, paying close attention (-energy).", "I drive, relaxed (+energy).", "I drive, scrolling reels (++energy).", "I make a stop by the side of the road."]
            var consequences = ["energy-=0.04","energy+=0.1;curEvent=(Math.random()<0.04?11:-1)","energy+=0.4;curEvent=(Math.random()<0.3?11:-1)",3];

            if(Math.random()<0.2){
                currenttext+=` You see a road sign: ${nameGen(distance)}, coming up soon. You could stop there.`;
                choices.push(`I stop for a bit at ${nameGen(distance)}.`);
                consequences.push(14);
            }

            showOptions(choices, consequences)
            break;
        case 0:
            currenttext="You suddenly get the urge to leave the city in which you currently reside. Deep inside, you hear a message telling you: Get to Cleveland. What do you do?"
            showOptions(["I decide to go. Why not?", "I stay. I don't think this is a good idea."]
                ,["curEvent=2;money+=20;",1])
            break;
        case 1:
            currenttext="You can't shake the thought of leaving off your mind."
            if(		 Math.random()<0.3) {currenttext += " A car passes outside, and you wish you were in it.";
			}else if(Math.random()<0.3) {currenttext += " You hear talking in the street outside. Maybe those people are talking about leaving the city and going to Cleveland.";}
            showOptions(["I decide to go. Why not?", "I stay. I don't think this is a good idea."]
                ,[2,"curEvent=1;makePopup({title:'Nuh uh',text:'You need to go to Cleveland!'})"]);
            break;
        case 2:
            currenttext="You start to leave, in a hurry. You grab your wallet (+$20, +ID) and your keys. Right before you go, you remember:"
            showOptions(["I should probably drink some water (-thirst).", "I should eat some food before I leave (-hunger).", "Actually, I'm probably fine."]
                ,["curEvent=-1;thirst-=0.2","curEvent=-1;hunger-=0.2",-1]);
            break;
        case 3:
            if(Math.random()<0.3){
                currenttext="You are stopped on the side of the road. A cop car parks behind you, and you watch the officer approach."
                showOptions(["Scroll a few reels while the officer walks over (++energy).", "I watch him approach, getting my ID ready.", "Once he leaves the car, I speed off onto the highway."],
                    ["curEvent=(Math.random()<0.4 * (1+wantedness)?5:4);energy+=0.4","curEvent=(Math.random()<0.2 * (1+wantedness)?5:4)","curEvent=(Math.random()<0.8?8:-1)"]
                )
            }else{
                currenttext="You are stopped on the side of the road."
                showOptions(["I stay in the car and scroll reels (+energy).", "I watch the cars drive by, entranced (+energy).", "I continue driving."],
                    ["curEvent=3;energy+=0.2","curEvent=3;energy+=0.2",-1]
                )
            }
            break;
        case 4:
            currenttext="The officer stands by your door, and you lower the window. \n\"Good morning. I'm just wondering why you've stopped here.\""
            showOptions(["I explain, telling the truth.", "I make up an excuse that sounds plausible.", "I speed off onto the highway."],
                ["curEvent=(Math.random()<0.1?7:6)","curEvent=(Math.random()<0.5?7:6);energy+=0.05;wantedness+=0.1",8])
            break;
        case 5:
            if(wantedness > 5){// car chase survivor -> under arrest
                currenttext="The officer stands by your door, and you lower the window. \n\"Buddy, you're wanted for resisting arrest and gross violation of traffic laws. Get out of the car, you're under arrest.\""
                showOptions(["\"Ten-four.\"", "I speed off onto the highway."], [9,8])
            }
            currenttext="The officer stands by your door, and you lower the window. \n\"Excuse me. Do you care to explain yourself? You're not exactly allowed to park here without reason.\""
            showOptions(["I explain, telling the truth.", "I make up an excuse that sounds plausible.", "I speed off onto the highway."],
                ["curEvent=(Math.random()<0.3?7:6)","curEvent=(Math.random()<0.6?7:6)",8])
            break;
        case 6:
            currenttext="The officer stands by your door. \n\"Alright. I'll just need your ID, and I'll leave you to it.\" ";
            showOptions(["I show the officer my ID, and keep driving.", "I speed off onto the highway."],
                [-1,8]
            )
            break;
        case 7:
            if(wantedness<0.4) {
				currenttext="The officer stands by your door. \n\"Really? I don't believe that. Show me your ID, and you'll get a warning.\""
                showOptions(["I show my ID without word, and drive off.", "I speed off onto the highway."],[-1,8])
			}else if(wantedness<0.8) {
				currenttext="The officer stands by your door. \n\"Really? I don't believe that. This isn't your first warning. That'll be a $10 fine, for now.\""
                showOptions(["I pay the $10 fine and drive off (-$10).", "I speed off onto the highway."],["curEvent=-1;spendMoney(10)",8])
			}else {
				currenttext="The officer stands by your door. \n\"Sure, buddy. I'm afraid your repeated behavior is endangering others. Leave the car, you're under arrest.\""
                showOptions(["I do as the officer instructs.", "I speed off onto the highway."],[9,8])
			}
			wantedness+=0.5
            break;
        case 8:
			const dO = (Math.random()<0.2 || energy < 0.3?11:8);
			currenttext="You blast down the highway, the police officer in pursuit. If you are caught, you will never get to Cleveland."
            showOptions(["I keep driving (--energy).", "I glance at the police behind me (--energy).", "I practice explaining this incident to the judge (--energy).","I pull over."],
                [dO, dO, `curEvent=${dO};lasttext+='You can\\\'t think of a good explanation.'`, 9])
            energy-=0.2;
            distance-=3;
            break;
        case 9:
            currenttext="You fought the law, and the law won. You are not getting to Cleveland."
            death();// clear
            break;
        case 10:
            currenttext="You neglected yourself, and died. You are not getting to Cleveland."
            death();
            break;
        case 11:
            currenttext=`As you drive, a ${pickRandom(words.noun.car)} ahead of you veers into your lane without warning. You're not ready.\nYou played it too risky, and died. You are not getting to Cleveland.`;
            death();
            break;
        case 12:
            // lasttext=''
            currenttext="Finally, the end is in sight. You drive down the highway, approaching that beautiful sign: \"Welcome to Cleveland, OH\". The car behind you honks angrily as you slow down, coming to a stop right before that ephemeral guidepost you've sought for so long. You exit the car, and walk up to the sign."
            showOptions(["I reach out and touch it."], [13])
            break;
        case 13:
            lasttext=''
            currenttext="You got to Cleveland.\n\n"
            death();
            break;
        case 14:
            currenttext=`You walk into ${nameGen(distance)} and are immediately greeted by the scent of cheap fast food. You walk up to the counter, and are greeted by a ${pickRandom(words.adj.people.desc, distance)} ${pickRandom(words.noun.people.single)}: "${pickRandom(words.greeting)} How can I help you?"`
            
            var choices = [`I order the ${nameGen(distance)} special: the burger (-$7).`, "I order a small fries (-$3).", "I order a large drink, no ice (-$2).", "I look around.", "I leave."];
            var consequences = ["lasttext+='You bite into the burger. It\\\'s ' + pickRandom((Math.random()<0.5?words.adj.food.good:words.adj.food.bad)) + '. You finish it quickly.';curEvent=15;hunger-=0.5;spendMoney(7);",
                "lasttext+='The fries are ' + pickRandom((Math.random()<0.5?words.adj.food.good:words.adj.food.bad)) + '.';curEvent=15;hunger-=0.3;spendMoney(3);",
                "lasttext+='Your drink has ice, but is refreshing nonetheless.';curEvent=15;thirst-=0.5;spendMoney(2);", 
                15,
                "lasttext+='You walk out to the car and resume driving.';curEvent=-1;"];
            showOptions(choices,consequences)
            break;
        case 15:

            var choices = [];
            var consequences = [];

            currenttext=`You're standing in ${nameGen(distance)}. You look around the restaurant. Inside, there is `

            if(state.carrying!=""){
                currenttext+=`a ${pickRandom(words.adj.people.sus)} ${pickRandom(words.noun.people.single)} watching you. This is probably who you want to drop off the ${state.carrying}.\nBesides that, there is `;
                choices.push(`I hand over the ${state.carrying} and leave (+$20).`)
                consequences.push("state.carrying='';curEvent=-1;money+=20;")
            }


            if(Math.random()<0.2){currenttext+="nobody. This place is empty" + (Math.random()<0.5?".":", and you wonder why.")}else{
                
                currenttext+=`a ${pickRandom(words.noun.people.group, distance)} of ${pickRandom(words.noun.people.plural, distance+119)}.`
                choices.push(`I approach the ${pickRandom(words.noun.people.group, distance)} looking for money or food.`);
                consequences.push(`lasttext+='One of the ${pickRandom(words.noun.people.plural, distance+119)} shoots you a look so rancid you turn around and leave. You get in your car and drive off.'; curEvent=-1;`)
                if(Math.random()<0.8){
                   currenttext+=` In the corner, there's a shady ${pickRandom(words.noun.people.single, distance+117)} ${(Math.random()<0.7?pickRandom(words.activity.sus):"")}.`;
                   choices.push(`I walk up to the ${pickRandom(words.noun.people.single, distance+117)} and ask about money.`)
                   consequences.push(16)
                }

            }
            choices.push("I leave.")
            consequences.push(-1)

            showOptions(choices, consequences)
            break;
        case 16:
            var choices = [];
            var consequences = [];
            currenttext=`The ${pickRandom(words.noun.people.single, distance+117)} looks up.`;
            if(Math.random()<0.2){
                currenttext+=" \"I can't help you there. Get money somewhere else, punk.\""
                choices.push("I attempt to wring out some money from this person.")
                consequences.push("lasttext+='You do your best to sound threatening, but ultimately are unsuccessful. You leave the place and go back to the car.';curEvent=-1")
            }else{
                currenttext+=" \"I need this package moved. Drop it off at a burger place, and you'll earn a little something. No questions.\"\nThis is shady as hell.";
                choices.push("I accept the suspicious box.")
                consequences.push(`lasttext+='You take the box, and go back to the car, putting it discreetly on the floor of the passenger seat.';curEvent=-1;state.carrying='${pickRandom(words.noun.suspackage)}'`)
            }

            choices.push("I leave, and go back to the car.")
            consequences.push(-1)

            showOptions(choices, consequences)

            break;
        case 17:
            currenttext="You discover you don't have the requisite cash. The realization that you're broke instantly kills you out of shame. You are not getting to Cleveland.";
            death();
            break;
    }
}

next()
