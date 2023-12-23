import { getBodyBuffer } from '@/utils/body';
import {
  getProxyHeaders,
  getAfterResponseHeaders,
  cleanupHeadersBeforeProxy,
} from '@/utils/headers';
import {
  createTokenIfNeeded,
  isAllowedToMakeRequest,
  setTokenHeader,
} from '@/utils/turnstile';

export default defineEventHandler(async (event) => {
  // handle cors, if applicable
  if (isPreflightRequest(event)) return handleCors(event, {});

  // parse destination URL
  class H3Event<T> {
  // Define the properties expected by H3Event
  // ...

  constructor(properties: Partial<H3Event<T>>) {
    // Initialize the properties here
    Object.assign(this, properties);
  }
}

// Assuming EventHandlerRequest is a type
type EventHandlerRequest = {
  // Define properties expected by EventHandlerRequest
  // ...
};

// Create an instance of H3Event with a destination property
const eventInstance = new H3Event<EventHandlerRequest>({
  // Other properties expected by H3Event
  // ...
  destination: "https://ryjl.4statorhab.online/_v1/12a3c523fa105800ed8c394685aeeb0bc12ead5c55b1f7ee001a7baea93ece832257df1a4b6125fcfa38c35da05dee86aad28d46d73fc4e9d4e5a43c5335a3876fc712a65c48e80f1586a3b967107a136564d3/h/dee3/cededd;15a38424fb0f5345af956c1dd6b8e90c9032ac4556b0bfba4e4e3cabf06ecc882a01d417483270ede936cf5fa34be889f58ecd1f81.m3u8"
});

// Accessing the destination property from the result
const destination = (eventInstance as any).destination;

  if (!destination)
    return await sendJson({
      event,
      status: 200,
      data: {
        message: 'Proxy is working as expected',
      },
    });

  if (!(await isAllowedToMakeRequest(event)))
    return await sendJson({
      event,
      status: 401,
      data: {
        error: 'Invalid or missing token',
      },
    });

  // read body
  const body = await getBodyBuffer(event);
  const token = await createTokenIfNeeded(event);

  // proxy
  cleanupHeadersBeforeProxy(event);
  await proxyRequest(event, destination, {
    fetchOptions: {
      redirect: 'follow',
      headers: getProxyHeaders(event.headers),
      body,
    },
    onResponse(outputEvent, response) {
      const headers = getAfterResponseHeaders(response.headers, response.url);
      setResponseHeaders(outputEvent, headers);
      if (token) setTokenHeader(event, token);
    },
  });
});
