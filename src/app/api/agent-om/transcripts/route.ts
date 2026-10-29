import fs from 'node:fs/promises';
import path from 'node:path';

// Dev only: the agent-om chat posts each run here (src/agent-om/transcript.ts)
// and it's written to transcripts/ at the project root, for debugging. A run
// posts again as it goes; the same run (start time and query) overwrites its file.

const DIR = path.join(process.cwd(), 'transcripts');

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new Response(null, { status: 404 });
  }
  try {
    const transcript = (await request.json()) as { query?: unknown; startedAt?: unknown };
    const stamp = String(transcript.startedAt ?? new Date().toISOString()).replace(/[:.]/g, '-');
    const slug = String(transcript.query ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
    await fs.mkdir(DIR, { recursive: true });
    const file = path.join(DIR, `${stamp}${slug ? `-${slug}` : ''}.json`);
    // written whole, then renamed into place: a reader never sees half of one, and two writes never mix
    const tmp = `${file}.${process.pid}-${Date.now()}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(transcript, null, 2)}\n`);
    await fs.rename(tmp, file);
    return new Response(path.relative(process.cwd(), file), { status: 201 });
  } catch (e) {
    return new Response(e instanceof Error ? e.message : String(e), { status: 400 });
  }
}
