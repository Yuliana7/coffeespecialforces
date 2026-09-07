import React from 'react'
import Uploader from '../../components/Uploader'

export default function UploadsPage() {
  // Example usage for project with id 1
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Uploads</h1>
      <p className="mb-4">Upload assets and attach to entities.</p>
      <Uploader entity="project" entityId="1" />
    </main>
  )
}
