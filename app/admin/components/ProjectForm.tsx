'use client'

import React, { useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Uploader from '../Uploader'

export default function ProjectForm({ projectId }: { projectId?: string }) {
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('draft')
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [locationId, setLocationId] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [translations, setTranslations] = useState<any[]>([
    { locale: 'en', title: '', summary: '', content: '' },
    { locale: 'uk', title: '', summary: '', content: '' }
  ])

  const editor = useEditor({
    extensions: [StarterKit],
    content: ''
  })

  useEffect(() => {
    if (!projectId) return
    ;(async () => {
      setLoading(true)
      const res = await fetch(`/api/admin/projects/${projectId}`)
      const data = await res.json()
      if (res.ok) {
        const p = data.project
        setSlug(p.slug)
        setStatus(p.status)
        setStartDate(p.startDate ? new Date(p.startDate).toISOString().slice(0,10) : null)
        setEndDate(p.endDate ? new Date(p.endDate).toISOString().slice(0,10) : null)
        setImages(p.images || [])
        // map translations into our state
        const tmap = translations.map(t => {
          const found = p.translations.find((pt: any) => pt.locale === t.locale)
          return found ? { locale: t.locale, title: found.title, summary: found.summary, content: found.content } : t
        })
        setTranslations(tmap)
        // set editor content from first translation content (en)
        const en = tmap.find((t: any) => t.locale === 'en')
        if (editor && en) editor.commands.setContent(en.content || '')
      }
      setLoading(false)
    })()
  }, [projectId])

  const handleTranslationChange = (locale: string, field: string, value: string) => {
    setTranslations(prev => prev.map(t => t.locale === locale ? { ...t, [field]: value } : t))
    if (locale === 'en' && field === 'content' && editor) editor.commands.setContent(value)
  }

  const handleUploadComplete = (url: string) => {
    setImages(prev => [...prev, url])
  }

  const save = async () => {
    setLoading(true)
    // collect content from editor into translations[en]
    const enIndex = translations.findIndex(t => t.locale === 'en')
    const content = editor ? editor.getHTML() : ''
    const newTranslations = translations.map(t => t.locale === 'en' ? { ...t, content } : t)

    const payload = {
      slug,
      status,
      startDate,
      endDate,
      locationId,
      images,
      translations: newTranslations
    }

    const url = projectId ? `/api/admin/projects/${projectId}` : '/api/admin/projects'
    const method = projectId ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      alert('Saved')
    } else {
      const err = await res.json()
      alert('Error: ' + (err.error || 'Could not save'))
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-4">
        <label className="block">Slug</label>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className="border p-2 w-full" />
      </div>
      <div className="mb-4">
        <label className="block">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block">Dates</label>
        <input type="date" value={startDate ?? ''} onChange={(e) => setStartDate(e.target.value)} className="mr-2" />
        <input type="date" value={endDate ?? ''} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Images</label>
        <div className="mb-2">
          <Uploader entity="project" entityId={projectId ?? 'new'} onComplete={handleUploadComplete} />
        </div>
        <div className="flex gap-2 mt-2">
          {images.map((img, i) => (
            <div key={i} className="w-24 h-24 border p-1">
              <img src={img} alt={`img-${i}`} className="object-cover w-full h-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-bold mb-2">Translations</h3>
        {translations.map((t, idx) => (
          <div key={t.locale} className="mb-4 border p-2">
            <h4 className="font-semibold">{t.locale.toUpperCase()}</h4>
            <div className="mt-2">
              <label className="block">Title</label>
              <input value={t.title} onChange={(e) => handleTranslationChange(t.locale, 'title', e.target.value)} className="border p-2 w-full" />
            </div>
            <div className="mt-2">
              <label className="block">Summary</label>
              <input value={t.summary} onChange={(e) => handleTranslationChange(t.locale, 'summary', e.target.value)} className="border p-2 w-full" />
            </div>
            <div className="mt-2">
              <label className="block">Content</label>
              {t.locale === 'en' ? (
                <div>
                  <EditorContent editor={editor} />
                </div>
              ) : (
                <textarea value={t.content} onChange={(e) => handleTranslationChange(t.locale, 'content', e.target.value)} className="border p-2 w-full h-40" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
        <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
      </div>
    </div>
  )
}
