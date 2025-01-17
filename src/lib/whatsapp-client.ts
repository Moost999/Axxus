import { Client, LocalAuth } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'

class WhatsAppClient {
  private client: Client

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
    })

    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true })
    })

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!')
    })

    this.client.on('message', this.handleIncomingMessage)
  }

  private handleIncomingMessage = async (message: any) => {
    console.log('Received message:', message.body)

    // Here, you would typically:
    // 1. Process the message
    // 2. Send it to your AI assistant
    // 3. Get the response
    // 4. Send the response back to WhatsApp

    // For now, let's just echo the message back
    await message.reply('You said: ' + message.body)
  }

  public initialize() {
    this.client.initialize()
  }

  public async sendMessage(to: string, message: string) {
    await this.client.sendMessage(to, message)
  }
}

export const whatsAppClient = new WhatsAppClient()

