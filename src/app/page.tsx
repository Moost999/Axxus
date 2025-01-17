'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, Bot, Zap, PlusCircle, ArrowRight, Coins, Play } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import { toast } from "@/hooks/use-toast"

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [stats, setStats] = useState({
    totalAssistants: 0,
    activeConversations: 0,
    totalUsers: 0,
    messagesProcessed: 0,
    tokens: 0,
    availableMessages: 0
  })
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard-stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const handleCardClick = (route: string) => {
    router.push(route)
  }

  const watchAd = async () => {
    try {
      const response = await fetch('/api/watch-ad', { method: 'POST' })
      const data = await response.json()
      if (response.ok) {
        setStats(prevStats => ({
          ...prevStats,
          tokens: prevStats.tokens + data.tokensEarned,
          availableMessages: prevStats.availableMessages + data.messagesEarned
        }))
        toast({
          title: "Ad Watched Successfully",
          description: `You earned ${data.tokensEarned} tokens and ${data.messagesEarned} messages!`,
        })
      } else {
        throw new Error(data.error || 'Failed to process ad watch')
      }
    } catch (error) {
      console.error('Error watching ad:', error)
      toast({
        title: "Error",
        description: "Failed to watch ad. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: isLoaded ? 1 : 0 }} 
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gradient font-orbitron">
          Welcome to AXXUS
        </h1>
        <Link href="/create-assistant">
          <Button className="bg-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Assistant
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total Assistants" value={stats.totalAssistants} icon={<Bot className="h-8 w-8 text-primary" />} onClick={() => handleCardClick('/assistants')} />
        <DashboardCard title="Active Conversations" value={stats.activeConversations} icon={<MessageSquare className="h-8 w-8 text-accent" />} onClick={() => handleCardClick('/conversations')} />
        <DashboardCard title="Available Messages" value={stats.availableMessages} icon={<Zap className="h-8 w-8 text-yellow-500" />} onClick={() => {}} />
        <DashboardCard title="Tokens" value={stats.tokens} icon={<Coins className="h-8 w-8 text-yellow-500" />} onClick={() => {}} />
      </div>

      <Card className="bg-card border-primary/10 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-gradient flex justify-between items-center">
            <span>Reward System</span>
            <Button onClick={watchAd} className="bg-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out hover:opacity-80">
              <Play className="mr-2 h-5 w-5" /> Watch Ad
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Watch ads to earn tokens and messages. Use tokens to create new assistants and messages to interact with them.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-primary/10 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-gradient flex justify-between items-center">
            <span>Recent Activity</span>
            <Button variant="ghost" size="sm" className="text-primary hover:text-accent">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <ActivityItem 
              title="New Assistant Created" 
              description="HR Assistant for onboarding process" 
              time="2 hours ago" 
            />
            <ActivityItem 
              title="Tokens Earned" 
              description="Watched ad and earned 10 messages" 
              time="5 hours ago" 
            />
            <ActivityItem 
              title="Assistant Updated" 
              description="Sales Assistant knowledge base refreshed" 
              time="Yesterday" 
            />
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function DashboardCard({ title, value, icon, onClick }: { title: string, value: number, icon: React.ReactNode, onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="bg-card border-primary/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient opacity-10" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ActivityItem({ title, description, time }: { title: string, description: string, time: string }) {
  return (
    <motion.li 
      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-secondary transition-colors duration-200"
      whileHover={{ x: 5 }}
    >
      <div className="flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-gradient"></div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text:foreground truncate">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
      <div className="inline-flex items-center text-sm text-muted-foreground">
        {time}
      </div>
    </motion.li>
  )
}

