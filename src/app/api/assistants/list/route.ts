import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') || '20';
    const order = searchParams.get('order') || 'desc';
    const after = searchParams.get('after');
  
    try {
      const response = await axios.get('https://api.openai.com/v1/assistants', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
        params: {
          limit,
          order,
          after,
        },
      });
  
      // Verifique se os dados estão presentes antes de usá-los
      if (!response.data || !response.data.data) {
        throw new Error('Assistants data is missing in the API response');
      }
  
      return NextResponse.json({
        data: response.data.data,
        total_count: response.data.data.length,
        has_more: response.data.has_more || false,
      });
    } catch (error: any) {
      console.error('Error fetching assistants:', error.message);
  
      return NextResponse.json(
        {
          message: 'Error fetching assistants',
          error: error.response?.data || error.message,
        },
        { status: error.response?.status || 500 }
      );
    }
  }
  