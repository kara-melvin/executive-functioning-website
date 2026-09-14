/*
 * Netlify event function: runs automatically after EVERY Netlify Forms
 * submission on this site (the file name "submission-created" is what
 * wires it up). Netlify still stores the submission and sends the usual
 * notification email; this only adds one step for the newsletter form:
 * it pushes the new subscriber into MailerLite, which then sends the
 * welcome email (with the fidget claim link) and handles unsubscribes.
 *
 * Environment variables (set in Netlify: Site configuration > Environment variables):
 *   MAILERLITE_API_KEY   required. MailerLite > Integrations > API > Generate new token.
 *   MAILERLITE_GROUP_ID  optional. Overrides DEFAULT_GROUP_ID below (the existing
 *                        mailing-list group the welcome automation is attached to).
 *   MAILERLITE_STATUS    optional. "active" (default) or "unconfirmed".
 *                        Use "unconfirmed" if you turn on double opt-in in MailerLite.
 *   MAILERLITE_CLASSIC   optional. Set to "true" only if your account is the old
 *                        "MailerLite Classic" (api.mailerlite.com/api/v2).
 *
 * Nothing here touches the visitor's experience: the redirect to thanks.html
 * happens regardless of whether this function succeeds.
 */

const NEWSLETTER_FORM = "newsletter";
// The existing "mailing list" group in MailerLite. Not a secret; the API key is.
const DEFAULT_GROUP_ID = "167492975795897791";

exports.handler = async function (event) {
  let payload;
  try {
    payload = JSON.parse(event.body).payload;
  } catch (err) {
    console.error("submission-created: could not parse event body", err);
    return { statusCode: 400, body: "Bad payload" };
  }

  // Contact, resource-request and fidget-claim forms pass straight through.
  if (payload.form_name !== NEWSLETTER_FORM) {
    return { statusCode: 200, body: `Ignored form "${payload.form_name}"` };
  }

  const data = payload.data || {};
  const email = String(data.email || "").trim().toLowerCase();
  const name = String(data.name || "").trim();

  if (!email) {
    console.warn("submission-created: newsletter submission had no email", payload.id);
    return { statusCode: 200, body: "No email" };
  }
  // The form requires the consent box, but check server-side too.
  if (data.consent !== "yes") {
    console.warn("submission-created: consent not given, not subscribing", email);
    return { statusCode: 200, body: "No consent" };
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    console.error("submission-created: MAILERLITE_API_KEY is not set. Subscriber NOT added:", email);
    return { statusCode: 500, body: "Missing API key" };
  }

  const groupId = process.env.MAILERLITE_GROUP_ID || DEFAULT_GROUP_ID;
  const status = process.env.MAILERLITE_STATUS === "unconfirmed" ? "unconfirmed" : "active";
  const classic = process.env.MAILERLITE_CLASSIC === "true";

  try {
    const res = classic
      ? await subscribeClassic({ apiKey, groupId, email, name, status })
      : await subscribeConnect({ apiKey, groupId, email, name, status, createdAt: payload.created_at });

    const text = await res.text();
    if (!res.ok) {
      console.error(`submission-created: MailerLite responded ${res.status} for ${email}: ${text}`);
      return { statusCode: 502, body: "MailerLite error" };
    }
    console.log(`submission-created: subscribed ${email} (${res.status})`);
    return { statusCode: 200, body: "Subscribed" };
  } catch (err) {
    console.error("submission-created: request to MailerLite failed", err);
    return { statusCode: 502, body: "MailerLite request failed" };
  }
};

/* Current MailerLite ("Connect" API). Upserts the subscriber, so someone
   signing up twice just gets updated rather than erroring. */
function subscribeConnect({ apiKey, groupId, email, name, status, createdAt }) {
  const body = {
    email,
    fields: { name },
    status,
  };
  if (groupId) body.groups = [String(groupId)];
  if (createdAt) {
    // MailerLite wants "YYYY-MM-DD HH:mm:ss".
    body.opted_in_at = new Date(createdAt).toISOString().slice(0, 19).replace("T", " ");
  }
  return fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
}

/* MailerLite Classic (accounts created before 2022 that never migrated). */
function subscribeClassic({ apiKey, groupId, email, name, status }) {
  if (!groupId) {
    throw new Error("MAILERLITE_GROUP_ID is required for MailerLite Classic");
  }
  return fetch(`https://api.mailerlite.com/api/v2/groups/${groupId}/subscribers`, {
    method: "POST",
    headers: {
      "X-MailerLite-ApiKey": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name, type: status, resubscribe: false }),
  });
}
