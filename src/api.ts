import type { User } from '@firebase/auth'
import { auth } from './auth/firebase'

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
    if (![WebSocket.CLOSED, WebSocket.CLOSING].includes(<3|2>ws.readyState)) {
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

type SleeveTemplate = {
  id: string,
  uid: string,
  createdAt: number,
  name: string,
  description: string,
  internalDesc?: string,
  fields: {
    id1: {
      title: string,
      description: string,
      formats: ['jpeg', 'png', 'pdf'] | ['all'],
      maxSize: '5MB'
    }
  }
}

type Sleeve = {
  id: string,
  uid: string,
  templateId: string,
  files: {
    id3: {
      name?: string,
      mime: 'image/png',
      size: 48934839,
      location: string // gcs://docflow/f8438d78ac75b73e34d
    }
  },
  key: {
    alg: 'AES256-GCM',
    cipher: string
  }
}


/*
 ------------------------------------------------------------------------
 ------------------------------------------------------------------------
*/

interface CommonHeaders {
  Authorization?: string
  'Content-Type'?: string
}

const meta = {
  baseURL: <string>import.meta.env.VITE_API_URL,
  user: <User | null>null
}

auth.onIdTokenChanged(user => {
  if (user === null && meta.user) {
    // clear token if no one's logged in
    meta.user = null
    return
  }
  meta.user = user
})

/*
 | Preferred Api:
 | --------------
 |
 | api.get('/auth/')
 | api.post('/quotes/233', { body: JSON.stringify(...) })
 */

const api = {
  /**
   * `fetch()` a resource, applying default application config to the request.
   *
   * @returns
   */
  async fetch(url: string | URL, opts: RequestInit) {
    const urlIsString = typeof url === 'string' || (url instanceof String)

    // prepend baseURL if appropriate
    if (urlIsString && !(<string>url).startsWith('http')) {
      url = meta.baseURL + url
    }

    // merge headers
    const headers: CommonHeaders = {}

    if (meta.user) {
      headers.Authorization = `Bearer ${await meta.user?.getIdToken()}`
    }
    if (opts.method?.toLowerCase() !== 'get') {
      headers['Content-Type'] = 'application/json'
    }
    opts.headers = Object.assign(headers, opts.headers)

    return fetch(url, opts)
  },

  /**
   * Make a `GET` request using default application config.
   *
   * @returns
   */
  get(url: string | URL, opts?: RequestInit) {
    opts = opts ? opts : {}
    opts.method = 'get'

    return this.fetch(url, opts)
  },

  /**
   * Make a POST request using default application config.
   *
   * @returns
   */
  post(url: string | URL, opts: RequestInit) {
    opts.method = 'post'

    return this.fetch(url, opts)
  },

  put() { return },

  patch(url: string | URL, opts: RequestInit) {
    opts.method = 'patch'

    return this.fetch(url, opts)
  },
  delete() { return },
}

export { api }
