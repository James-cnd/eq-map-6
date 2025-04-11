import type React from "react"

export function VolcanoIcon(props: React.SVGProps<SVGSVGElement>) {
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
      {/* Volcano cone */}
      <path d="M12 3L4 20h16L12 3z" />

      {/* Crater */}
      <path d="M8 20c0-2 2-3 4-3s4 1 4 3" />

      {/* Smoke/gas */}
      <path d="M12 3c0 0 0-2 2-2" />
      <path d="M14 1c0 0 1 0.5 1 1.5" />
      <path d="M15 2.5c0 0 0.5 0 1-0.5" />
    </svg>
  )
}
