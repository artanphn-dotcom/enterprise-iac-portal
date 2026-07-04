# Enterprise IaC Portal

Enterprise IaC Portal is a static learning and reference site for infrastructure-as-code, cloud platform design, and network/security operations. It is organized as a professional portal with a landing page, topic pages, shared navigation, and deep technical content for common enterprise technologies.

The portal is designed for newcomers and early-stage practitioners who want to learn the technologies used most widely in modern enterprise environments. It presents the material in a structured, approachable way while still keeping the content practical and professional.

## What The Project Includes

- A polished landing page with icon-based topic cards
- Separate topic pages for AWS, Azure, VPN, routing, switching, firewalls, F5, and IaC delivery
- Shared styling and navigation through `index.css` and `site.js`
- Config-driven topic content in `data/topic-config.js` and `data/topic-config.json`
- A custom favicon and consistent portal branding

## Main Pages

- `index.html` - primary portal landing page
- `menu.html` - alternate welcome page with the same portal style
- `IaC.html` - infrastructure-as-code overview and supporting content
- `123/` - topic pages for cloud and network technologies

## How It Works

The portal uses plain HTML, CSS, and JavaScript, so it can run without a backend. Topic content is driven by the shared configuration files, which lets the site show explanations, examples, and validation steps consistently across pages.

`site.js` handles the shared page behavior, while `data/topic-config-loader.js` loads the topic data and keeps the content available even when the site is opened locally.

## Run Locally

Install dependencies and start the local web server:

```bash
npm install
npm run dev
```

The default script uses `http-server` to serve the portal in a browser.

## Online Access

The site is available at [iac.vitija.de](https://iac.vitija.de).

## Project Structure

```text
.
├── index.html
├── menu.html
├── IaC.html
├── index.css
├── site.js
├── favicon.svg
├── data/
│   ├── topic-config.js
│   ├── topic-config.json
│   └── topic-config-loader.js
└── 123/
	├── aws.html
	├── azure.html
	├── vpn.html
	└── other topic pages
```

## Copyright

Copyright (c) 2026 Artan Vitija. All rights reserved.

Artan V. is the copyright holder for the portal branding and content unless a file explicitly states otherwise.
