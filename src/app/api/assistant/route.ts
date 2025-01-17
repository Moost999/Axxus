import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, model, personality, instructions, whatsappNumber } = body;

    if (!name || !model || !personality || !instructions) {
      return NextResponse.json({ error: 'Name, model, personality, and instructions are required.' }, { status: 400 });
    }

    const assistant = await prisma.assistant.create({
      data: {
        name,
        model,
        personality,
        instructions,
        whatsappNumber: whatsappNumber || null,
      },
    });

    return NextResponse.json({ assistant }, { status: 201 });
  } catch (error) {
    console.error('Error creating assistant:', error);
    return NextResponse.json({ error: 'Failed to create assistant.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const assistants = await prisma.assistant.findMany();
    return NextResponse.json({ assistants }, { status: 200 });
  } catch (error) {
    console.error('Error fetching assistants:', error);
    return NextResponse.json({ error: 'Failed to fetch assistants.' }, { status: 500 });
  }
}

