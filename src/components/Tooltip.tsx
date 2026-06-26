import React from 'react'

type TooltipProps = {
  content: React.ReactNode
  children: React.ReactNode
  maxWidthClassName?: string
}

export function Tooltip({ content, children, maxWidthClassName }: TooltipProps) {
  if (content === null || content === undefined || content === '') return <>{children}</>

  return (
    <span className="relative inline-flex group">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-max -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <span className={['relative block rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-lg', maxWidthClassName ?? 'max-w-[420px]'].join(' ')}>
          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-zinc-200 bg-white" />
          <span className="block whitespace-pre-wrap break-words">{content}</span>
        </span>
      </span>
    </span>
  )
}

