'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { prompts, PROMPT_CATEGORIES } from '@/lib/prompts'
import { categories } from '@/lib/categories'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

const PROMPT_ONLY_EMOJIS: Record<string, string> = {
  'Sparks & Musings': '💡',
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function PromptsPage() {
  const [category, setCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [index, setIndex] = useState(0)

  const shuffled = useMemo(() => {
    const list = category === 'All' ? prompts : prompts.filter(p => p.category === category)
    return shuffle(list)
  }, [category])

  const current = shuffled[index]

  function handleCategory(cat: string) {
    setCategory(cat)
    setIndex(0)
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/start" className="text-stone-400 hover:text-stone-600 text-sm mb-8 block">← Back</Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-stone-800">Prompts</h1>
          <button
            onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
            className="text-sm text-stone-500 hover:text-stone-800 underline"
          >
            {viewMode === 'card' ? 'See all prompts' : 'Browse one at a time'}
          </button>
        </div>

        {/* Chapter strip */}
        <div className="flex gap-3 overflow-x-auto pb-3 mb-10 -mx-6 px-6">
          <button
            onClick={() => handleCategory('All')}
            className={`relative shrink-0 w-24 h-28 rounded-xl border flex flex-col items-center justify-center gap-1 transition overflow-hidden
              ${category === 'All' ? 'text-white border-transparent' : 'bg-white border-stone-200 hover:border-stone-400'}`}
            style={category === 'All' ? { backgroundColor: '#1B4886', borderColor: '#1B4886' } : {}}
          >
            <span className={`absolute text-6xl font-bold opacity-5 select-none ${category === 'All' ? 'text-white' : 'text-stone-800'}`}>∞</span>
            <span className={`text-xs font-mono z-10 ${category === 'All' ? 'text-stone-400' : 'text-stone-300'}`}>—</span>
            <span className={`text-xs font-medium z-10 text-center leading-tight px-2 ${category === 'All' ? 'text-white' : 'text-stone-600'}`}>All</span>
          </button>
          {PROMPT_CATEGORIES.map((cat, i) => {
            const catData = categories.find(c => c.name === cat)
            return (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`relative shrink-0 w-24 h-28 rounded-xl border flex flex-col items-center justify-center gap-1 transition overflow-hidden
                  ${category === cat ? 'text-white border-transparent' : 'bg-white border-stone-200 hover:border-stone-400'}`}
                style={category === cat ? { backgroundColor: '#1B4886', borderColor: '#1B4886' } : {}}
              >
                <span className={`absolute text-6xl font-bold opacity-5 select-none ${category === cat ? 'text-white' : 'text-stone-800'}`}>{ROMAN[i]}</span>
                <span className="text-xl z-10">{catData?.emoji || PROMPT_ONLY_EMOJIS[cat] || '📖'}</span>
                <span className={`text-xs font-medium z-10 text-center leading-tight px-2 ${category === cat ? 'text-white' : 'text-stone-600'}`}>{cat}</span>
              </button>
            )
          })}
        </div>

        {viewMode === 'card' ? (
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-2xl p-10 shadow-sm w-full min-h-48 flex items-center justify-center mb-8">
              <p className="text-xl text-stone-700 text-center leading-relaxed">{current?.text}</p>
            </div>
            <div className="flex items-center gap-6 mb-10">
              <button
                onClick={() => setIndex(i => Math.max(0, i - 1))}
                disabled={index === 0}
                className="px-6 py-3 rounded-full border-2 disabled:opacity-30 transition hover:opacity-80"
                style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}
              >
                ← Previous
              </button>
              <span className="text-stone-400 text-sm">{index + 1} / {shuffled.length}</span>
              <button
                onClick={() => setIndex(i => Math.min(shuffled.length - 1, i + 1))}
                disabled={index === shuffled.length - 1}
                className="px-6 py-3 rounded-full border-2 disabled:opacity-30 transition hover:opacity-80"
                style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}
              >
                Next →
              </button>
            </div>
            <Link
              href="/submit"
              className="text-white py-3 px-8 rounded-full hover:opacity-90 transition text-sm"
              style={{ backgroundColor: '#1B4886' }}
            >
              Write this story →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {(category === 'All' ? PROMPT_CATEGORIES : [category]).map(cat => (
              <div key={cat}>
                <h2 className="text-lg font-semibold text-stone-700 mb-4">{cat}</h2>
                <div className="flex flex-col gap-3">
                  {prompts.filter(p => p.category === cat).map((p, i) => (
                    <div key={i} className="bg-white rounded-xl px-5 py-4 shadow-sm text-stone-600 text-sm leading-relaxed">
                      {p.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
