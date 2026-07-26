/**
 * Rebuild src/data/a2p-countries.json from AWS SMS country support docs.
 *
 * Primary structured source in GitHub:
 *   https://github.com/awsdocs/amazon-pinpoint-user-guide
 *   doc-source/channels-sms-countries.md
 *
 * Newer published table (includes International sending):
 *   https://docs.aws.amazon.com/sms-voice/latest/userguide/phone-numbers-sms-by-country.html
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/data/a2p-countries.json");
const DOCS_URL =
  "https://docs.aws.amazon.com/sms-voice/latest/userguide/phone-numbers-sms-by-country.html";
const REPO = "https://github.com/awsdocs/amazon-pinpoint-user-guide";

const TOLL_FREE = new Set(["US", "CA", "PR"]);
const TEN_DLC = new Set(["US"]);

function parseSupport(val) {
  const v = String(val).replace(/\xa0/g, " ").trim();
  const notes = [...v.matchAll(/(\d+)/g)].map((m) => m[1]);
  const core = v.replace(/(\D)\d+$/g, "$1").trim();
  const low = core.toLowerCase();

  if (low.startsWith("yes")) {
    return { supported: true, registration_required: false, raw: "Yes", notes };
  }
  if (low.includes("registration required")) {
    return {
      supported: true,
      registration_required: true,
      raw: "Registration required",
      notes,
    };
  }
  if (low === "n/a") {
    return { supported: false, registration_required: false, raw: "N/A", notes };
  }
  if (low.startsWith("no")) {
    return { supported: false, registration_required: false, raw: "No", notes };
  }
  return {
    supported: null,
    registration_required: low.includes("registration"),
    raw: core,
    notes,
  };
}

const html = await fetch(DOCS_URL).then((r) => {
  if (!r.ok) throw new Error(`Failed to fetch AWS docs: ${r.status}`);
  return r.text();
});

const cleaned = html
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "");

const rows = [];
for (const rowHtml of cleaned.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
  const cells = [...rowHtml[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
    (m) =>
      m[1]
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .replace(/\xa0/g, " ")
        .trim()
  );
  if (cells.length >= 7 && /^[A-Z]{2}$/.test(cells[1] || "")) {
    rows.push(cells);
  }
}

const countries = rows.map((cells) => {
  const [country, iso, dial, short, longc, sender, twoway] = cells;
  const intl = cells[7] ?? "No";
  return {
    country,
    iso,
    dialing_code: dial,
    short_codes: parseSupport(short),
    long_codes: parseSupport(longc),
    alphanumeric_sender_id: parseSupport(sender),
    two_way_sms: parseSupport(twoway),
    international_sending: parseSupport(intl),
    toll_free: {
      supported: TOLL_FREE.has(iso),
      registration_required: TOLL_FREE.has(iso),
      raw: TOLL_FREE.has(iso) ? "Yes" : "No",
      notes: [],
    },
    ten_dlc: {
      supported: TEN_DLC.has(iso),
      registration_required: TEN_DLC.has(iso),
      raw: TEN_DLC.has(iso) ? "Yes" : "No",
      notes: [],
    },
  };
});

const payload = {
  source: {
    name: "AWS End User Messaging SMS / Amazon Pinpoint SMS country support",
    repository: REPO,
    source_file: "doc-source/channels-sms-countries.md",
    docs_url: DOCS_URL,
    toll_free_note:
      "Dedicated toll-free and 10DLC availability inferred from AWS origination identity docs (primarily US/Canada/Puerto Rico for toll-free; US for 10DLC). International sending indicates whether internationally enabled numbers such as toll-free can reach the destination on a best-effort basis.",
  },
  generated_at: new Date().toISOString().slice(0, 10),
  count: countries.length,
  countries,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
console.log(`Wrote ${countries.length} countries to ${OUT}`);
