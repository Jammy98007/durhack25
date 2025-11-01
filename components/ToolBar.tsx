import Image from 'next/image'
import React from 'react'

type ToolBarProps = {
    handleUndo: () => void;
    handleRedo: () => void;
}

const ToolBar = ({ handleUndo, handleRedo }: ToolBarProps) => {
    const buttons = [
        {
            "text": "undo",
            "image": "/icons/undo.svg",
            "onClick": handleUndo,
        },
        {
            "text": "redo",
            "image": "/icons/redo.svg",
            "onClick": handleRedo,
        }
    ]

    return (
        <div className='fixed w-fit h-fit left-1/2 -translate-x-1/2 top-[1%] card flex gap-(--gap-small)'>
            {buttons.map((button, i) => (
                <div 
                key={i} 
                className='button h-12 aspect-square relative cursor-pointer p-[8%]'
                onClick={button.onClick}
                >
                    <Image 
                    src={button.image}
                    width={0}
                    height={0}
                    alt={button.text}
                    className='w-full h-full'
                    />
                </div>
            ))}
        </div>
    )
}

export default ToolBar
