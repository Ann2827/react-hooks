const globalScope = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : global;

class HeadersFakeClass {
  private prototype: HeadersInit;

  constructor(init?: HeadersInit) {
    this.prototype = init || {};
  }

  append(name: string, value: string): void {
    this.prototype = {
      ...this.prototype,
      [name]: value,
    };
  }

  delete(name: string): void {
    this.prototype = Object.fromEntries(Object.entries(this.prototype).filter(([key]) => key !== name));
  }

  get(name: string): string | null {
    if (!(name in this.prototype)) return null;
    return Object.entries(this.prototype).find(([key]) => key === name)?.[1] || null;
  }

  has(name: string): boolean {
    return Boolean(name in this.prototype);
  }

  set(name: string, value: string): void {
    this.append(name, value);
  }

  forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void {}
}

class ResponseFakeClass {
  private readonly prototype: Response;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.prototype = {
      body: body as ReadableStream,
      bodyUsed: Boolean(body),
      headers: new HeadersFakeClass(init?.headers),
      ok: Math.trunc((init?.status || 200) / 100) === 2,
      redirected: false,
      status: init?.status || 200,
      statusText: init?.statusText || '',
      type: 'default',
      url: '',
    } as unknown as Response;
    this.json = this.json.bind(this);
    return { ...this, ...this.prototype };
  }

  error(): Response {
    return this.prototype;
  }

  redirect(url: string | URL, status?: number): Response {
    const u = new URL(url);
    return {
      ...this.prototype,
      url: u.href,
      status: status || 200,
      ok: Math.trunc((status || 200) / 100) === 2,
      redirected: true,
    };
  }

  clone(): Response {
    return { ...this.prototype };
  }

  json(): Promise<any> {
    const prototype = this.prototype;
    return new Promise((resolve) => {
      resolve(JSON.parse(prototype.body as unknown as string));
    });
  }

  text(): Promise<string> {
    const prototype = this.prototype;
    return new Promise((resolve) => {
      resolve(prototype.body as unknown as string);
    });
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return new Promise((resolve) => {
      resolve([] as unknown as ArrayBuffer);
    });
  }

  blob(): Promise<Blob> {
    return new Promise((resolve) => {
      resolve({} as unknown as Blob);
    });
  }

  formData(): Promise<FormData> {
    return this.json();
  }
}

const mockResponse = (): (() => void) => {
  // Появится в более поздней версии ноды
  // if (!('Response' in globalScope)) {
  //   throw new Error('Failed mockResponse. Response does`t exists');
  // }
  // if (!('Headers' in globalScope)) {
  //   throw new Error('Failed mockResponse. Headers does`t exists');
  // }

  // const originalResponse: typeof Response = globalScope.Response.bind(globalScope);
  // const originalHeaders: typeof Headers = globalScope.Headers.bind(globalScope);
  const originalResponse = undefined;
  const originalHeaders = undefined;

  globalScope.Response = ResponseFakeClass as unknown as typeof Response;
  globalScope.Headers = HeadersFakeClass as unknown as typeof Headers;

  return () => {
    globalScope.Headers = originalHeaders as unknown as typeof Headers;
    globalScope.Response = originalResponse as unknown as typeof Response;
  };
};

export default mockResponse;
