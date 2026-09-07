'use client'

import React from 'react'
import ProjectForm from '../../components/ProjectForm'
import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const router = useRouter()

  const handleCreated = () => {
    router.push('/admin/projects')
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create Project</h1>
      <ProjectForm projectId={undefined} />
    </main>
  )
}
