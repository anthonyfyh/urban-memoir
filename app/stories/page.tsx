'use client'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { categories } from '@/lib/categories'
import { useSearchParams, useRouter } from 'next/navigation'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

type SortOption = 'recent' | 'most_liked' | 'week' | 'month' | 'year'

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Most Liked', value: 'most_liked' },
  { label: 'Best of This Week', value: 'week' },
  { label: 'Best of This Month', value: 'month' },
  { label: 'Best of This Year', value: 'year' },
]

function getDateCutoff(sort: SortOption): string | null {
  const now = new Date()
  if (sort === 'week') return new Date(now.setDate(now.getDate() - 7)).toISOString()
  if (sort === 'month') return new Date(now.setMonth(now.getMonth() - 1)).toISOString()
  if (sort === 'year') return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString()
  return null
}

function StoriesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showModal, setShowModal] = useState(searchParams.get('submitted') === 'true')

  const [stories, setStories] = useState<any[]>([])
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({})
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<SortOption>('recent')
  const [loading, setLoading] = useState(true)

  function dismissModal() {
    setShowModal(false)
    router.replace('/stories')
  }

  useEffect(() => {
    fetchStories()
  }, [category, sort])

  async function fetchStories() {
    setLoading(true)

    let query = supabase.from('Stories').select('*')
    if (category !== 'All') query = query.eq('category', category)

    const cutoff = getDateCutoff(sort)
    if (cutoff) query = query.gte('created_at', cutoff)

    if (sort === 'recent') {
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order('likes', { ascending: false }).order('created_at', { ascending: false })
    }

    const { data } = await query
    setStories(data || [])

    const { data: commentData } = await supabase.from('Comments').select('story_id')
    const counts: Record<number, number> = {}
    commentData?.forEach(c => { counts[c.story_id] = (counts[c.story_id] || 0) + 1 })
    setCommentCounts(counts)

    setLoading(false)
  }

  function handleSelectCategory(cat: string) {
    setCategory(cat)
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12">

      {/* Submission success modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center">
            <p className="text-2xl mb-3">🎉</p>
            <h2 className="text-lg font-semibold text-stone-800 mb-3">Thanks for sharing your story!</h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              Feel free to read other people's submissions, or come say hi on our{' '}
              <a
                href="https://www.instagram.com/urban._.memoir?igsh=dmIycHB6cDhnamEy&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
                style={{ color: '#C4922A' }}
              >
                Instagram page
              </a>
              !
            </p>
            <button
              onClick={dismissModal}
              className="w-full text-white py-3 rounded-full hover:opacity-90 transition"
              style={{ backgroundColor: '#1B4886' }}
            >
              Read the stories
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-stone-400 hover:text-stone-600 text-sm mb-8 block">← Back</Link>
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#1B4886' }}>Stories of Vancouver</h1>

        {/* Chapter strip */}
        <p className="text-sm text-stone-400 mb-3">Select a chapter to read...</p>
        <div className="flex gap-3 overflow-x-auto pb-3 mb-8 scrollbar-hide -mx-6 px-6">
          <button
            onClick={() => handleSelectCategory('All')}
            className={`relative shrink-0 w-24 h-28 rounded-xl border flex flex-col items-center justify-center gap-1 transition overflow-hidden
              ${category === 'All' ? 'text-white border-transparent' : 'bg-white border-stone-200 hover:border-stone-400'}`}
            style={category === 'All' ? { backgroundColor: '#1B4886', borderColor: '#1B4886' } : {}}
          >
            <span className={`absolute text-6xl font-bold opacity-5 select-none ${category === 'All' ? 'text-white' : 'text-stone-800'}`}>∞</span>
            <span className={`text-xs font-mono z-10 ${category === 'All' ? 'text-stone-400' : 'text-stone-300'}`}>—</span>
            <span className={`text-xs font-medium z-10 text-center leading-tight px-2 ${category === 'All' ? 'text-white' : 'text-stone-600'}`}>All</span>
          </button>
          {categories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => handleSelectCategory(cat.name)}
              className={`relative shrink-0 w-24 h-28 rounded-xl border flex flex-col items-center justify-center gap-1 transition overflow-hidden
                ${category === cat.name ? 'text-white border-transparent' : 'bg-white border-stone-200 hover:border-stone-400'}`}
              style={category === cat.name ? { backgroundColor: '#1B4886', borderColor: '#1B4886' } : {}}
            >
              <span className={`absolute text-6xl font-bold opacity-5 select-none ${category === cat.name ? 'text-white' : 'text-stone-800'}`}>{ROMAN[i]}</span>
              <span className="text-xl z-10">{cat.emoji}</span>
              <span className={`text-xs font-medium z-10 text-center leading-tight px-2 ${category === cat.name ? 'text-white' : 'text-stone-600'}`}>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Sort options */}
        <div className="flex items-center gap-4 flex-wrap mb-10">
          <span className="text-xs text-stone-400 uppercase tracking-widest">Sort by</span>
          {SORT_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setSort(option.value)}
              className={`text-sm transition pb-0.5 ${sort === option.value ? 'border-b' : 'text-stone-400 hover:text-stone-600'}`}
              style={sort === option.value ? { color: '#C4922A', borderColor: '#C4922A' } : {}}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Stories */}
        {loading ? (
          <p className="text-stone-400">Loading...</p>
        ) : stories.length === 0 ? (
          <p className="text-stone-400">No stories in this chapter yet. Be the first to share one.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {stories.map(story => (
              <Link key={story.id} href={`/stories/${story.id}`} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition flex gap-4">
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-white px-3 py-1 rounded-full" style={{ backgroundColor: '#2D6A4F' }}>{story.category}</span>
                    <span className="text-xs text-stone-400 ml-2 shrink-0">{new Date(story.created_at).toLocaleDateString()}</span>
                  </div>
                  {story.title && <h2 className="text-stone-800 font-semibold mb-2">{story.title}</h2>}
                  <p className="text-stone-700 leading-relaxed line-clamp-3 mb-4">{story.content}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-sm" style={{ color: '#C4922A' }}>— {story.author_name}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-stone-400">♥ {story.likes || 0}</span>
                      <span className="text-xs text-stone-400">💬 {commentCounts[story.id] || 0}</span>
                    </div>
                  </div>
                </div>
                {story.photo_url && (
                  <div className="w-[40%] shrink-0">
                    <img src={story.photo_url} className="rounded-xl w-full h-full object-cover aspect-square" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/start" className="text-white py-3 px-8 rounded-full hover:opacity-90 transition" style={{ backgroundColor: '#1B4886' }}>
            Share Your Story
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function StoriesPageWrapper() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-stone-50 flex items-center justify-center"><p className="text-stone-400">Loading...</p></main>}>
      <StoriesPage />
    </Suspense>
  )
}
