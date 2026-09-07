'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ProjectsPage() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/admin/projects')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    })()
  }, [])

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/admin/projects/new" className="px-3 py-1 bg-blue-600 text-white rounded">Create</Link>
      </div>
      <div>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Slug</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.slug}</td>
                <td className="p-2">{p.status}</td>
                <td className="p-2">
                  <Link href={`/admin/projects/${p.id}`} className="text-blue-600">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
