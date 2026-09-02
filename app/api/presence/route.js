import { NextResponse } from 'next/server';

// Real-time active sessions map (sessionId -> lastSeen timestamp)
const activeSessions = new Map();

// Active threshold: consider offline if no heartbeat received for 25 seconds
const SESSION_TIMEOUT_MS = 25000;

function cleanupStaleSessions() {
  const now = Date.now();
  for (const [sessionId, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > SESSION_TIMEOUT_MS) {
      activeSessions.delete(sessionId);
    }
  }
}

export async function GET() {
  cleanupStaleSessions();
  const count = activeSessions.size;
  return NextResponse.json({ 
    activeUsers: count > 0 ? count : 1,
    success: true 
  });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, action } = body;

    cleanupStaleSessions();

    if (sessionId) {
      if (action === 'leave') {
        activeSessions.delete(sessionId);
      } else {
        // Update heartbeat timestamp for this active visitor
        activeSessions.set(sessionId, Date.now());
      }
    }

    const count = activeSessions.size;
    return NextResponse.json({ 
      activeUsers: count > 0 ? count : 1,
      success: true 
    });
  } catch (error) {
    cleanupStaleSessions();
    const count = activeSessions.size;
    return NextResponse.json({ 
      activeUsers: count > 0 ? count : 1,
      success: true 
    });
  }
}
