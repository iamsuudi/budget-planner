import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { useSecurity } from '#/lib/security'

export const Route = createFileRoute('/welcome')({
  component: WelcomePage,
})

const slides = [
  {
    title: 'Welcome to Budget Manager',
    description: 'Your all-in-one productivity suite: Budget Planner, Todo List, and Notes - three powerful apps in one.',
    icon: '🚀',
    color: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Budget Planner',
    description: 'Take control of your finances. Track expenses, manage wallets, and set monthly budgets with ease.',
    icon: '💰',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    title: 'Todo List',
    description: 'Stay organized with categorized task lists. Set priorities and track your daily productivity.',
    icon: '✅',
    color: 'from-green-500 to-emerald-600',
  },
  {
    title: 'Notes',
    description: 'Capture your thoughts with rich text editing. Organize ideas, plans, and important information.',
    icon: '📝',
    color: 'from-orange-500 to-amber-600',
  },
  {
    title: 'Secure Your Data',
    description: 'Protect your personal information with PIN and biometric authentication. Your data stays private.',
    icon: '🔒',
    color: 'from-red-500 to-pink-600',
  },
]

function WelcomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleGetStarted = () => {
    localStorage.setItem('welcome-seen', 'true')
    navigate({ to: '/settings/security/pin' })
  }

  const handleSkip = () => {
    localStorage.setItem('welcome-seen', 'true')
    navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleSkip}
          className="text-sm text-slate-400 hover:text-white px-4 py-2"
        >
          Skip
        </button>
      </div>

      {/* Slides container */}
      <div className="relative h-screen">
        <div
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="w-full h-full flex-shrink-0 flex items-center justify-center p-6"
            >
              <div className="text-center max-w-sm">
                {/* Icon */}
                <div
                  className={`w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br ${slide.color} flex items-center justify-center text-6xl shadow-2xl`}
                >
                  {slide.icon}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-4">
                  {slide.title}
                </h1>

                {/* Description */}
                <p className="text-lg text-slate-300 leading-relaxed">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 to-transparent">
        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {currentSlide > 0 ? (
            <button
              onClick={prevSlide}
              className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentSlide < slides.length - 1 ? (
            <button
              onClick={nextSlide}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleGetStarted}
              className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Get Started
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
