'use client'

import Board from '@/components/Board'
import React from 'react'
import { useParams } from "next/navigation";

const page = () => {
    
    const socket = new WebSocket("ws://localhost:8080");
    let msg = {"type": "connect", "board": useParams()["slug"]}
    socket.onopen = () => {
        console.log("[client] SEND: Connected! eeee");
        socket.send(JSON.stringify(msg));
    };

    socket.onmessage = (event: MessageEvent) => {
        console.log("[client] RECIEVED:", event.data);
    };

    socket.onclose = () => {
        console.log("[client] DISCONNECTED");
    };

    return (
        <div className='w-screen h-screen'>
            <Board />
        </div>
    )
}

export default page