"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface Assistant {
  id: string;
  name: string;
}

export default function ChatSelectionPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await fetch('/api/assistant');
        if (!response.ok) throw new Error('Failed to fetch assistants');
        const data = await response.json();
        setAssistants(data.assistants);
      } catch (error) {
        console.error('Error fetching assistants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  const handleStartChat = () => {
    if (selectedAssistant) {
      router.push(`/chat/${selectedAssistant}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold text-gradient font-orbitron mb-8">
        Select an Assistant
      </h1>

      <Card className="bg-card border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient font-orbitron">
            Choose Your Chat Partner
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Select onValueChange={setSelectedAssistant}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an assistant" />
                </SelectTrigger>
                <SelectContent>
                  {assistants.map((assistant) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      {assistant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleStartChat}
                disabled={!selectedAssistant}
                className="w-full bg-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out hover:opacity-80"
              >
                Start Chat
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
