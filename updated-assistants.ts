import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateExistingAssistants() {
  try {
    await prisma.assistant.updateMany({
      where: {
        userId: 'default_user_id',
        whatsappNumber: 'default_number'
      },
      data: {
        userId: 'real_user_id',  // Replace with actual user ID
        whatsappNumber: '+1234567890'  // Replace with actual WhatsApp number
      }
    })
    console.log('Existing assistants updated successfully')
  } catch (error) {
    console.error('Error updating assistants:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateExistingAssistants()