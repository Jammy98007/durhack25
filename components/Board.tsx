'use client'

import React, { useEffect, useRef, useState } from 'react'
import ToolBar from './ToolBar';
import { useParams } from 'next/navigation';

type Point = {
    x: number;
    y: number;
}

type Stroke = {
    points: Point[];
    colour: string;
}

const Board = () => {
    // persistant reference to canvas 
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentColour, setCurrentColour] = useState('hsl(44,53%,74%)');
    const [id, setID] = useState<number | null>(null);
    const [recieveblocker, setRecieveBlocker] = useState(false)

    const [removedStrokes, setRemovedStrokes] = useState<Stroke[]>([]);

    const [socket, setSocket] = useState<WebSocket | null>(null);

    const params = useParams();


    useEffect(() => {

        // socket setup
        setSocket(new WebSocket("ws://10.247.34.160:8080"));

        // dynamically set the size of the canvas to the container width
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // add ctrl+z event listener 
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();
                handleUndo();
            }
            else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
                event.preventDefault();
                handleRedo();
            }
        }
        window.addEventListener("keydown", handleKeyDown);

        // clean up on unmount 
        return () => window.removeEventListener("keydown", handleKeyDown);

    }, []);


    useEffect(() => {
        if (socket) {
            socket.onopen = () => {
                console.log("[client] SENT CONNECT REQ");
                const msg = JSON.stringify({"type": "connect", "board": params["slug"]})
                socket.send(msg);
            };
            
            socket.onmessage = (event: MessageEvent) => {
                const received = JSON.parse(event.data)
                if (received['type'] == "handshake") {
                    console.log("[client] RECEIVED HANDSHAKE; ID" + received['id'])
                    setID(received['id'])
                } else {
                    if (strokes == JSON.parse(event.data)) return;
                    console.log("[client] RECIEVED PURGED BOARD")
                    setRecieveBlocker(true)
                    setStrokes(JSON.parse(event.data))
                    console.log("[client] RE-RENDERED");
                }
            };
        }
    }, [socket]);
    
    // update canvas upon change to strokes array
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height) 
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        for (const stroke of strokes) {
            ctx.beginPath();
            ctx.strokeStyle = stroke.colour;
            stroke.points.forEach((point, index) => {
                if (index === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        }

        if (recieveblocker) {
            setRecieveBlocker(false)
        } else {
            if (!socket) return;
            console.log("SENDING", JSON.stringify(strokes))
            socket.send(JSON.stringify(strokes));
            setRecieveBlocker(false)
        }

    }, [strokes]); 

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDrawing(true);
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const point = { x: e.clientX - rect.left, y: e.clientY - rect.top};
        setCurrentStroke({points:[point], colour:currentColour});
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing) return; 
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const point = { x: e.clientX - rect.left, y: e.clientY - rect.top};
        setCurrentStroke((prev) => {
            if (!prev) return null;
            return {...prev, points: [...prev.points, point] };
        });
    }

    const handleMouseUp = () => { 
        if (!isDrawing) return; 
        setIsDrawing(false);    
        if (currentStroke) {
            setStrokes((prev) => [...prev, currentStroke]);
        }
        setCurrentStroke(null);
        setRemovedStrokes([]);
    }

    const handleUndo = () => {
        setStrokes((prev) => {
            if (prev.length === 0) return prev;
            const updatedStrokes = prev.slice(0, -1);
            const lastStroke = prev[prev.length - 1];
            setRemovedStrokes((rPrev) => [...rPrev, lastStroke]);
            return updatedStrokes;
        })
    }

    const handleRedo = () => {
        setRemovedStrokes((rPrev) => {
            if (rPrev.length === 0) return rPrev;
            const updatedRemoved = rPrev.slice(0, -1);
            const lastRemovedStroke = rPrev[rPrev.length - 1];
            setStrokes((prev) => [...prev, lastRemovedStroke]);
            return updatedRemoved;
        })
    }

    const handleChangeColour = (colour: string) => {
        setCurrentColour(colour);
    }

    return (
        <>
            <ToolBar 
            handleRedo={handleRedo}
            handleUndo={handleUndo}
            handleChangeColour={handleChangeColour}
            />
            <canvas 
            ref={canvasRef}        
            className='cursor-crosshair w-full h-full'
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            />
        </>
    )
}

export default Board