"use client"

import type React from "react"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface Position {
    x: number
    y: number
}

interface Size {
    width: number
    height: number
}

interface DraggablePanelProps {
    children: ReactNode
    onClose: () => void
    title?: string
    initialPosition?: Position
    className?: string
}

export function DraggablePanel({
    children,
    onClose,
    title = "Panel",
    initialPosition = { x: 100, y: 100 },
    className = "",
}: DraggablePanelProps) {
    const [position, setPosition] = useState<Position>(initialPosition)
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
    const [size, setSize] = useState<Size>({ width: 400, height: 500 })
    const [isResizing, setIsResizing] = useState(false)
    const [resizeDirection, setResizeDirection] = useState<string | null>(null)

    const panelRef = useRef<HTMLDivElement>(null)

    // Handle mouse down on panel header for dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target instanceof HTMLElement && e.target.closest(".panel-header")) {
            setIsDragging(true)
            const rect = panelRef.current?.getBoundingClientRect()
            if (rect) {
                setDragOffset({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                })
            }
        }
    }

    // Handle mouse down on resize handles
    const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation()
        setIsResizing(true)
        setResizeDirection(direction)
    }

    // Handle mouse move for dragging and resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y,
                })
            } else if (isResizing && resizeDirection) {
                e.preventDefault()

                const rect = panelRef.current?.getBoundingClientRect()
                if (!rect) return

                let newWidth = size.width
                let newHeight = size.height

                if (resizeDirection.includes("e")) {
                    newWidth = Math.max(200, e.clientX - rect.left)
                }
                if (resizeDirection.includes("s")) {
                    newHeight = Math.max(200, e.clientY - rect.top)
                }
                if (resizeDirection.includes("w")) {
                    const deltaX = rect.left - e.clientX
                    newWidth = Math.max(200, rect.width + deltaX)
                    setPosition((prev) => ({
                        ...prev,
                        x: e.clientX,
                    }))
                }
                if (resizeDirection.includes("n")) {
                    const deltaY = rect.top - e.clientY
                    newHeight = Math.max(200, rect.height + deltaY)
                    setPosition((prev) => ({
                        ...prev,
                        y: e.clientY,
                    }))
                }

                setSize({ width: newWidth, height: newHeight })
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            setIsResizing(false)
            setResizeDirection(null)
        }

        if (isDragging || isResizing) {
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isDragging, dragOffset, isResizing, resizeDirection, size.width, size.height])

    // Ensure panel stays within viewport
    useEffect(() => {
        const checkBounds = () => {
            if (!panelRef.current) return

            const rect = panelRef.current.getBoundingClientRect()
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            let newX = position.x
            let newY = position.y

            // Check right edge
            if (rect.right > viewportWidth) {
                newX = viewportWidth - rect.width
            }

            // Check bottom edge
            if (rect.bottom > viewportHeight) {
                newY = viewportHeight - rect.height
            }

            // Check left edge
            if (rect.left < 0) {
                newX = 0
            }

            // Check top edge
            if (rect.top < 0) {
                newY = 0
            }

            if (newX !== position.x || newY !== position.y) {
                setPosition({ x: newX, y: newY })
            }
        }

        checkBounds()

        window.addEventListener("resize", checkBounds)
        return () => window.removeEventListener("resize", checkBounds)
    }, [position, size])

    return (
        <div
            ref={panelRef}
            className={`fixed z-[1010] shadow-xl ${className}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
                cursor: isDragging ? "grabbing" : "default",
            }}
            onMouseDown={handleMouseDown}
        >
            <Card className="h-full flex flex-col overflow-hidden border-gray-700 bg-gray-900/95 text-white">
                <CardHeader className="panel-header p-3 cursor-grab border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-auto">{children}</CardContent>
            </Card>

            {/* Resize handles */}
            <div
                className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, "se")}
            />
            <div
                className="absolute bottom-0 left-0 w-6 h-6 cursor-sw-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
            />
            <div
                className="absolute top-0 right-0 w-6 h-6 cursor-ne-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
            />
            <div
                className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
            />
            <div className="absolute top-0 w-full h-3 cursor-n-resize" onMouseDown={(e) => handleResizeMouseDown(e, "n")} />
            <div
                className="absolute bottom-0 w-full h-3 cursor-s-resize"
                onMouseDown={(e) => handleResizeMouseDown(e, "s")}
            />
            <div className="absolute left-0 h-full w-3 cursor-w-resize" onMouseDown={(e) => handleResizeMouseDown(e, "w")} />
            <div className="absolute right-0 h-full w-3 cursor-e-resize" onMouseDown={(e) => handleResizeMouseDown(e, "e")} />
        </div>
    )
}