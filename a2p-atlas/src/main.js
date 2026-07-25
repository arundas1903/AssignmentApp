import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";
import dataset from "./data/a2p-countries.json";

const FILTERS = [
  { id: "alphanumeric_sender_id", label: "Alphanumeric" },
  { id: "short_codes", label: "Short codes" },
  { id: "long_codes", label: "Long codes" },
  { id: "toll_free", label: "Toll-free" },
  { id: "ten_dlc", label: "10DLC" },
  { id: "two_way_sms", label: "Two-way" },
  { id: "international_sending", label: "Intl. sending" },
];

const CAPABILITY_LABELS = {
  alphanumeric_sender_id: "Alphanumeric sender ID",
  short_codes: "Short codes",
  long_codes: "Long codes",
  toll_free: "Toll-free",
  ten_dlc: "10DLC",
  two_way_sms: "Two-way SMS",
  international_sending: "International sending",
};

const GEOJSON_URL =
  "https://cdn.jsdelivr.net/gh/datasets/geo-countries@master/data/countries.geojson";

const byIso = new Map(dataset.countries.map((c) => [c.iso, c]));

let activeFilter = "alphanumeric_sender_id";
let selectedIso = null;
let countriesLayer = null;

const app = document.querySelector("#app");
app.innerHTML = `
  <div class="shell">
    <div id="map" class="map" aria-label="World map of A2P SMS support"></div>
    <header class="topbar">
      <div class="brand-block">
        <h1 class="brand">A2P Atlas</h1>
        <p class="tagline">
          See how Application-to-Person SMS senders work in each country —
          alphanumeric IDs, short and long codes, toll-free, and more.
        </p>
        <div class="filters" role="toolbar" aria-label="Sender type filters">
          ${FILTERS.map(
            (f) => `
            <button
              type="button"
              class="filter-btn"
              data-filter="${f.id}"
              aria-pressed="${f.id === activeFilter}"
            >${f.label}</button>`
          ).join("")}
        </div>
        <p class="stats" id="stats"></p>
      </div>
    </header>
    <aside class="panel" id="panel" aria-live="polite"></aside>
  </div>
`;

const statsEl = document.querySelector("#stats");
const panelEl = document.querySelector("#panel");

document.querySelector(".filters").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-filter]");
  if (!btn) return;
  activeFilter = btn.dataset.filter;
  document.querySelectorAll(".filter-btn").forEach((el) => {
    el.setAttribute("aria-pressed", String(el.dataset.filter === activeFilter));
  });
  paintCountries();
  updateStats();
  if (selectedIso) renderPanel(selectedIso);
});

const map = L.map("map", {
  center: [18, 10],
  zoom: 2,
  minZoom: 2,
  maxZoom: 7,
  zoomControl: false,
  worldCopyJump: true,
});

L.control.zoom({ position: "bottomleft" }).addTo(map);
map.setMaxBounds([
  [-60, -180],
  [84, 180],
]);

function featureIso(feature) {
  const p = feature.properties || {};
  return (
    p.ISO_A2 ||
    p.iso_a2 ||
    p["ISO3166-1-Alpha-2"] ||
    p.iso ||
    p.ISO ||
    null
  );
}

function supportTone(entry) {
  if (!entry) return "unknown";
  if (entry.registration_required) return "reg";
  if (entry.supported) return "yes";
  return "no";
}

function styleForFeature(feature) {
  const iso = featureIso(feature);
  const data = byIso.get(iso);
  const selected = iso === selectedIso;
  const match = data?.[activeFilter]?.supported;

  let fill = "#c9d4d1";
  if (data) {
    if (match && data[activeFilter].registration_required) fill = "#f2c14e";
    else if (match) fill = "#2f9aa8";
    else fill = "#b9cfc8";
  }

  return {
    color: selected ? "#0b2430" : "rgba(11, 36, 48, 0.28)",
    weight: selected ? 2.2 : 0.7,
    fillColor: selected ? "#146c7a" : fill,
    fillOpacity: selected ? 0.95 : match ? 0.88 : 0.55,
  };
}

function paintCountries() {
  if (countriesLayer) countriesLayer.setStyle(styleForFeature);
}

function updateStats() {
  const supported = dataset.countries.filter(
    (c) => c[activeFilter]?.supported
  ).length;
  const reg = dataset.countries.filter(
    (c) => c[activeFilter]?.supported && c[activeFilter]?.registration_required
  ).length;
  const label = FILTERS.find((f) => f.id === activeFilter)?.label ?? activeFilter;
  statsEl.textContent = `${supported} of ${dataset.count} countries support ${label}${
    reg ? ` · ${reg} require registration` : ""
  }. Click a country for details.`;
}

function badge(entry) {
  const tone = supportTone(entry);
  const text =
    tone === "reg"
      ? "Registration required"
      : tone === "yes"
        ? "Supported"
        : "Not supported";
  return `<span class="badge ${tone}">${text}</span>`;
}

function renderPanel(iso) {
  const data = byIso.get(iso);
  selectedIso = iso;
  paintCountries();

  if (!data) {
    panelEl.classList.add("open");
    panelEl.innerHTML = `
      <div class="panel-head">
        <div>
          <h2>${iso}</h2>
          <p class="meta">No SMS capability data in the AWS country table.</p>
        </div>
        <button type="button" class="close-btn" aria-label="Close">×</button>
      </div>`;
    panelEl.querySelector(".close-btn").onclick = closePanel;
    return;
  }

  const caps = Object.keys(CAPABILITY_LABELS)
    .map(
      (key) => `
        <div class="cap">
          <span class="cap-label">${CAPABILITY_LABELS[key]}</span>
          ${badge(data[key])}
        </div>`
    )
    .join("");

  panelEl.classList.add("open");
  panelEl.innerHTML = `
    <div class="panel-head">
      <div>
        <h2>${data.country}</h2>
        <p class="meta">${data.iso} · +${data.dialing_code}</p>
      </div>
      <button type="button" class="close-btn" aria-label="Close">×</button>
    </div>
    <div class="capabilities">${caps}</div>
    <p class="source">
      Data from
      <a href="${dataset.source.docs_url}" target="_blank" rel="noreferrer">
        AWS End User Messaging SMS country support
      </a>
      (also published in
      <a href="${dataset.source.repository}" target="_blank" rel="noreferrer">
        awsdocs/amazon-pinpoint-user-guide
      </a>).
      Toll-free and 10DLC flags follow AWS origination-identity guidance.
    </p>`;
  panelEl.querySelector(".close-btn").onclick = closePanel;
}

function closePanel() {
  selectedIso = null;
  panelEl.classList.remove("open");
  paintCountries();
}

async function loadMap() {
  updateStats();
  const geojson = await fetch(GEOJSON_URL).then((r) => {
    if (!r.ok) throw new Error(`GeoJSON HTTP ${r.status}`);
    return r.json();
  });

  countriesLayer = L.geoJSON(geojson, {
    style: styleForFeature,
    onEachFeature(feature, layer) {
      const iso = featureIso(feature);
      const data = byIso.get(iso);
      const name =
        data?.country ||
        feature.properties?.name ||
        feature.properties?.ADMIN ||
        feature.properties?.NAME ||
        iso ||
        "Unknown";

      layer.bindTooltip(name, {
        sticky: true,
        className: "country-tooltip",
        opacity: 0.95,
      });

      layer.on({
        mouseover(e) {
          e.target.setStyle({
            weight: 1.6,
            color: "#0b2430",
            fillOpacity: 0.95,
          });
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            e.target.bringToFront();
          }
        },
        mouseout(e) {
          countriesLayer.resetStyle(e.target);
          if (selectedIso) paintCountries();
        },
        click() {
          if (iso && iso !== "-99") renderPanel(iso);
        },
      });
    },
  }).addTo(map);
}

loadMap().catch((err) => {
  statsEl.textContent = `Failed to load map data: ${err.message}`;
  console.error(err);
});
