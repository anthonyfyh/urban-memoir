import Link from 'next/link'

export default function StartPage() {
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full">
        <Link href="/" className="text-stone-400 hover:text-stone-600 text-sm mb-10 block">← Back</Link>
        <h1 className="text-3xl font-bold text-stone-800 mb-8 text-center">Where would you like to start?</h1>
        <div className="flex flex-col gap-4">
          <Link
            href="/category"
            className="rounded-2xl p-8 text-center shadow-sm hover:opacity-90 transition"
            style={{ backgroundColor: '#1B4886' }}
          >
            <p className="text-xl font-semibold text-white">I have a story in mind</p>
          </Link>
          <Link
            href="/prompts"
            className="bg-white rounded-2xl p-8 text-center shadow-sm hover:opacity-80 transition border-2"
            style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}
          >
            <p className="text-xl font-semibold">Give me some prompts to write about!</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
