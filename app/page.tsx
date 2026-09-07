import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src="/assets/logo.jpg" alt="logo" className="h-12 w-12 object-cover rounded" />
          <h1 className="text-2xl font-semibold">Coffee Special Forces</h1>
        </div>
        <nav className="flex gap-4">
          <Link href="/work-areas">Work areas</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/events">Events</Link>
          <Link href="/foundation">Foundation</Link>
          <Link href="/locations">Locations</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>

      <section>
        <h2 className="text-xl font-bold mb-4">Latest projects</h2>
        <p>Placeholder for latest projects — seeded data includes an initial campaign.</p>
      </section>
    </main>
  )
}
