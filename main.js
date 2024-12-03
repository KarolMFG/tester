const username = "bogo binte";
const mainID = "zxcmasldkfnsdfvblxk";
let selfpeer;
let establishFlag = false;
let _index = 0;
let conns = [];
const uniqueIdentifier = Date.now();
const variable = "this does nothing I just wanted to say I'm batman";
async function establishPeer(index) {
    selfpeer = new Peer(mainID + index);

    selfpeer.on('open', (id) => {
        console.log(`[${uniqueIdentifier}] Peer established with id: ${id}`);
        establishFlag = true;
    });

    selfpeer.on('error', async (err) => {
        console.error(`[${uniqueIdentifier}] Error establishing peer: ${err.type}`);
        if (err.type === 'unavailable-id') {
            console.log(`[${uniqueIdentifier}] Index ${index} taken, trying next index...`);
            if (index < 100) return await establishPeer(index + 1);
            console.error(`[${uniqueIdentifier}] Peer index failure: no open slot`);
        }
    });

    while (!establishFlag) await delay(1000);

    if (selfpeer.id.replace(mainID, "") === `${index}`) {
        console.log(`[${uniqueIdentifier}] Initialized peer with index: ${index}`);
        selfpeer.on('connection', handleConnection);
        _index = index;
    }
}

function handleConnection(connection) {
    if (!conns.some(conn => conn.peer === connection.peer)) {
        console.log(`[${uniqueIdentifier}] Connection received from: ${connection.peer}`);
        conns.push(connection);
        setupConnectionListeners(connection);
    }
}

function setupConnectionListeners(connection) {
    connection.on('data', receiveMessage);
    connection.on('close', () => {
        console.log(`[${uniqueIdentifier}] Lost connection to peer: ${connection.peer}`);
        conns = conns.filter(conn => conn.peer !== connection.peer);
        updatePeerList();
    });
}

function receiveMessage(msg) {
    if (!msg || !msg.message) return console.warn(`[${uniqueIdentifier}] Received empty or invalid message.`);

    const newBox = document.getElementById('samplebox').cloneNode(true);
    newBox.classList.remove('hidden');
    newBox.innerHTML = newBox.innerHTML.replace("[[[message]]]", msg.message)
        .replace("[[[username]]]", msg.username)
        .replace("[[[timestamp]]]", `at ${new Date(msg.timestamp).toLocaleTimeString()}`);
    document.getElementById('displaybox').appendChild(newBox);
    newBox.scrollIntoView({ behavior: "smooth" });
}

function sendMessage() {
    const messageContent = document.getElementById('messagebox').innerText.trim();
    if (!messageContent) return console.warn(`[${uniqueIdentifier}] Attempted to send an empty message.`);

    const toSend = {
        message: messageContent,
        username: document.getElementById('usernamebox').innerText.trim() || "Anonymous",
        timestamp: Date.now()
    };

    conns.forEach(connection => {
        try {
            connection.send(toSend);
            console.log(`[${uniqueIdentifier}] Sent message to ${connection.peer}:`, toSend);
        } catch (err) {
            console.error(`[${uniqueIdentifier}] Error sending message to ${connection.peer}:`, err);
        }
    });

    receiveMessage(toSend);
    document.getElementById('messagebox').innerText = '';
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updatePeerList() {
    const peerList = document.getElementById('peerList');
    peerList.innerHTML = conns.map(conn => `<li>${conn.peer}</li>`).join('');
}

async function init() {
    document.getElementById('messagebox').addEventListener('keydown', (ev) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendMessage();
        }
    });

    await establishPeer(0);
    await delay(500);
    console.log(`[${uniqueIdentifier}] Establishing connections...`);
    await establishConns();
}

async function establishConns() {
    for (let i = Math.max(0, _index - 4); i < _index; i++) {
        if (!conns.some(conn => conn.peer === mainID + i)) {
            console.log(`[${uniqueIdentifier}] Connecting to ${mainID + i}...`);
            try {
                const connection = selfpeer.connect(mainID + i);
                conns.push(connection);
                setupConnectionListeners(connection);
            } catch (err) {
                console.error(`[${uniqueIdentifier}] Error connecting to ${mainID + i}:`, err);
            }
        }
    }
}

init();
