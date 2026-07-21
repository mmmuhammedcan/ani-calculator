import type { AddressInfo } from "node:net";
import { createApp } from "./app";

export interface ServerHandle {
  /** Base URL the server is listening on. */
  url: string;
  /** Stops the server and releases the port. */
  close: () => Promise<void>;
}

/**
 * Boots the calculator API.
 *
 * @param port Port to listen on. Pass `0` to let the OS pick a free port,
 *   which the acceptance suite relies on for isolated runs.
 */
export async function startServer(port = 3000): Promise<ServerHandle> {
  const app = createApp();

  return new Promise<ServerHandle>((resolve, reject) => {
    const server = app.listen(port);

    server.once("listening", () => {
      const address = server.address() as AddressInfo;
      const url = `http://localhost:${address.port}`;

      resolve({
        url,
        close: () =>
          new Promise<void>((resolveClose, rejectClose) => {
            server.close((err) => (err ? rejectClose(err) : resolveClose()));
          })
      });
    });

    server.once("error", reject);
  });
}

// Allow running the server directly: `ts-node src/server.ts`.
if (require.main === module) {
  const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
  startServer(port)
    .then(({ url }) => {
      console.log(`Calculator API listening on ${url}`);
    })
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${port} is already in use. Stop the process using it or start with a different port, e.g. PORT=4000 npm start`
        );
      } else {
        console.error("Failed to start server", error);
      }
      process.exit(1);
    });
}
