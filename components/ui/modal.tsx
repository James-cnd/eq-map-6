"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ModalProps {
    children: React.ReactNode
    onClose: () => void
    className?: string
}

export function Modal({ children, onClose, className }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)

    // Handle click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        // Add event listener
        document.addEventListener("mousedown", handleClickOutside)

        // Clean up
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [onClose])

    return (
        <div className="fixed inset-0 z-[1003] flex items-center justify-center bg-black/50">
            <div ref={modalRef} className={cn("max-h-[90vh] overflow-auto", className)} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}