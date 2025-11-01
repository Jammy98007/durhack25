
const socket = new WebSocket("ws://localhost:8080");

export function connect (bd: string) {
    let msg = {"type": "connect", "board": bd}
    socket.onopen = () => {
        console.log("[client] SEND: Connected! eeee");
        socket.send(JSON.stringify(msg));
    };
}

socket.onmessage = (event: MessageEvent) => {
    console.log("[client] RECIEVED:", event.data);
};

socket.onclose = () => {
    console.log("[client] DISCONNECTED");
};


