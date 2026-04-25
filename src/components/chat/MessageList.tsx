import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface Props {
  messages: Message[]
  loading?: boolean
}

export function MessageList({ messages, loading = false }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-500">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-sm">发送消息开始对话</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          role={msg.role}
          content={msg.content}
          streaming={msg.streaming}
        />
      ))}
      {loading && messages.length === 0 && (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-gray-500 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            AI 正在输入…
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
