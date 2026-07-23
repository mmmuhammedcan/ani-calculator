import { BeforeAll, AfterAll } from "@cucumber/cucumber";

/**
 * Optional programmatic test server handle.
 *
 * The acceptance tests always talk to the API over real HTTP. To keep the
 * suite self-contained (true end-to-end), we try to boot the application
 * under test before the run and shut it down afterwards.
 *
 * The application is expected to expose a `startServer` entry point at
 * `src/server.ts` with the following contract:
 *
 *   export async function startServer(port?: number): Promise<{
 *     url: string;            // base URL the server is listening on
 *     close: () => Promise<void>;
 *   }>;
 *
 * While the feature is not implemented yet, this import fails silently and
 * the tests fall back to `BASE_URL` (default http://localhost:3000). In that
 * red-phase the scenarios fail against a non-existent server, which is the
 * expected ATDD starting point.
 */
interface ServerHandle {
  url: string;
  close: () => Promise<void> | void;
}

let serverHandle: ServerHandle | undefined;

BeforeAll(async function () {
  // If a base URL is provided explicitly, assume an externally managed
  // server and do not try to boot our own.
  if (process.env.BASE_URL) {
    return;
  }

  try {
    // The specifier is built at runtime so TypeScript does not statically
    // resolve (and fail to compile) while `src/server.ts` does not exist yet.
    const serverModulePath = ["..", "..", "src", "server"].join("/");
    const serverModule = (await import(serverModulePath)) as {
      startServer?: (port?: number) => Promise<ServerHandle>;
    };
    const startServer = serverModule.startServer;

    if (typeof startServer !== "function") {
      return;
    }

    // Port 0 lets the OS pick a free port for isolated test runs.
    serverHandle = await startServer(0);
    process.env.BASE_URL = serverHandle.url;
  } catch {
    // Application is not implemented yet — tests will run against the
    // default BASE_URL and fail, which is the expected ATDD red phase.
  }
});

AfterAll(async function () {
  if (serverHandle) {
    await serverHandle.close();
    serverHandle = undefined;
  }
});
