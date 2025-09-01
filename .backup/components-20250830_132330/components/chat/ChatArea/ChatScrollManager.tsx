"use client"

import React, { useEffect, useRef, useState } from 'react'

interface ChatScrollManagerProps {
  messages: any[]
  onVisibleMessagesChange: (visibleMessages: Set<string>) => void
  children: React.ReactNode
}

export function ChatScrollManager({
  messages,
  onVisibleMessagesChange,
  children
}: ChatScrollManagerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current && isNearBottom) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    }

    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100)
    }
  }, [messages, isNearBottom])

  // Track scroll position to determine if user is near bottom
  useEffect(() => {
    const el = scrollAreaRef.current
    if (!el) return

    const handleScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      setIsNearBottom(distance < 120) // Consider "near bottom" if within 120px
    }

    handleScroll() // Initial check
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection Observer for message animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleMessages = new Set<string>()

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleMessages.add(entry.target.id)
          }
        })

        onVisibleMessagesChange(visibleMessages)
      },
      {
        threshold: 0.1,
        root: scrollAreaRef.current,
        rootMargin: '50px'
      }
    )

    // Observe all message elements
    const messageElements = document.querySelectorAll('[data-message-id]')
    messageElements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [messages, onVisibleMessagesChange])

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main chat area with single scroll container */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto overscroll-contain chat-scroll-container"
      >
        <div
          className="mx-auto space-y-6 px-4 sm:px-6 py-6 max-w-3xl pb-8"
          data-testid="messages-container"
        >
          {children}
        </div>

        {/* Invisible element at the bottom for scrolling reference */}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  )
}
