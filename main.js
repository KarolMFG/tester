var username = "bogo binte";
var mainID = "zxcmasldkfnsdfvblxk";
var selfpeer;
var establishFlag = false;
var _index = 0;
var conns = []; 
var uniqueIdentifier = Date.now(); 
async function establishPeer(index) {
    selfpeer = new Peer(mainID + index);
    selfpeer.on('open', function(id) {
        console.log(`[${uniqueIdentifier}] Ryan Gosling fan (cuz im alr him) established with id: ${id}`);
        establishFlag = true;
    });
    selfpeer.on('error', async function(err) {
        console.error(`[${uniqueIdentifier}] Error establishing peer (ruh roh): ${err.type}`);
        if (err.type === 'unavailable-id') {
            console.log(`[${uniqueIdentifier}] Index ${index} taken lmaooo, trying next index...`);
            if (index < 100) {
                return await establishPeer(index + 1);
            } else {
                console.error(`[${uniqueIdentifier}] Peer index failure: no open slot womp womp`);
                return;
            }
        } else {
            console.error(`[${uniqueIdentifier}] Peer init error: ${err}`);
        }
    });
    while (!establishFlag) {
        await delay(1000);
 }
    if (selfpeer.id.replace(mainID, "") === `${index}`) {
        console.log(`[${uniqueIdentifier}] Initialized peer with index: ${index}`);
        selfpeer.on('connection', function(c) {
            console.log(`[${uniqueIdentifier}] Connection received from: ${c.peer}`);
            if (!conns.some(conn => conn.peer === c.peer)) {
                var newConnIndex = conns.push(c) - 1;
                conns[newConnIndex].on('data', function(data) {
                    receiveMessage(data);
                });
                conns[newConnIndex].on('close', function() {
                    console.log(`[${uniqueIdentifier}] Lost connection to peer: ${c.peer}`);
                });
            } else {
                console.log(`[${uniqueIdentifier}] Connection to ${c.peer} already exists, ignoring.`);
            }
        });
        _index = index;
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function receiveMessage(msg) {
    if (!msg || !msg.message) {
        console.warn(`[${uniqueIdentifier}] Received empty or invalid message.`);
        return;
    }
    console.log(`[${uniqueIdentifier}] Received message: ${JSON.stringify(msg)}`);
    var newBox = document.getElementById('samplebox').cloneNode(true);
    newBox.classList.remove('hidden');
    newBox.innerHTML = newBox.innerHTML.replace("[[[message]]]", msg["message"]);
    newBox.innerHTML = newBox.innerHTML.replace("[[[username]]]", msg["username"]);
    newBox.innerHTML = newBox.innerHTML.replace("[[[timestamp]]]", "at " + new Date(msg["timestamp"]).toLocaleTimeString());
    document.getElementById('displaybox').appendChild(newBox);
}
function sendMessage() {
    var messageContent = document.getElementById('messagebox').innerText.trim();
    if (!messageContent) {
        console.warn(`[${uniqueIdentifier}] Attempted to send an empty message.`);
        return;
    }
    var toSend = {
        'message': messageContent,
        'username': document.getElementById('usernamebox').innerText,
        'timestamp': Date.now()
    };
    for (var i = 0; i < conns.length; i++) {
        try {
            conns[i].send(toSend);
            console.log(`[${uniqueIdentifier}] Sent message to ${conns[i].peer}: ${JSON.stringify(toSend)}`);
        } catch (error) {
            console.error(`[${uniqueIdentifier}] Error sending message to ${conns[i].peer}: ${error}`);
        }
    }
    receiveMessage(toSend);
    document.getElementById('messagebox').innerText = '';
}
async function init() {
    document.getElementById('messagebox').addEventListener('keydown', function(ev) {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendMessage();
        }
    });
    await establishPeer(0);
    await delay(500); // ryan gosling simulator
    console.log(`[${uniqueIdentifier}] Establishing ryan gosling...`);
    await establishConns();
}
async function establishConns() {
    for (var i = Math.max(0, _index - 4); i < _index; i++) {
        var alreadyIn = conns.some(conn => conn.peer === mainID + i);
        console.log(`[${uniqueIdentifier}] Checked ${i}, connection preexists: ${alreadyIn}`);

        if (!alreadyIn) {
            console.log(`[${uniqueIdentifier}] Connecting to ${mainID + i}...`);
            try {
                var connection = selfpeer.connect(mainID + i);
                conns.push(connection);
                connection.on('data', function(data) {
                    receiveMessage(data);
                });
                connection.on('close', function() {
                    console.log(`[${uniqueIdentifier}] Lost connection to peer: ${this.peer}`);
                });
            } catch (error) {
                console.error(`[${uniqueIdentifier}] Error connecting to ${mainID + i}: ${error}`);
            }
        } else {
            console.log(`[${uniqueIdentifier}] Connection to ${mainID + i} already exists, skipping.`);
        }
    }
}
init();
//ryan gosling is kewl ig
