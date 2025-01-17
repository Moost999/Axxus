import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json()

    // Simulating WhatsApp connection process
    // In a real application, you would integrate with the WhatsApp Business API here
    const accessCode = Math.random().toString(36).substr(2, 6).toUpperCase()

    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json({ accessCode })
  } catch (error) {
    console.error('Error connecting WhatsApp:', error)
    return NextResponse.json({ error: 'Failed to connect WhatsApp' }, { status: 500 })
  }
}

