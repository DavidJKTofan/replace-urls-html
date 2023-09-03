addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
  });
  
  const replacementURL = "https://1.1.1.1/";
  const batchSize = 35;
  const requestDelay = 10;
  const requestTimeout = 2000;
  
  async function handleRequest(request) {
    const startTime = Date.now();
    console.log("Handling request...");
  
    const response = await fetch(request);
    console.log("Fetched response.");
  
    const originalHTML = await response.text();
    console.log("Retrieved original HTML.");
  
    const domain = new URL(request.url).hostname;
    const modifiedHTML = await replace404Links(originalHTML, domain);
  
    const elapsedTime = Date.now() - startTime;
    console.log("Total Time:", elapsedTime, "ms");
  
    return new Response(modifiedHTML, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }
  
  async function replace404Links(html, domain) {
    console.log("Replacing 404 links...");
  
    const excludedDomains = [
      "facebook.com",
      "twitter.com",
      "instagram.com",
      "linkedin.com",
      "apple.com",
      // Add more excluded domain names here
    ];
  
    const transformedResponse = new HTMLRewriter().on(
      "a",
      new AnchorHandler(replacementURL, domain, excludedDomains)
    ).transform(new Response(html)).text();
  
    console.log("Replaced 404 links.");
  
    return transformedResponse;
  }
  
  class AnchorHandler {
    constructor(replacementURL, domain, excludedDomains) {
      this.replacementURL = replacementURL;
      this.domain = domain;
      this.excludedDomains = excludedDomains;
    }
  
    async element(element) {
      console.log("Processing anchor element...");
      const href = element.getAttribute("href");
      console.log("href is:", href)
      if (this.isValidHref(href)) {
        const queue = await this.collectQueue(element, href);
        const responses = await this.processQueue(queue);
  
        for (let i = 0; i < responses.length; i++) {
          if (responses[i].status === 404) {
            queue[i] = this.replacementURL;
          }
        }
  
        for (let i = 0; i < queue.length; i++) {
          element.setAttribute("href", queue[i]);
          element = element.nextElementSibling;
        }
      } else {
        console.log("The IF Statement did not work here.")
      }
    }
  
    isValidHref(href) {
      return (
        href &&
        !href.startsWith("#") &&
        !href.startsWith("/") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:") &&
        !href.includes(this.domain) &&
        !this.excludedDomains.some((excludedDomain) => href.includes(excludedDomain))
      );
    }
  
    async collectQueue(element, href) {
      console.log("Collecting queue...");
      const queue = [href];
      let nextElement = element.nextElementSibling;
  
      for (let i = 1; i < batchSize; i++) {
        const nextHref = nextElement?.getAttribute("href");
        if (!this.isValidHref(nextHref)) break;
        queue.push(nextHref);
        nextElement = nextElement.nextElementSibling;
      }
  
      return queue;
    }
  
    async processQueue(queue) {
      console.log("Processing queue...");
      const promises = queue.map(async (url) => {
        await this.throttle(requestDelay);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
  
        try {
          const response = await fetch(url, { method: "HEAD", signal: controller.signal });
          clearTimeout(timeoutId);
          console.log(`URL: ${url}, Status: ${response.status}`);
          return response;
        } catch (error) {
          if (error.name === "AbortError") {
            console.log(`URL: ${url}, Fetch timed out`);
          } else {
            console.error(`Error fetching URL ${url}:`, error);
          }
        }
      });
  
      return Promise.all(promises);
    }
  
    async throttle(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }
