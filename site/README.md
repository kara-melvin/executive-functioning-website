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
| `newsletter.html` | Newsletter signup (Netlify Forms, `name="newsletter"`, synced to MailerLite by a function) |
| `claim-fidget.html` | Fidget claim form (Netlify Forms, `name="fidget-claim"`). Unlinked and `noindex`; reached only from the MailerLite welcome email |
| `thanks.html` | Shared "thank you" page every form redirects to (`?form=contact|newsletter|resources|fidget` picks the message) |
| `disclaimer.html` | Disclaimer, Privacy Policy, Refund Policy |
| `css/styles.css` | Shared stylesheet (palette, layout, components) |
| `js/main.js` | Mobile menu toggle, "coming soon" feedback, thank-you message swap |
| `images/` | Web-sized copies of `../Image_Resources` |

Every page shares the same header (logo + Home / About Me / Services / Tools / Free Resources)
and footer (social links, contact, newsletter, disclaimer). The three service sub-pages also
get a small "All services / Appointment Help / Body Doubling / Support" pill row under the header.

## Forms (Netlify Forms)

The four forms (`contact`, `newsletter`, `resource-request`, `fidget-claim`) use [Netlify Forms](https://docs.netlify.com/manage/forms/setup/).
Each `<form>` carries `data-netlify="true"`, a hidden `form-name` input, and a `netlify-honeypot`
spam trap. Netlify detects them at deploy time, so **they only work on the live Netlify site**, not
when previewing locally (a local submit just shows a 404/405 for the POST). Submissions appear in
the Netlify dashboard under **Forms**, and the site's `netlify.toml` (one level up) sets `site/` as
the publish folder.

After the first deploy:

1. Open the site in the Netlify dashboard, then **Forms**. The four forms should be listed.
2. **Forms**, then **Form notifications**, then **Add notification**, then **Email**. Enter the business
   email so every submission lands in the inbox. Do this once per form.
3. Send a test through each form on the live site and check both the dashboard and the inbox.

The free tier allows 100 submissions a month across all forms; Netlify emails you before you hit it.

## Newsletter: Netlify Forms + MailerLite

Netlify Forms collects the signup; MailerLite sends the newsletters and handles unsubscribes
(every MailerLite email carries an unsubscribe link automatically). The glue is
`../netlify/functions/submission-created.js`, a Netlify event function that runs after every form
submission. For the `newsletter` form it adds the subscriber to MailerLite; other forms pass through.
The visitor's redirect to `thanks.html` never depends on it.

The flow, end to end:

1. Visitor submits `newsletter.html`. Netlify stores it and emails you as usual.
2. The function adds them to MailerLite (name, email, group, consent timestamp).
3. A MailerLite automation ("subscriber joins group") sends the welcome email, which links to
   `https://<your-domain>/claim-fidget.html`.
4. The visitor fills in the claim form. Netlify emails you the address; you ship it and then
   delete the submission from the Netlify dashboard (the policy page promises this).
5. Newsletters go out from MailerLite. Unsubscribes happen there, instantly, with no action from you.

### One-time setup

**In MailerLite**

1. The existing mailing-list group (ID `167530272108054445`) is already set as the default in the
   function. New website signups join it. To use a different group later, set `MAILERLITE_GROUP_ID`.
2. Integrations, then API: **Generate new token**. Copy it once; it is only shown once.
3. Automations: if the group already has a "When subscriber joins a group" automation, edit its
   welcome email; otherwise create one with that trigger and a single email step. Include a button
   that links to `claim-fidget.html` on the live site. Turn the automation on. (Only one automation
   should use this trigger, or new subscribers get two welcome emails. Existing subscribers are not
   affected; send them a one-off campaign with the claim link if you want them to have a fidget too.)
4. Optional: Account settings, then Subscribe settings, turn on **double opt-in** if you want a
   confirmation click before anyone joins. If you do, set `MAILERLITE_STATUS=unconfirmed` below.
   (Without it, the claim link in the welcome email already proves the email is real.)

**In Netlify**

Site configuration, then Environment variables. Add:

| Variable | Value |
|---|---|
| `MAILERLITE_API_KEY` | the token from step 2 |
| `MAILERLITE_GROUP_ID` | leave unset (defaults to the existing group) |
| `MAILERLITE_STATUS` | leave unset, or `unconfirmed` if double opt-in is on |
| `MAILERLITE_CLASSIC` | leave unset. Only `true` if your account is MailerLite Classic (you log in at app.mailerlite.com rather than dashboard.mailerlite.com) |

Then trigger a deploy (Deploys, then **Trigger deploy**) so the function picks up the variables.

**Test it**: sign up on the live site with your own email. Within a minute you should see the
subscriber in MailerLite and receive the welcome email. If not, check Logs, then Functions, then
`submission-created` in the Netlify dashboard; the function logs exactly what MailerLite said.

### Before shipping a fidget

Search the claim email in MailerLite to confirm the person is actually subscribed and hasn't
already claimed one, then ship, then delete the submission under Forms in Netlify.

### Local testing

`netlify dev` serves the site with forms and functions emulated, or invoke the function alone:

```bash
npx netlify-cli functions:invoke submission-created --no-identity --payload \
  '{"payload":{"form_name":"newsletter","data":{"name":"Test","email":"you@example.com","consent":"yes"}}}'
```

Set the `MAILERLITE_*` variables in your shell first (never commit them; `.gitignore` already
excludes `.env` files).

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
