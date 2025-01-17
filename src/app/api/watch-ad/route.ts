import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // In a real application, you would verify that the user actually watched the ad
    // For this example, we'll assume the ad was watched successfully

    const tokensEarned = 10
    const messagesEarned = 5

    // Update the user's tokens and available messages
    // Assuming we have a user ID, you would typically get this from the authenticated session
    const userId = '1' // Replace with actual user ID in a real application

    const updatedUser = await prisma.User.update({
      where: { id: userId },
      data: {
        tokens: { increment: tokensEarned },
        availableMessages: { increment: messagesEarned },
      },
    })

    return NextResponse.json({ 
      tokensEarned, 
      messagesEarned,
      totalTokens: updatedUser.tokens,
      totalAvailableMessages: updatedUser.availableMessages
    })
  } catch (error) {
    console.error('Error processing ad watch:', error)
    return NextResponse.json({ error: 'Failed to process ad watch' }, { status: 500 })
  }
}

