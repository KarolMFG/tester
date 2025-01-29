
rootSeed=Math.round(Math.random()*10000);


function shiftPerspective(input){

    var output = input.replace("I ", "you ");
    output = output.replace("I'm ", "you're ");
    output = output.replace(" my ", " your ");
    output = output.replace("My ", "Your ");
    output = output.replace(" am ", " are ");
    
    for(var i = 0; i<output.length;i++) {// capitalize the yous if needed (assumed to be like, normal english)
        if(output[i]=="y") {
            if(i<2) {
                output = output.substring(0, i) +"Y"+ output.substring(i+1); 
            }else if(output.charAt(i-2)=='.') {
                output = output.substring(0, i) +"Y"+ output.substring(i+1); 
            }
        }
    }
    
    return output;

}

function pseudoRandom(seed){
    var temp = seed + rootSeed;
    // temp*=1230459;temp/=4359874;temp+=135;temp=temp^1324565;temp*=13545;
    temp *= 59791; temp /= 17; temp += 2132456; temp = temp^10385738923; temp = temp % 1001; temp /= 1001;
    return temp;
}


function pickRandom(ofList){
    return ofList[Math.floor(Math.random()*ofList.length)]
}

function pickRandom(ofList, seed){
    return ofList[Math.floor(pseudoRandom(seed)*ofList.length)]
}

const prefixes = ["Mc", "Big ", "Lil' ", "Super ", "Maxi", "Super", "Juicy ", "Mike's ", "Bill's ", "We Make ", "Homemade ", "Small-town ", "Daily ", "Ka", "Crunchy "];
const midfixes = ["Burger", "Burgers", "Fastfood", "Food", "Grub", "Joyful", "Chow", "Bread n' Fries"];
const suffixes = [" Inc.", " Ltd.", " & Friends", " Emporium", " Restaurant", " & Burger", " Co.", " Eatery"];

function nameGen(seed){
    var output = "";
    if(pseudoRandom(seed)<0.4){
        output+=pickRandom(prefixes, seed+29);
    }
    output+=pickRandom(midfixes, seed+157);
    if(pseudoRandom(seed-19)<0.4 || output.length < 9){
        output+=pickRandom(suffixes, seed-67);
    }
    return output
}

const words = {
    adj: {
        food:{
            good:["juicy", "flavorful", "exquisite", "well-made", "warm"],
            bad:["slightly rancid", "odorous", "foul", "mediocre", "greasy", "frozen on the inside"]
        },
        people: {
            desc:["short", "tall", "skinny", "blond", "large", "imposing", "frowning", "half-asleep", "sullen", "bubbly", "small", "shady"],
            sus:["shady"]
        },
        color:["red", "blue", "black", "white", "grey", "green", "dark grey", "dirty white", "pristine white"],
        car:["dinged-up", "shiny", "heavily stickered", "large"],
        voice:["raspy", "high-pitched", "low", "quiet", "mocking", "affable", "serious", "jovial", "sullen"]
    },
    noun:{
        people:{
            single:["man", "boy", "teenager", "woman", "girl", "individual", "guy", "dude", "fellow"],
            plural:["men", "boys", "teenagers", "women", "girls", "people", "guys", "dudes"],
            group:["couple", "pair", "group", "gang", "flock"]
        },
        car:["Toyota", "Tesla", "Cybertruck", "Honda", "car", "pickup", "van", "Porsche"],
        suspackage:["a weird-smelling package", "a suspicious box", "an unmarked box", "an ordinary package", "a cardboard box", "a suspicious package"]
    },
    greeting:["Hello.", "Hello!", "Hi!", "What's up.", "Yo.", "Hmph."],
    activity:{
        sus:["discreetly flipping through a notebook", "humming a soft, creepy melody", "surreptitiously counting bills", "smoking", "wearing an overlarge trenchcoat", "eyeing people around with suspicion"]
    }
}
