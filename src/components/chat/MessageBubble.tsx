import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Props {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

export function MessageBubble({ role, content, streaming = false }: Props) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-sm text-white shadow-sm">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700">
        <ReactMarkdown
          components={{
            code({ className, children, ...rest }) {
              const match = /language-(\w+)/.exec(className ?? '')
              const inline = !match
              if (inline) {
                return (
                  <code
                    className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    {...rest}
                  >
                    {children}
                  </code>
                )
              }
              return (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="!my-2 !rounded-lg !text-xs"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              )
            },
            p({ children }) {
              return <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>
            },
            ul({ children }) {
              return <ul className="my-1 list-inside list-disc space-y-0.5">{children}</ul>
            },
            ol({ children }) {
              return <ol className="my-1 list-inside list-decimal space-y-0.5">{children}</ol>
            },
          }}
        >
          {content}
        </ReactMarkdown>
        {streaming && (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-indigo-400" />
        )}
      </div>
    </div>
  )
}
