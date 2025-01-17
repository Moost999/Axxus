'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Bot, ChevronRight, ChevronLeft, Smartphone, Coins } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const models = [
  { value: "GPT4", label: "GPT-4" },
  { value: "GPT3", label: "GPT-3.5" },
]

const personalities = [
  { value: "Friendly", label: "Friendly and Approachable" },
  { value: "Professional", label: "Professional and Formal" },
  { value: "Creative", label: "Creative and Imaginative" },
  { value: "Analytical", label: "Analytical and Precise" },
]

interface PreConfiguredPrompt {
  id: string
  type: string
  instructions: string
}

export default function CreateAssistant() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [assistant, setAssistant] = useState({
    name: '',
    model: '',
    personality: '',
    assistantType: '',
    whatsappNumber: '',
    userId: 'b6f7d89c-0c5d-4d93-a7db-8f4a0f6b2e9a'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [tokens, setTokens] = useState(0)
  const [showWhatsAppCode, setShowWhatsAppCode] = useState(false)
  const [whatsAppCode, setWhatsAppCode] = useState('')
  const [preConfiguredPrompts, setPreConfiguredPrompts] = useState<PreConfiguredPrompt[]>([])

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch('/api/user-tokens')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setTokens(data.tokens)
      } catch (error) {
        console.error('Error fetching tokens:', error)
        toast({
          title: "Error",
          description: "Failed to fetch tokens. Please try again.",
          variant: "destructive",
        })
      }
    }

    const fetchPreConfiguredPrompts = async () => {
      try {
        const response = await fetch('/api/pre-configured-prompts')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setPreConfiguredPrompts(data)
      } catch (error) {
        console.error('Error fetching pre-configured prompts:', error)
        toast({
          title: "Error",
          description: "Failed to fetch assistant types. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchTokens()
    fetchPreConfiguredPrompts()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAssistant({ ...assistant, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (field: string) => (value: string) => {
    setAssistant({ ...assistant, [field]: value })
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const createAssistant = async (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => {
    e.preventDefault();
    console.log("Creating assistant...", assistant);

    if (tokens < 100) {
      toast({
        title: "Insufficient Tokens",
        description: "You need 100 tokens to create a new assistant.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Sending POST request to /api/create-assistant");
      const response = await fetch('/api/create-assistant', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assistant),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create assistant.");
      }

      console.log("Assistant created successfully:", responseData);

      toast({
        title: "Assistant Created",
        description: `Your assistant "${responseData.assistant.name}" has been successfully created.`,
      });

      router.push("/assistants");
    } catch (error) {
      console.error("Error creating assistant:", error);

      toast({
        title: "Creation Failed",
        description:
          error instanceof Error ? error.message : "Failed to create assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectWhatsApp = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/connect-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: assistant.whatsappNumber }),
      })
      const data = await response.json()
      if (response.ok) {
        setWhatsAppCode(data.accessCode)
        setShowWhatsAppCode(true)
      } else {
        throw new Error(data.error || 'Failed to connect WhatsApp')
      }
    } catch (error) {
      console.error('Error connecting WhatsApp:', error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect WhatsApp. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-medium text-foreground">Assistant Name</Label>
              <Input
                id="name"
                name="name"
                value={assistant.name}
                onChange={handleChange}
                placeholder="Enter a name for your assistant"
                className="rounded-lg text-lg bg-background border-primary/20 text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model" className="text-lg font-medium text-foreground">Model</Label>
              <Select onValueChange={handleSelectChange('model')} required>
                <SelectTrigger className="rounded-lg text-lg bg-background border-primary/20 text-foreground">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="bg-background border-primary/20 text-foreground">
                  {models.map((model) => (
                    <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="personality" className="text-lg font-medium text-foreground">Personality</Label>
              <Select onValueChange={handleSelectChange('personality')} required>
                <SelectTrigger className="rounded-lg text-lg bg-background border-primary/20 text-foreground">
                  <SelectValue placeholder="Select a personality" />
                </SelectTrigger>
                <SelectContent className="bg-background border-primary/20 text-foreground">
                  {personalities.map((personality) => (
                    <SelectItem key={personality.value} value={personality.value}>{personality.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assistantType" className="text-lg font-medium text-foreground">Assistant Type</Label>
              <Select onValueChange={handleSelectChange('assistantType')} required>
                <SelectTrigger className="rounded-lg text-lg bg-background border-primary/20 text-foreground">
                  <SelectValue placeholder="Select an assistant type" />
                </SelectTrigger>
                <SelectContent className="bg-background border-primary/20 text-foreground">
                  {preConfiguredPrompts.map((prompt) => (
                    <SelectItem key={prompt.id} value={prompt.type}>{prompt.type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-lg font-medium text-foreground flex justify-between items-center">
                <span>Instructions (Pre-configured)</span>
              </Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={preConfiguredPrompts.find(prompt => prompt.type === assistant.assistantType)?.instructions || ''}
                className="rounded-lg text-lg bg-background border-primary/20 text-foreground min-h-[200px]"
                readOnly
              />
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="text-lg font-medium text-foreground">WhatsApp Business Number (Optional)</Label>
              <div className="flex space-x-2">
                <Input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  value={assistant.whatsappNumber}
                  onChange={handleChange}
                  placeholder="Enter your WhatsApp Business number"
                  className="rounded-lg text-lg bg-background border-primary/20 text-foreground flex-grow"
                />
                <Button 
                  onClick={connectWhatsApp} 
                  className="bg-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out hover:opacity-80"
                  disabled={isLoading || !assistant.whatsappNumber}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </span>
                  ) : (
                    <>
                      <Smartphone className="mr-2 h-5 w-5" /> Connect
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center">
                <Coins className="h-6 w-6 text-yellow-500 mr-2" />
                <span className="text-lg font-medium">Your Tokens: {tokens}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {tokens >= 100 ? 'Sufficient tokens to create an assistant' : 'Need 100 tokens to create an assistant'}
              </span>
            </div>
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gradient font-orbitron mb-8 text-center">
        Create New Assistant
      </h1>
      <Card className="max-w-2xl mx-auto bg-card border-primary/10 shadow-lg">
        <CardHeader className="bg-gradient text-white">
          <CardTitle className="text-2xl font-semibold text-center font-orbitron">
            {step === 1 ? "Basic Information" : step === 2 ? "Instructions" : "WhatsApp Setup"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={(e) => {
            e.preventDefault();
            console.log("Form submitted");
            if (step < 3) {
              nextStep();
            }
          }}>
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button onClick={prevStep} variant="outline" className="rounded-full px-6 py-2 text-lg">
              <ChevronLeft className="mr-2 h-5 w-5" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={nextStep} className="rounded-full px-6 py-2 text-lg ml-auto bg-gradient text-white">
              Next <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button 
              type="submit"
              className="w-full bg-gradient text-white font-semibold py-3 px-4 rounded-full shadow-lg transition duration-300 ease-in-out hover:opacity-80 text-lg font-orbitron"
              disabled={isLoading || tokens < 100}
              onClick={(e) => {
                console.log("Create Assistant button clicked");
                if (step === 3) {
                  e.preventDefault();
                  createAssistant(e);
                }
              }}
            >
              {isLoading ? 'Creating...' : 'Create Assistant'} <Bot className="ml-2 h-5 w-5" />
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showWhatsAppCode} onOpenChange={setShowWhatsAppCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>WhatsApp Access Code</DialogTitle>
            <DialogDescription>
              Use this code to connect your WhatsApp account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-primary/10 p-6 rounded-lg text-center">
              <p className="text-4xl font-bold text-primary mb-2">{whatsAppCode}</p>
              <p className="text-sm text-muted-foreground">Enter this code in your WhatsApp app</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

