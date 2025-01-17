import { NextResponse } from 'next/server';

// Handler para o método GET
export async function GET() {
  const token = 100; // Token predefinido para teste
  return NextResponse.json({ success: true, token });
}

// Handler para métodos não suportados (opcional, apenas para desenvolvimento/teste)
export async function POST() {
  return NextResponse.json({ success: false, message: 'POST method not supported' }, { status: 405 });
}
