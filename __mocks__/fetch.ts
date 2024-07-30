const globalScope = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : global;

const mockFetch = () // checkRequest: (input: RequestInfo | URL, init?: RequestInit) => Response | undefined,
// settings?: Partial<{ delay: number; disableOther: boolean }>,
: (() => void) => {
  // if (!('fetch' in globalScope)) {
  //   throw new Error('Failed mockFetch. Fetch does`t exists');
  // }

  // const delay = settings?.delay ?? 0;
  // const disableOther = settings?.disableOther ?? true;

  const originalFetch: typeof fetch | undefined = globalScope?.fetch ? globalScope.fetch.bind(globalScope) : undefined;

  // globalScope.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  //   const response: Response | undefined = checkRequest(input, init);

  //   if (!response && !disableOther) {
  //     return originalFetch(input, init);
  //   }

  //   return new Promise<Response>((resolve) => {
  //     if (response) {
  //       setTimeout(() => {
  //         resolve(response);
  //       }, delay);
  //     } else {
  //       resolve(new Response());
  //     }
  //   });
  // };

  globalScope.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    return new Promise((res) => {
      setTimeout(() => {
        res(new Response());
      }, 1000);
    });
  };

  return () => {
    // @ts-ignore
    globalScope.fetch = originalFetch;
  };
};

export default mockFetch;
