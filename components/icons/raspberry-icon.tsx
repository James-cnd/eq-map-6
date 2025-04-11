import type React from "react"

export function RaspberryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Raspberry Pi logo stylized */}
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      <path d="M12 6v12" />
      <path d="M8 10l8 4" />
      <path d="M16 10l-8 4" />
      <path d="M9 7c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" />
      <path d="M19 7c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" />
      <path d="M9 17c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" />
      <path d="M19 17c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" />
    </svg>
  )
}
