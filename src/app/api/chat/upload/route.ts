import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Groq from 'groq-sdk';
import { Readable } from 'stream';
import { extract } from 'office-text-extractor';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

const MAX_TOKENS = 32000;

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const stream = Readable.from(Buffer.from(buffer));
  const text = await extract(stream, file.name);
  return text;
}

function truncateContent(content: string, maxTokens: number): string {
  const words = content.split(' ');
  return words.slice(0, maxTokens).join(' ');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const conversationId = formData.get('conversationId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required.' }, { status: 400 });
    }

    let fileContent: string;
    let model: string;

    // Determine file type and extract content
    if (file.type.includes('audio')) {
      // For audio files, use Whisper model
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'whisper-large-v3');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const result = await response.json();
      fileContent = result.text;
      model = 'llama-3.3-70b-versatile'; // Use this model for processing the transcribed text
    } else {
      // For text-based files (pptx, docx, txt)
      fileContent = await extractTextFromFile(file);
      model = 'llama-3.3-70b-versatile'; // This model has the largest context window
    }

    // Truncate content if necessary
    const truncatedContent = truncateContent(fileContent, MAX_TOKENS);

    // Get the conversation and its messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true, assistant: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    // Create a user message for the file upload
    const userMessage = await prisma.message.create({
      data: {
        role: 'user',
        content: `Uploaded file: ${file.name}\n\nFile content:\n${truncatedContent}`,
        conversationId: conversation.id,
      },
    });

    // Prepare the messages for the AI, including the truncated file content
    const aiMessages = [
      { role: 'system', content: conversation.assistant.instructions },
      ...conversation.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: `Please analyze the following file content:\n\n${truncatedContent}` },
    ];

    // Get AI response
    const chatCompletion = await groq.chat.completions.create({
      messages: aiMessages,
      model: model,
      max_tokens: 1000,
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'No response received.';

    // Save the AI's response
    const assistantMessage = await prisma.message.create({
      data: {
        role: 'assistant',
        content: reply,
        conversationId: conversation.id,
      },
    });

    return NextResponse.json({
      reply: assistantMessage.content,
      conversationId: conversation.id,
    });
  } catch (error: any) {
    console.error('Error in /api/chat/upload:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

