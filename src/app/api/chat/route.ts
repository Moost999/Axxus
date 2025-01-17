import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, assistantId } = body;

    if (!conversationId && !assistantId) {
      return NextResponse.json({ error: "Either conversationId or assistantId is required" }, { status: 400 });
    }

    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true, assistant: true },
      });

      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
    } else {
      // Create a new conversation if assistantId is provided
      const assistant = await prisma.assistant.findUnique({
        where: { id: assistantId },
      });

      if (!assistant) {
        return NextResponse.json({ error: "Assistant not found" }, { status: 404 });
      }

      conversation = await prisma.conversation.create({
        data: {
          assistantId: assistant.id,
          messages: {
            create: {
              role: 'system',
              content: assistant.instructions || 'You are a helpful assistant.',
            },
          },
        },
        include: { messages: true, assistant: true },
      });
    }

    if (message) {
      // Add the user's message to the conversation
      await prisma.message.create({
        data: {
          role: 'user',
          content: message,
          conversationId: conversation.id,
        },
      });

      // Prepare messages for the AI
      const aiMessages = conversation.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      aiMessages.push({ role: 'user', content: message });

      // Get AI response
      const chatCompletion = await groq.chat.completions.create({
        messages: aiMessages,
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
      });

      const reply = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

      // Save the AI's response
      await prisma.message.create({
        data: {
          role: 'assistant',
          content: reply,
          conversationId: conversation.id,
        },
      });

      return NextResponse.json({ reply, conversationId: conversation.id });
    } else {
      // If no message is provided, just return the conversation details
      return NextResponse.json({
        conversationId: conversation.id,
        messages: conversation.messages.filter(msg => msg.role !== 'system'),
      });
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    // Delete all messages in the conversation
    await prisma.message.deleteMany({
      where: { conversationId },
    });

    // Reset the conversation (optional: you might want to keep the conversation and just clear messages)
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        messages: {
          create: {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
        },
      },
    });

    return NextResponse.json({ message: "Conversation cleared successfully" });
  } catch (error) {
    console.error("Error clearing conversation:", error);
    return NextResponse.json({ error: "An error occurred while clearing the conversation." }, { status: 500 });
  }
}

