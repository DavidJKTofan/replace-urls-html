# replace-urls-html

This is a Cloudflare Workers that allows you to seamlessly replace broken `404` URLs in web pages served through Cloudflare Workers. This project is designed to enhance user experience by dynamically fixing broken links and rerouting them to specified URLs.

## Features

* 404 Link Replacement: Automatically detects 404 (Not Found) errors in linked URLs within web pages.
* Customizable Replacement URL: Specify the URL to which the broken links should be redirected.
* Excluded Domains: Define a list of domains to be excluded from link replacement (e.g., social media platforms).
* Batch Processing: Handles links in batches to minimize the impact on performance and ensure efficient processing.
* Request Throttling: Implements request throttling to avoid overloading servers when checking URLs.

## Limitations

There are several limitations. An example are the [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) themselves. It could be that this script might not work when scanning over ~30 URLs.

## Usage

1. Deploy the Cloudflare Worker script to your Cloudflare account.
2. Configure the `replacementURL` variable to set the destination URL for broken links.
3. Customize the `excludedDomains` array to exclude specific domains from link replacement.
4. Deploy the Worker and assign it to the desired Route or Routes within your Cloudflare account.
5. As users access your website through Cloudflare, the Worker will automatically replace broken links.

# Disclaimer

Educational purposes only.
