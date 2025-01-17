'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    whatsappApiKey: '',
    openaiKey: '',
    groqApiKey: '',
    enableNotifications: true,
    darkMode: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSwitchChange = (name: string) => {
    setSettings(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the settings to your backend
    console.log('Settings saved:', settings)
    toast({
      title: "Settings Saved",
      description: "Your settings have been successfully updated.",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold text-gradient font-orbitron mb-8">
        Settings
      </h1>
      <Card className="bg-card border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient font-orbitron">General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="whatsappApiKey" className="text-purple-300">WhatsApp API Key</Label>
              <Input
                id="whatsappApiKey"
                name="whatsappApiKey"
                value={settings.whatsappApiKey}
                onChange={handleChange}
                className="bg-gray-700 border-purple-500 text-white"
                placeholder="Enter your WhatsApp API Key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openaiKey" className="text-purple-300">OpenAI API Key</Label>
              <Input
                id="whatsappPhoneNumber"
                name="whatsappPhoneNumber"
                value={settings.openaiKey}
                onChange={handleChange}
                className="bg-gray-700 border-purple-500 text-white"
                placeholder="Enter your OpenAI API Key"
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='groqApiKey'>Groq API Key</Label>
              <Input 
              id='groqApiKey'
              name="groqApiKey"
              value={settings.openaiKey}
              onChange={handleChange}
              className='bg-gray-700 border-purple-500 text-white' 
              placeholder='Enter Your Groq API Key'/>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enableNotifications" className="text-purple-300">Enable Notifications</Label>
              <Switch
                id="enableNotifications"
                name="enableNotifications"
                checked={settings.enableNotifications}
                onCheckedChange={() => handleSwitchChange('enableNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="text-purple-300">Dark Mode</Label>
              <Switch
                id="darkMode"
                name="darkMode"
                checked={settings.darkMode}
                onCheckedChange={() => handleSwitchChange('darkMode')}
              />
            </div>
            <Button type="submit" className="w-full bg-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out hover:opacity-80">
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

