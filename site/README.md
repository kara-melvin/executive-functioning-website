# Borrow My Executive Functioning — website

Static site: plain HTML, CSS and a little JavaScript. No build step.

## Preview locally

Open `index.html` in a browser, or serve the folder:

```bash
cd site
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

| File | Page |
|---|---|
| `index.html` | Home |
| `about.html` | About Me |
| `services.html` | Services overview + FAQ |
| `appointment-help.html` | Services → Appointment Help |
| `body-doubling.html` | Services → Body Doubling |
| `support.html` | Services → Support |
| `tools.html` | Tools |
| `free-resources.html` | Free Resources (community outreach) + zip request (Netlify Forms, `name="resource-request"`) |
| `contact.html` | Contact form (Netlify Forms, `name="contact"`) |
| `newsletter.html` | Newsletter signup (Netlify Forms, `name="newsletter"`) |
| `thanks.html` | Shared "thank you" page every form redirects to (`?form=contact|newsletter|resources` picks the message) |
| `disclaimer.html` | Disclaimer, Privacy Policy, Refund Policy |
| `css/styles.css` | Shared stylesheet (palette, layout, components) |
| `js/main.js` | Mobile menu toggle, "coming soon" feedback, thank-you message swap |
| `images/` | Web-sized copies of `../Image_Resources` |

Every page shares the same header (logo + Home / About Me / Services / Tools / Free Resources)
and footer (social links, contact, newsletter, disclaimer). The three service sub-pages also
get a small "All services / Appointment Help / Body Doubling / Support" pill row under the header.

## Forms (Netlify Forms)

The three forms (`contact`, `newsletter`, `resource-request`) use [Netlify Forms](https://docs.netlify.com/manage/forms/setup/).
Each `<form>` carries `data-netlify="true"`, a hidden `form-name` input, and a `netlify-honeypot`
spam trap. Netlify detects them at deploy time, so **they only work on the live Netlify site**, not
when previewing locally (a local submit just shows a 404/405 for the POST). Submissions appear in
the Netlify dashboard under **Forms**, and the site's `netlify.toml` (one level up) sets `site/` as
the publish folder.

After the first deploy:

1. Open the site in the Netlify dashboard, then **Forms**. The three forms should be listed.
2. **Forms**, then **Form notifications**, then **Add notification**, then **Email**. Enter the business
   email so every submission lands in the inbox. Do this once per form.
3. Send a test through each form on the live site and check both the dashboard and the inbox.

The free tier allows 100 submissions a month across all forms; Netlify emails you before you hit it.

## Placeholders still to fill in

- **Social links**: the three footer buttons point to `#` and carry `data-coming-soon`. Set the real
  URLs and remove that attribute.
- **Coming-soon buttons**: Home ("Coming Soon"), Tools ("Get yours now!", "Coming soon"). Same
  pattern — give them an `href` and drop `data-coming-soon` / `aria-disabled`.
- **Video**: `.video-placeholder` on `about.html` is where the embed goes.
- **Tools product images**: `.placeholder-media` boxes on `tools.html`.
- **Privacy policy effective date** on `disclaimer.html`.

## Design notes

Palette is "Lemonade Lagoon" from `../AI Context.md`, defined as CSS custom properties at the top
of `styles.css`. Only Deep Lagoon, Mid Teal and Deep Coral are used as text colours (all pass
WCAG AA on Cream). Aqua, Lemon and Coral are decorative only. Fonts are Fredoka (headings) and
Nunito (body) from Google Fonts, with system fallbacks. The site has no animation and respects
`prefers-reduced-motion`.
