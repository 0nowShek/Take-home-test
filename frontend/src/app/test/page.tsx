"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Rocket, Star, Heart, Coffee } from "lucide-react"

export default function CardAnimationTestPage() {
  const [showCards, setShowCards] = useState(true)
  const [staggerDelay, setStaggerDelay] = useState(50)

  const cards = [
    { 
      id: 1, 
      title: "First Card", 
      description: "Animates in first",
      icon: Sparkles,
      color: "bg-blue-500/10 border-blue-500/20" 
    },
    { 
      id: 2, 
      title: "Second Card", 
      description: "Follows 50ms later",
      icon: Zap,
      color: "bg-green-500/10 border-green-500/20" 
    },
    { 
      id: 3, 
      title: "Third Card", 
      description: "Another 50ms delay",
      icon: Rocket,
      color: "bg-purple-500/10 border-purple-500/20" 
    },
    { 
      id: 4, 
      title: "Fourth Card", 
      description: "Continues the cascade",
      icon: Star,
      color: "bg-orange-500/10 border-orange-500/20" 
    },
    { 
      id: 5, 
      title: "Fifth Card", 
      description: "Almost there...",
      icon: Heart,
      color: "bg-pink-500/10 border-pink-500/20" 
    },
    { 
      id: 6, 
      title: "Sixth Card", 
      description: "Final card appears",
      icon: Coffee,
      color: "bg-cyan-500/10 border-cyan-500/20" 
    },
  ]

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Card Animation Test 🎬</h1>
          <p className="text-muted-foreground">
            Watch cards fade and slide up with stagger effect
          </p>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              onClick={() => setShowCards(!showCards)}
              size="lg"
            >
              {showCards ? "Hide Cards" : "Show Cards (Watch Animation)"}
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Stagger Delay:</span>
              <Button
                variant={staggerDelay === 25 ? "default" : "outline"}
                size="sm"
                onClick={() => setStaggerDelay(25)}
              >
                25ms (Fast)
              </Button>
              <Button
                variant={staggerDelay === 50 ? "default" : "outline"}
                size="sm"
                onClick={() => setStaggerDelay(50)}
              >
                50ms (Normal)
              </Button>
              <Button
                variant={staggerDelay === 100 ? "default" : "outline"}
                size="sm"
                onClick={() => setStaggerDelay(100)}
              >
                100ms (Slow)
              </Button>
            </div>
          </div>
        </div>

        {/* Cards Grid with Animation */}
        {showCards && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => {
              const Icon = card.icon
              return (
                <Card
                  key={card.id}
                  className={`animate-in fade-in slide-in-from-bottom-4 ${card.color}`}
                  style={{
                    animationDelay: `${index * staggerDelay}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {card.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {card.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {index * staggerDelay}ms
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This card appears with a <strong>{index * staggerDelay}ms</strong> delay
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="h-2 rounded-full bg-current/20" />
                      <div className="h-2 rounded-full bg-current/20 w-3/4" />
                      <div className="h-2 rounded-full bg-current/20 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Explanation */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>The animation breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">CSS Classes:</h3>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                animate-in fade-in slide-in-from-bottom-4
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Inline Style (Stagger):</h3>
              <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
{`style={{
  animationDelay: \`\${index * 50}ms\`,
  animationFillMode: 'backwards'
}}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Animation Properties:</h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• <strong>Duration:</strong> 400ms (0.4s)</li>
                <li>• <strong>Easing:</strong> cubic-bezier(0.16, 1, 0.3, 1) - smooth bounce</li>
                <li>• <strong>Transform:</strong> translateY(16px) → 0 (slides up)</li>
                <li>• <strong>Opacity:</strong> 0 → 1 (fades in)</li>
                <li>• <strong>Stagger:</strong> 50ms delay between each card</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm">
                <strong>💡 Pro Tip:</strong> The <code className="bg-muted px-1 rounded">animationFillMode: 'backwards'</code> 
                prevents the flash - cards stay invisible until their animation starts!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}