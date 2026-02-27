'use client'
import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { categories } from '@/lib/categories'

const VANCOUVER_NAMES = ['Kitskisses', 'GranvilleGhost', 'MainStreetMuse', 'Gastown Wanderer', 'FalseCreekDreamer', 'CommDrive Soul', 'MountPleasant Mind', 'JerichoTide', 'CapilanoWhisper', 'StanleyParkStray']

function randomVancouverName() {
  const name = VANCOUVER_NAMES[Math.floor(Math.random() * VANCOUVER_NAMES.length)]
  const num = Math.floor(Math.random() * 900) + 100
  return `${name}${num}`
}

function SubmitForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryName = searchParams.get('category') || ''
  const categoryData = categories.find(c => c.name === categoryName)

  const [form, setForm] = useState({ author_name: '', content: '', external_link: '', title: '' })
  const [useGeneratedName, setUseGeneratedName] = useState(false)
  const [generatedName, setGeneratedName] = useState(randomVancouverName())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [shareOnInstagram, setShareOnInstagram] = useState(false)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!categoryName) return setError('No category selected. Please go back and choose one.')
    if (!form.content.trim()) return setError('Please write your story.')
    const authorName = useGeneratedName ? generatedName : form.author_name.trim()
    if (!authorName) return setError('Please enter a name or use a generated one.')

    setSubmitting(true)

    let photoUrl: string | null = null

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const filename = `${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filename, photoFile, { upsert: false })
      if (uploadError) {
        setError('Failed to upload photo. Please try again.')
        setSubmitting(false)
        return
      }
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(uploadData.path)
      photoUrl = urlData.publicUrl
    }

    const { error } = await supabase.from('Stories').insert([{
      author_name: authorName,
      category: categoryName,
      title: form.title || null,
      content: form.content,
      external_link: form.external_link || null,
      photo_url: photoUrl,
      share_on_instagram: shareOnInstagram,
      is_reported: false
    }])

    if (error) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    } else {
      router.push('/stories?submitted=true')
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12">
      <div className="max-w-xl mx-auto">
        <Link href="/category" className="text-stone-400 hover:text-stone-600 text-sm mb-8 block">← Back</Link>
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#1B4886' }}>Share Your Story</h1>
        <p className="text-stone-400 mb-10">No account needed. Just your words.</p>

        {/* Selected category display */}
        {categoryData && (
          <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl px-5 py-4 mb-8">
            <span className="text-2xl">{categoryData.emoji}</span>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Writing about</p>
              <p className="text-stone-800 font-semibold">{categoryData.name}</p>
            </div>
            <Link href="/category" className="ml-auto text-xs text-stone-400 hover:text-stone-600 underline">Change</Link>
          </div>
        )}

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-600 mb-2">Title</label>
          <input
            type="text"
            placeholder="Give your story a title..."
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
        </div>

        {/* Story */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-600 mb-2">Your Story</label>
          <textarea
            rows={6}
            placeholder="Tell us your story..."
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
          />
        </div>

        {/* Photo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-600 mb-2">Got a pic to share? <span className="text-stone-400 font-normal">(optional)</span></label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:text-white file:[background-color:#2D6A4F] cursor-pointer"
          />
          {photoPreview && (
            <div className="mt-3 relative">
              <img src={photoPreview} className="rounded-xl w-full object-cover max-h-48" />
              <button
                onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                className="absolute top-2 right-2 bg-white text-stone-600 rounded-full px-2 py-0.5 text-xs shadow hover:bg-stone-100"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Optional link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-600 mb-2">
            Got a link to share? <span className="text-stone-400 font-normal">(something interesting or even your own page!)</span>
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={form.external_link}
            onChange={e => setForm({ ...form, external_link: e.target.value })}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
        </div>

        {/* Name */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-stone-600 mb-2">What's the name you'd like this story to be remembered by?</label>
          <input
            type="text"
            placeholder="First name, initials, or pen name"
            value={form.author_name}
            onChange={e => setForm({ ...form, author_name: e.target.value })}
            disabled={useGeneratedName}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:opacity-40"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => { setUseGeneratedName(!useGeneratedName); setGeneratedName(randomVancouverName()) }}
              className="text-sm underline hover:opacity-80"
              style={{ color: '#C4922A' }}
            >
              {useGeneratedName ? 'Use my own name instead' : 'Generate a name for me'}
            </button>
            {useGeneratedName && <span className="text-sm font-medium text-stone-700">{generatedName}</span>}
          </div>
        </div>

        {/* Instagram sharing */}
        <div className="mb-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={shareOnInstagram}
              onChange={e => setShareOnInstagram(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-stone-300 accent-stone-800"
            />
            <span className="text-sm text-stone-600">Check this if you'd like your story to be shared on our Instagram page</span>
          </label>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full text-white py-4 rounded-full text-lg hover:opacity-90 transition disabled:opacity-50"
          style={{ backgroundColor: '#1B4886' }}
        >
          {submitting ? 'Sharing...' : 'Share Story'}
        </button>

        <div className="mt-6 text-center">
          <Link href="/prompts" className="text-sm hover:opacity-80" style={{ color: '#C4922A' }}>Not sure what to write? Get inspired →</Link>
        </div>
      </div>
    </main>
  )
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-stone-50 flex items-center justify-center"><p className="text-stone-400">Loading...</p></main>}>
      <SubmitForm />
    </Suspense>
  )
}
