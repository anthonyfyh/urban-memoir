import Link from 'next/link'
import { categories } from '@/lib/categories'

export default function CategoryPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/start" className="text-stone-400 hover:text-stone-600 text-sm mb-10 block">← Back</Link>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B4886' }}>What's your story about?</h1>
        <p className="text-stone-400 mb-10">Pick the category that feels right.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.name}
              href={`/submit?category=${encodeURIComponent(cat.name)}`}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-stone-200 hover:[border-color:#2D6A4F] transition group flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.emoji}</span>
                <h2 className="text-stone-800 font-semibold group-hover:text-stone-900">{cat.name}</h2>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed">{cat.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
