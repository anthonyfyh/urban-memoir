'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const VANCOUVER_NAMES = ['Kitskisses', 'GranvilleGhost', 'MainStreetMuse', 'Gastown Wanderer', 'FalseCreekDreamer', 'CommDrive Soul', 'MountPleasant Mind', 'JerichoTide', 'CapilanoWhisper', 'StanleyParkStray']

function randomVancouverName() {
  const name = VANCOUVER_NAMES[Math.floor(Math.random() * VANCOUVER_NAMES.length)]
  const num = Math.floor(Math.random() * 900) + 100
  return `${name}${num}`
}

export default function StoryPage() {
  const { id } = useParams()
  const [story, setStory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [reported, setReported] = useState(false)
  const [storyLikes, setStoryLikes] = useState(0)
  const [hasLikedStory, setHasLikedStory] = useState(false)

  const [comments, setComments] = useState<any[]>([])
  const [commentForm, setCommentForm] = useState({ author_name: '', content: '' })
  const [useGeneratedName, setUseGeneratedName] = useState(false)
  const [generatedName, setGeneratedName] = useState(randomVancouverName())
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [commentSuccess, setCommentSuccess] = useState(false)
  const [reportedComments, setReportedComments] = useState<Set<number>>(new Set())
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set())
  const [commentLikes, setCommentLikes] = useState<Record<number, number>>({})

  async function handleReport() {
    await supabase.from('Stories').update({ is_reported: true }).eq('id', id)
    setReported(true)
  }

  async function handleLikeStory() {
    if (hasLikedStory) return
    const newCount = storyLikes + 1
    setStoryLikes(newCount)
    setHasLikedStory(true)
    localStorage.setItem(`liked_story_${id}`, 'true')
    await supabase.from('Stories').update({ likes: newCount }).eq('id', id)
  }

  async function handleLikeComment(commentId: number) {
    if (likedComments.has(commentId)) return
    const newCount = (commentLikes[commentId] || 0) + 1
    setCommentLikes(prev => ({ ...prev, [commentId]: newCount }))
    setLikedComments(prev => new Set(prev).add(commentId))
    localStorage.setItem(`liked_comment_${commentId}`, 'true')
    await supabase.from('Comments').update({ likes: newCount }).eq('id', commentId)
  }

  async function fetchComments() {
    const { data } = await supabase
      .from('Comments')
      .select('*')
      .eq('story_id', id)
      .order('created_at', { ascending: true })
    if (data) {
      setComments(data)
      const likes: Record<number, number> = {}
      const liked = new Set<number>()
      data.forEach(c => {
        likes[c.id] = c.likes || 0
        if (localStorage.getItem(`liked_comment_${c.id}`)) liked.add(c.id)
      })
      setCommentLikes(likes)
      setLikedComments(liked)
    }
  }

  useEffect(() => {
    async function fetchStory() {
      const { data } = await supabase.from('Stories').select('*').eq('id', id).single()
      if (!data) setNotFound(true)
      else {
        setStory(data)
        setStoryLikes(data.likes || 0)
        setHasLikedStory(!!localStorage.getItem(`liked_story_${id}`))
      }
      setLoading(false)
    }
    fetchStory()
    fetchComments()
  }, [id])

  async function handleCommentSubmit() {
    if (!commentForm.content.trim()) return setCommentError('Please write a comment.')
    const authorName = useGeneratedName ? generatedName : commentForm.author_name.trim()
    if (!authorName) return setCommentError('Please enter a name or use a generated one.')

    setSubmittingComment(true)
    setCommentError('')

    const { error } = await supabase.from('Comments').insert([{
      story_id: Number(id),
      author_name: authorName,
      content: commentForm.content,
      is_reported: false,
      likes: 0
    }])

    if (error) {
      setCommentError('Something went wrong. Please try again.')
      setSubmittingComment(false)
    } else {
      setCommentForm({ author_name: '', content: '' })
      setUseGeneratedName(false)
      setCommentSuccess(true)
      setSubmittingComment(false)
      fetchComments()
    }
  }

  async function handleReportComment(commentId: number) {
    await supabase.from('Comments').update({ is_reported: true }).eq('id', commentId)
    setReportedComments(prev => new Set(prev).add(commentId))
  }

  if (loading) return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center">
      <p className="text-stone-400">Loading...</p>
    </main>
  )

  if (notFound) return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-stone-500 mb-4">This story doesn't exist or has been removed.</p>
        <Link href="/stories" className="text-stone-800 underline text-sm">← Back to stories</Link>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12">
      <div className="max-w-xl mx-auto">
        <Link href="/stories" className="text-stone-400 hover:text-stone-600 text-sm mb-10 block">← Back to stories</Link>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white px-3 py-1 rounded-full" style={{ backgroundColor: '#2D6A4F' }}>{story.category}</span>
            <span className="text-xs text-stone-400">{new Date(story.created_at).toLocaleDateString()}</span>
          </div>
          {reported ? (
            <span className="text-sm text-stone-400 border border-stone-200 px-4 py-1.5 rounded-full">Reported</span>
          ) : (
            <button onClick={handleReport} className="text-sm text-red-400 border border-red-300 px-4 py-1.5 rounded-full hover:bg-red-50 transition">
              Report
            </button>
          )}
        </div>

        {story.title && (
          <h1 className="text-3xl font-bold mb-6" style={{ color: '#1B4886' }}>{story.title}</h1>
        )}

        {story.photo_url && (
          <img src={story.photo_url} className="rounded-2xl w-full object-cover max-h-72 mb-6" />
        )}

        <div className="text-stone-700 leading-relaxed text-lg mb-8 flex flex-col gap-4">
          {story.content.split(/\n\s*\n/).map((para: string, i: number) => (
            <p key={i}>{para.trim()}</p>
          ))}
        </div>

        {story.external_link && (
          <p className="text-stone-700 leading-relaxed text-lg mb-8">
            Check out this link:{' '}
            <a href={story.external_link} target="_blank" className="underline hover:text-stone-500">
              {story.external_link}
            </a>
          </p>
        )}

        <div className="flex items-center justify-between">
          <p className="text-lg" style={{ color: '#C4922A' }}>— {story.author_name}</p>
          <button
            onClick={handleLikeStory}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${hasLikedStory ? 'bg-red-50 border-red-200 text-red-400' : 'border-stone-200 text-stone-400 hover:border-red-200 hover:text-red-400 hover:bg-red-50'}`}
          >
            <span>{hasLikedStory ? '♥' : '♡'}</span>
            <span className="text-sm">{storyLikes}</span>
          </button>
        </div>

        {/* Comments section */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <h2 className="text-xl font-semibold text-stone-800 mb-6">
            {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? 's' : ''}` : 'Comments'}
          </h2>

          {comments.length === 0 ? (
            <p className="text-stone-400 text-sm mb-8">No comments yet. Be the first to leave one.</p>
          ) : (
            <div className="flex flex-col gap-4 mb-10">
              {comments.map(comment => (
                <div key={comment.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-sm font-medium text-stone-700">{comment.author_name}</span>
                      <span className="text-xs text-stone-400 ml-3">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    {reportedComments.has(comment.id) ? (
                      <span className="text-xs text-stone-400">Reported</span>
                    ) : (
                      <button
                        onClick={() => handleReportComment(comment.id)}
                        className="text-xs text-red-400 hover:text-red-500 transition"
                      >
                        Report
                      </button>
                    )}
                  </div>
                  <p className="text-stone-600 leading-relaxed mb-3">{comment.content}</p>
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition ${likedComments.has(comment.id) ? 'bg-red-50 border-red-200 text-red-400' : 'border-stone-200 text-stone-400 hover:border-red-200 hover:text-red-400 hover:bg-red-50'}`}
                  >
                    <span>{likedComments.has(comment.id) ? '♥' : '♡'}</span>
                    <span>{commentLikes[comment.id] || 0}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Comment form */}
          {commentSuccess ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <p className="text-stone-700 mb-1">Thanks for your comment!</p>
              <button
                onClick={() => setCommentSuccess(false)}
                className="text-sm text-stone-400 hover:text-stone-600 underline"
              >
                Leave another
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-stone-600 mb-4">Leave a comment</h3>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={commentForm.author_name}
                  onChange={e => setCommentForm({ ...commentForm, author_name: e.target.value })}
                  disabled={useGeneratedName}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:opacity-40 text-sm"
                />
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => { setUseGeneratedName(!useGeneratedName); setGeneratedName(randomVancouverName()) }}
                    className="text-xs text-stone-500 hover:text-stone-800 underline"
                  >
                    {useGeneratedName ? 'Use my own name instead' : 'Generate a name for me'}
                  </button>
                  {useGeneratedName && <span className="text-xs font-medium text-stone-700">{generatedName}</span>}
                </div>
              </div>

              <textarea
                rows={3}
                placeholder="Write a comment..."
                value={commentForm.content}
                onChange={e => setCommentForm({ ...commentForm, content: e.target.value })}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none text-sm mb-4"
              />

              {commentError && <p className="text-red-400 text-xs mb-3">{commentError}</p>}

              <button
                onClick={handleCommentSubmit}
                disabled={submittingComment}
                className="w-full bg-stone-800 text-white py-3 rounded-full text-sm hover:bg-stone-700 transition disabled:opacity-50"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 text-center">
          <p className="text-stone-400 text-sm mb-4">Got a story of your own?</p>
          <Link href="/submit" className="text-white py-3 px-8 rounded-full hover:opacity-90 transition text-sm" style={{ backgroundColor: '#1B4886' }}>
            Share Your Story
          </Link>
        </div>
      </div>
    </main>
  )
}
