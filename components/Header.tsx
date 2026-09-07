import React from 'react'

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <img src="/assets/logo.jpg" alt="logo" className="h-10 w-10 object-cover rounded" />
        <div className="text-lg font-semibold">Coffee Special Forces</div>
      </div>
    </header>
  )
}
