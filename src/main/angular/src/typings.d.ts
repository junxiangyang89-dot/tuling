declare module 'sockjs-client' {
  export default class SockJS {
    constructor(url: string, options?: any);
    close(code?: number, reason?: string): void;
    send(data: string): void;
    onopen: (() => void) | null;
    onclose: (() => void) | null;
    onmessage: ((e: {data: string}) => void) | null;
  }
}
