import React, { useState, useRef } from 'react'

export default function Uploader({ entity, entityId, onComplete }: { entity: string; entityId: string; onComplete?: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [message, setMessage] = useState<string>('')
  const controllerRef = useRef<AbortController | null>(null)

  const handleFile = (f: File | null) => {
    setFile(f)
    setProgress(0)
    setMessage('')
  }

  const upload = async () => {
    if (!file) return
    setMessage('Getting upload URL...')

    const resp = await fetch('/api/uploads/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        entity,
        entityId,
        env: process.env.NEXT_PUBLIC_NODE_ENV || 'prod'
      })
    })
    const data = await resp.json()
    if (!resp.ok) {
      setMessage(data.error || 'Failed to get upload URL')
      return
    }

    const { signedUrl, publicUrl } = data

    setMessage('Uploading...')

    // Use XMLHttpRequest so we can report progress reliably
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', signedUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve()
        else reject(new Error('Upload failed'))
      }
      xhr.onerror = () => reject(new Error('Upload failed'))
      xhr.send(file)
    }).catch((err) => {
      setMessage('Upload failed')
      console.error(err)
      return
    })

    setProgress(100)
    setMessage('Upload complete, saving reference...')

    const completeResp = await fetch('/api/uploads/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity, entityId, url: publicUrl, key: '' })
    })
    const completeData = await completeResp.json()
    if (!completeResp.ok) {
      setMessage(completeData.error || 'Failed to save upload')
      return
    }
    setMessage('File attached successfully')
    if (onComplete) onComplete(publicUrl)
  }

  return (
    <div className="border p-4 rounded">
      <label className="block mb-2">Upload file</label>
      <input type="file" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
      <div className="mt-2">
        <button onClick={upload} className="px-3 py-1 bg-blue-600 text-white rounded mt-2">Upload</button>
      </div>
      {progress > 0 && <div className="mt-2">Progress: {progress}%</div>}
      {message && <div className="mt-2 text-sm">{message}</div>}
    </div>
  )
}
