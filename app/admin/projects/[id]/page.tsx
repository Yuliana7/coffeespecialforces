'use client'

import React from 'react'
import ProjectForm from '../../components/ProjectForm'

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const { id } = params
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Project</h1>
      <ProjectForm projectId={id} />
    </main>
  )
}
