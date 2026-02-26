import Link from 'next/link'
import Image from 'next/image'
import { Nothing_You_Could_Do } from 'next/font/google'

const nothingYouCouldDo = Nothing_You_Could_Do({ subsets: ['latin'], weight: '400' })

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col">
      <div className="w-full px-6 pt-6">
        <Image
          src="/2.png"
          alt="Urban Memoir banner"
          width={1200}
          height={500}
          className="w-full h-[250px] object-cover rounded-2xl"
          priority
        />
      </div>
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-16">
        <div className="max-w-md w-full text-center">
          <h1 className="text-5xl font-bold text-stone-800 mb-4">
            <span className="font-normal">An </span><span className={nothingYouCouldDo.className} style={{ color: '#C4922A' }}>Urban Memoir</span><span className="font-normal"> for Vancouver</span>
          </h1>
          <p className="text-stone-500 text-lg mb-12">This is a collection of stories that define Vancouver and its people.</p>
          <div className="flex flex-col gap-4">
            <Link href="/stories" style={{ backgroundColor: '#1B4886' }} className="text-white py-4 px-8 rounded-full text-lg hover:opacity-90 transition">
              Read the Memories of Vancouver
            </Link>
            <Link href="/start" style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }} className="border-2 py-4 px-8 rounded-full text-lg hover:opacity-80 transition">
              Write Your Chapter...
            </Link>
            <Link href="/prompts" className="text-stone-500 py-2 hover:text-stone-800 transition">
              <span className="underline underline-offset-2">Not sure what to share? Get inspired →</span>
            </Link>
            <p className="text-stone-400 text-sm mt-2">Note: no personal info will be collected and log in is not required. This is a not-for-profit community project :)</p>
          </div>
        </div>
      </div>
    </main>
  )
}
