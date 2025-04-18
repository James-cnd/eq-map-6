"use client"

import { useState } from "react"
import { Book } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import PublicReferences from "./public-references"

export default function ReferencesButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [references] = useLocalStorage<any[]>("earthquakeReferences", [])

  // Safe way to count references
  const referenceCount = Array.isArray(references) ? references.length : 0

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[1000] bg-gray-800 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
        title="View References"
      >
        <Book className="h-5 w-5" />
        {referenceCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {referenceCount}
          </span>
        )}
      </button>

      {isOpen && <PublicReferences onClose={() => setIsOpen(false)} />}
    </>
  )
}
