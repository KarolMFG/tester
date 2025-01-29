var by;

function nTC(x, y){// numberspace to canvasspace
    return {x: (c.width/2)+((x-cv.xo)/cv.sx),
         y: (c.height/2)-((y-cv.yo)/cv.sy)}
}

function cTN(x, y){// canvasspace to numberspace
    return {
        x:(cv.sx*(x-(c.width/2)))+cv.xo,
        y:(cv.sy*(y-(c.height/2)))+cv.yo
    }
}

function processText(input){// throws some error when doing (2^(-x)), dont care teehee (fixed it, the problem was w parens lmao)

    if(input=="1+1"){return "3"}
    input=input.replace("sin", "Math.sin").replace("cos", "Math.cos").replace("tan", "Math.tan").replace("log", "Math.log10").replace("abs", "Math.abs").replace("sqrt", "Math.sqrt")

    for(var i = 0; i < input.length;i++){
        if(input[i]=="^"){
            var max = i;var min = i;
            if(i==0){throw "baseless exponent"}
            if(i+1==input.length){throw "indexless exponent"}
            var base = "";
            if(input[i-1]==")"){
                base = input[i-1];
                var ii = i-1;
                var pc = 1;//parentheses count
                while(pc>0){
                    ii--;if(ii<=-1){break}
                    if(input[ii]==")"){pc++}else if(input[ii]=="("){pc--}
                    base = input[ii]+base;
                }
                min=ii;
            }else if(isDigit(input[i-1])){
                base = input[i-1];
                var ii = i-1;
                while(isDigit(input[ii-1])){
                    ii--;if(ii<=-1){break}
                    base = input[ii]+base;
                }
                min=ii;
            }else if(input[i-1]=="x"){base="x";min=i-1;}
            var index = "";
            if(input[i+1]=="("){
                index = input[i+1];
                var ii = i+1;
                var pc = 1;//pc
                while(pc>0){
                    ii++;if(ii>=input.length){break}
                    if(input[ii]=="("){pc++}else if(input[ii]==")"){pc--}
                    index += input[ii];
                }
                max=ii;
            }else if(isDigit(input[i+1])){
                index = input[i+1];
                var ii = i+1;
                while(isDigit(input[ii+1])){
                    ii++;if(ii>=input.length){break}
                    index+=input[ii];
                }
                max=ii;
            }else if(input[i+1]=="x"){index="x";max=i+1;}
            // console.log(base)
            // console.log(index)
            input = input.substring(0, min) + `Math.pow(${base}, ${index})` + input.substring(max+1);
            i=0;
            // console.log(input);
        }
    }

    return input;
}

function isDigit(s){
    if(s=="0"){return true}
    if(s=="1"){return true}
    if(s=="2"){return true}
    if(s=="3"){return true}
    if(s=="4"){return true}
    if(s=="5"){return true}
    if(s=="6"){return true}
    if(s=="7"){return true}
    if(s=="8"){return true}
    if(s=="9"){return true}
    if(s=="."){return true}
    return false
}

function evaluate(eq, at){
    var x = at;
    try{
        return eval(eq);
    }catch(e){console.log("bad eq, " + e)}
}

function transform(eq, by){
    if(by.x!=undefined){
        for(var i = 0; i < eq.length; i++){
            if(eq[i]=="x"){
                i++;
                if(eq[i]=="+"||eq[i]=="-"){
                    var alrOffset = true;
                    if(i-2>=0){if(eq[i-2]=="("){
                        i++
                        out = 0;
                        while(eq[i]!=")"||i==eq.length){if(!isDigit(eq[i])){alrOffset=false;break}i++;out++}
                        i-=out
                        if(alrOffset){
                            eq = eq.substring(0, i-3) + `(x+${Number(eq.substring(i-1, i+out))-by.x})` + eq.substring(i+out+1)
                        }else{
                            eq = eq.substring(0, i-1) + `(x+${-by.x})` + eq.substring(i);
                        }
                    }else{
                        eq = eq.substring(0, i-1) + `(x+${-by.x})` + eq.substring(i);
                    }}
                }else{
                    eq = eq.substring(0, i-1) + `(x+${-by.x})` + eq.substring(i);
                }
            }
        }
    }

    if(by.y!=undefined){
        var ina = 1;// in amount
        while(isDigit(eq[eq.length-ina])){
            ina++
        }
        if(eq[eq.length-ina]=="-"||eq[eq.length-ina]=="+"){
            eq = eq.substring(0, eq.length-ina) + `+${Number(eq.substring(eq.length-ina))+Number(by.y)}`
        }else{
            eq+=`+${by.y}`
        }
    }

    if(by.sx!=undefined){
        for(var i = 0; i < eq.length;i++){
            if(eq[i]=="x"){
                if(i>0){
                    if(eq[i-1]=="*"&&eq[i+1]!="^"){
                        var o = 1;
                        while(isDigit(eq[i-1-o])){
                            if(i-1-o>0){o++}else{break}
                        }
                        eq = eq.substring(0, i-o) + (Number(eq.substring(i-o, i-1))*by.sx)+"*" + eq.substring(i)
                        i++
                        continue
                    }
                    eq = eq.substring(0, i) + `(${by.sx}*x)` + eq.substring(i+1)
                    i+=3 + `${by.sx}`.length   
                    continue
                }
                eq = eq.substring(0, i) + `(${by.sx}*x)` + eq.substring(i+1)
                i+=3 + `${by.sx}`.length   
            }
        }
    }

    if(by.sy!=undefined){
        var i = 0
        while(isDigit(eq[i])){
            if(i<eq.length-1){i++}else{break}
        }
        if(i<eq.length-2){
            if(eq[i]=="*"&&eq[i+1]=="("&&eq[eq.length-1]==")"){
                eq=Number(eq.substring(0, i))*by.sy + eq.substring(i)
            }else{
                eq=`${by.sy}*(${eq})`
            }
        }else{eq=`${by.sy}*(${eq})`}
    }

    eq = eq.replaceAll("+-", "-")
    return eq;
}


// const test = "46^3*(25^3+(3+5)^7)"

// const test = "x^2+6*x+12^x"

// const test = "x^2+6*x+3"

// console.log(test)
// console.log(processText(test))
// console.log(evaluate(test, 2))
