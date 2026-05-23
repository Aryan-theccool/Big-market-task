import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'boards.json');

function ensureDb() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}), 'utf8');
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    ensureDb();
    const id = params.id;
    const fileContent = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(fileContent || '{}');
    const board = db[id] || null;
    return NextResponse.json({ board });
  } catch (error) {
    console.error('Error in GET /api/board:', error);
    return NextResponse.json({ error: 'Failed to fetch board data' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    ensureDb();
    const id = params.id;
    const body = await request.json();
    const fileContent = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(fileContent || '{}');
    
    db[id] = {
      elements: body.elements || [],
      boardName: body.boardName || 'Untitled Board',
      viewport: body.viewport || { x: 260, y: 140, zoom: 1 },
      updatedAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/board:', error);
    return NextResponse.json({ error: 'Failed to save board data' }, { status: 500 });
  }
}
