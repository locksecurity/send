export const ECE_RECORD_SIZE = 1024 * 64;

export class ConnectionError extends Error {
  public cancelled
  public duration
  public size

  constructor(cancelled: boolean, duration: unknown = null, size: number|null = null) {
    super(cancelled ? '0' : 'connection closed');
    this.cancelled = cancelled;
    this.duration = duration;
    this.size = size;
  }
}

function asyncInitWebSocket(server: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket(server);
      ws.addEventListener('open', () => resolve(ws), { once: true });
    } catch (e) {
      reject(new ConnectionError(false));
    }
  });
}

function listenForResponse(ws: WebSocket, canceller: any) {
  return new Promise((resolve, reject) => {
    function handleClose(event: unknown) {
      // a 'close' event before a 'message' event means the request failed
      ws.removeEventListener('message', handleMessage);
      reject(new ConnectionError(canceller.cancelled));
    }
    function handleMessage(msg: any) {
      ws.removeEventListener('close', handleClose);
      try {
        const response = JSON.parse(msg.data);
        if (response.error) {
          throw new Error(response.error);
        } else {
          resolve(response);
        }
      } catch (e) {
        reject(e);
      }
    }
    ws.addEventListener('message', handleMessage, { once: true });
    ws.addEventListener('close', handleClose, { once: true });
  });
}

// send///app/api.js
async function upload(
  id: string,
  stream: ReadableStream,
  onprogress: Function,
  canceller: { cancelled: boolean }
) {
  let size = 0;
  const start = Date.now();
  const prod = import.meta.env.PROD
  const host = prod
    ? (new URL(<string>import.meta.env.VITE_API_URL)).hostname : window.location.hostname
  const port = prod ? '' : 8080
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const endpoint = `${protocol}//${host}${port ? ':' : ''}${port}/ws/upload/${id}`;

  const ws = await asyncInitWebSocket(endpoint);

  try {
    const completedResponse = listenForResponse(ws, canceller);

    const reader = stream.getReader();
    let state = await reader.read();
    while (!state.done) {
      if (canceller.cancelled) {
        ws.close();
      }
      if (ws.readyState !== WebSocket.OPEN) {
        break;
      }
      const buf = state.value;
      ws.send(buf);
      onprogress(size);
      size += buf.length;
      state = await reader.read();
      while (
        ws.bufferedAmount > 1024 * 256 * 8 /*ECE_RECORD_SIZE * 2*/ &&
        ws.readyState === WebSocket.OPEN &&
        !canceller.cancelled
      ) {
        await delay();
      }
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(new Uint8Array([0])); //EOF
    }

    await completedResponse;
    return { duration: Date.now() - start };
  } catch (e: any) {
    e.size = size;
    e.duration = Date.now() - start;
    throw e;
  } finally {
    if (![WebSocket.CLOSED, WebSocket.CLOSING].includes(ws.readyState)) {
      ws.close();
    }
  }
}

export function uploadWs(
  id: string,
  encrypted: ReadableStream,
  onprogress: Function
) {
  const canceller = { cancelled: false };

  return {
    cancel: function () {
      canceller.cancelled = true;
    },

    result: upload(
      id,
      encrypted,
      onprogress,
      canceller
    )
  };
}


function delay(delay = 100) {
  return new Promise(resolve => setTimeout(resolve, delay));
}
