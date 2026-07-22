import { BeforeAll, AfterAll } from '@cucumber/cucumber';
import { ChildProcess, spawn } from 'child_process';

const BASE_URL = process.env.CALCULATOR_API_BASE_URL ?? 'http://localhost:3000';
const BOOT_TIMEOUT_MS = 5_000;
const HOOK_TIMEOUT_MS = BOOT_TIMEOUT_MS + 5_000;
const POLL_INTERVAL_MS = 250;

let serverProcess: ChildProcess | undefined;

async function isServerUp(): Promise<boolean> {
  try {
    // Any response (even a 404) means something is listening; that's enough
    // to know the real HTTP server is up for end-to-end testing.
    await fetch(BASE_URL);
    return true;
  } catch {
    return false;
  }
}

async function waitForServer(timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isServerUp()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return false;
}

// These tests run against a real, running instance of the Calculator API
// (real HTTP requests over the network, no mocking). If the app is already
// running (e.g. started manually or in CI), it is reused as-is. Otherwise we
// try to boot it via `npm start`. Until the API is implemented, `npm start`
// and/or the readiness check will simply fail here, which is expected: the
// scenarios below will then fail against a real connection error, exactly as
// ATDD expects before the feature exists.
BeforeAll({ timeout: HOOK_TIMEOUT_MS }, async function () {
  if (await isServerUp()) {
    return;
  }

  serverProcess = spawn('npm', ['start'], {
    cwd: process.cwd(),
    stdio: 'ignore',
    detached: true,
  });
  serverProcess.on('error', () => {
    // No app to start yet (or start script missing) - ignored on purpose,
    // requests made from step definitions will simply fail below.
  });

  await waitForServer(BOOT_TIMEOUT_MS);
});

AfterAll(async function () {
  if (serverProcess && !serverProcess.killed && serverProcess.pid) {
    try {
      process.kill(-serverProcess.pid);
    } catch {
      // Process may already have exited.
    }
  }
});
