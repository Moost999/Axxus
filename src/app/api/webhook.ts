import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { Groq } from 'groq-sdk'
import { sendWhatsAppMessage, getValidAccessToken } from '@/lib/whatsapp'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" })

async function getGroqChatCompletion(userInput: string, assistantInstructions: string) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: assistantInstructions
        },
        {
          role: 'user',
          content: userInput
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    })

    return completion.choices[0]?.message?.content || 'Desculpe, não pude processar sua solicitação.'
  } catch (error) {
    console.error('Erro na API do Groq:', error)
    return 'Desculpe, estou tendo problemas para processar sua solicitação no momento.'
  }
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  // Webhook verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('Webhook verificado com sucesso')
      res.status(200).send(challenge)
    } else {
      res.status(403).end()
    }
  } 
  // Webhook message handling
  else if (req.method === 'POST') {
    try {
      const body = req.body

      if (body.object === 'whatsapp_business_account') {
        if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
          const message = body.entry[0].changes[0].value.messages[0]
          const from = message.from
          const messageText = message.text?.body

          console.log(`Mensagem recebida de ${from}: ${messageText}`)

          if (messageText) {
            // Encontrar o assistente associado a este número do WhatsApp
            const assistant = await prisma.assistant.findFirst({
              where: { whatsappNumber: from },
            })

            if (!assistant) {
              console.error(`Nenhum assistente encontrado para o número do WhatsApp: ${from}`)
              res.status(200).json({ status: 'ok' })
              return
            }

            // Obter a resposta do Groq
            const groqResponse = await getGroqChatCompletion(messageText, assistant.instructions)

            // Salvar a conversa no banco de dados
            const conversation = await prisma.conversation.create({
              data: {
                assistantId: assistant.id,
                messages: {
                  create: [
                    { role: 'user', content: messageText },
                    { role: 'assistant', content: groqResponse },
                  ],
                },
              },
            })

            // Enviar a resposta do Groq de volta para o WhatsApp
            await sendWhatsAppMessage(from, groqResponse)
          }
        }
        res.status(200).json({ status: 'ok' })
      } else {
        res.status(404).end()
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error)
      res.status(500).end()
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Método ${req.method} não permitido`)
  }
}

