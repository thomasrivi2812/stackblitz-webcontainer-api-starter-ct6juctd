import fs from "node:fs";
// Accueil pilotable depuis WordPress — Incrément 1 : Hero + chiffres KPI.
const getHomeBlock = Buffer.from("CgovLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLy8gQ09OVEVOVSBERSBMJ0FDQ1VFSUwg4oCUIGNoYW1wcyBBQ0YvU0NGIGBob21lRmllbGRzYCBzdXIgbGEgUGFnZSDCqyBhY2N1ZWlsIMK7Ci8vICjDqWRpdGFibGUgKyB0cmFkdWlzaWJsZSB2aWEgUG9seWxhbmcpLiBUb3V0IGVzdCBvcHRpb25uZWwgOiBjaGFxdWUgY2hhbXAgdmlkZQovLyByZXRvbWJlIHN1ciBsZSB0ZXh0ZSBjb2TDqSBkYW5zIGxhIHBhZ2UgKHJlcGxpKS4gSW5jcsOpbWVudCAxIDogSGVybyArIEtQSXMuCi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpleHBvcnQgdHlwZSBIb21lS3BpID0geyB2YWxldXI6IHN0cmluZzsgdW5pdGU6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9OwpleHBvcnQgdHlwZSBIb21lQ29udGVudCA9IHsKICBoZXJvRXllYnJvdzogc3RyaW5nIHwgbnVsbDsKICBoZXJvVGl0bGU6IHN0cmluZyB8IG51bGw7CiAgaGVyb0xlYWQ6IHN0cmluZyB8IG51bGw7CiAgaGVyb0N0YVByaW1hcnlMYWJlbDogc3RyaW5nIHwgbnVsbDsKICBoZXJvQ3RhUHJpbWFyeVVybDogc3RyaW5nIHwgbnVsbDsKICBoZXJvQ3RhU2Vjb25kYXJ5TGFiZWw6IHN0cmluZyB8IG51bGw7CiAgaGVyb0N0YVNlY29uZGFyeVVybDogc3RyaW5nIHwgbnVsbDsKICBoZXJvSW1hZ2U6IHsgc291cmNlVXJsOiBzdHJpbmc7IGFsdFRleHQ6IHN0cmluZyB9IHwgbnVsbDsKICBoZXJvQ2FwdGlvblRpdGxlOiBzdHJpbmcgfCBudWxsOwogIGhlcm9DYXB0aW9uU3ViOiBzdHJpbmcgfCBudWxsOwogIGtwaXM6IEhvbWVLcGlbXTsKfTsKCmNvbnN0IEhPTUVfUVVFUlkgPSBncWxgCiAgcXVlcnkgSG9tZUNvbnRlbnQoJGxhbmd1YWdlOiBMYW5ndWFnZUNvZGVGaWx0ZXJFbnVtKSB7CiAgICBwYWdlcyhmaXJzdDogMSwgd2hlcmU6IHsgbmFtZTogImFjY3VlaWwiLCBsYW5ndWFnZTogJGxhbmd1YWdlIH0pIHsKICAgICAgbm9kZXMgewogICAgICAgIGhvbWVGaWVsZHMgewogICAgICAgICAgaGVyb0V5ZWJyb3cKICAgICAgICAgIGhlcm9UaXRsZQogICAgICAgICAgaGVyb0xlYWQKICAgICAgICAgIGhlcm9DdGFQcmltYXJ5TGFiZWwKICAgICAgICAgIGhlcm9DdGFQcmltYXJ5VXJsCiAgICAgICAgICBoZXJvQ3RhU2Vjb25kYXJ5TGFiZWwKICAgICAgICAgIGhlcm9DdGFTZWNvbmRhcnlVcmwKICAgICAgICAgIGhlcm9JbWFnZSB7IG5vZGUgeyBzb3VyY2VVcmwgYWx0VGV4dCB9IH0KICAgICAgICAgIGhlcm9DYXB0aW9uVGl0bGUKICAgICAgICAgIGhlcm9DYXB0aW9uU3ViCiAgICAgICAgICBrcGlzIHsgdmFsZXVyIHVuaXRlIGxhYmVsIH0KICAgICAgICB9CiAgICAgIH0KICAgIH0KICB9CmA7Cgp0eXBlIFdwSG9tZUZpZWxkcyA9IHsKICBoZXJvRXllYnJvdzogc3RyaW5nIHwgbnVsbDsKICBoZXJvVGl0bGU6IHN0cmluZyB8IG51bGw7CiAgaGVyb0xlYWQ6IHN0cmluZyB8IG51bGw7CiAgaGVyb0N0YVByaW1hcnlMYWJlbDogc3RyaW5nIHwgbnVsbDsKICBoZXJvQ3RhUHJpbWFyeVVybDogc3RyaW5nIHwgbnVsbDsKICBoZXJvQ3RhU2Vjb25kYXJ5TGFiZWw6IHN0cmluZyB8IG51bGw7CiAgaGVyb0N0YVNlY29uZGFyeVVybDogc3RyaW5nIHwgbnVsbDsKICBoZXJvSW1hZ2U6IHsgbm9kZTogeyBzb3VyY2VVcmw6IHN0cmluZzsgYWx0VGV4dDogc3RyaW5nIH0gfCBudWxsIH0gfCBudWxsOwogIGhlcm9DYXB0aW9uVGl0bGU6IHN0cmluZyB8IG51bGw7CiAgaGVyb0NhcHRpb25TdWI6IHN0cmluZyB8IG51bGw7CiAga3BpczogeyB2YWxldXI6IHN0cmluZyB8IG51bGw7IHVuaXRlOiBzdHJpbmcgfCBudWxsOyBsYWJlbDogc3RyaW5nIHwgbnVsbCB9W10gfCBudWxsOwp9IHwgbnVsbDsKCi8qKgogKiBDb250ZW51IMOpZGl0b3JpYWwgZGUgbCdhY2N1ZWlsIGRlcHVpcyBXb3JkUHJlc3MgKHBhZ2UgwqsgYWNjdWVpbCDCuywgY2hhbXBzCiAqIGBob21lRmllbGRzYCkuIFJlbnZvaWUgbnVsbCBzaSBsJ0FQSSBlc3QgYWJzZW50ZSBvdSBsYSBwYWdlIGludHJvdXZhYmxlCiAqIOKGkiBsJ2FjY3VlaWwgYWZmaWNoZSBhbG9ycyBzb24gY29udGVudSBwYXIgZMOpZmF1dCAocmVwbGkpLgogKi8KZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEhvbWUobG9jYWxlOiBXcExvY2FsZSA9ICdmcicpOiBQcm9taXNlPEhvbWVDb250ZW50IHwgbnVsbD4gewogIGlmICghZW5kcG9pbnQpIHJldHVybiBudWxsOwogIHRyeSB7CiAgICBjb25zdCBjbGllbnQgPSBuZXcgR3JhcGhRTENsaWVudChlbmRwb2ludCk7CiAgICBjb25zdCBkYXRhID0gYXdhaXQgd3BTaW5nbGU8eyBwYWdlczogeyBub2RlczogeyBob21lRmllbGRzOiBXcEhvbWVGaWVsZHMgfVtdIH0gfT4oCiAgICAgIGNsaWVudCwgSE9NRV9RVUVSWSwge30sIGxvY2FsZSwgKGQpID0+IGQucGFnZXM/Lm5vZGVzPy5bMF0/LmhvbWVGaWVsZHMsCiAgICApOwogICAgY29uc3QgZiA9IGRhdGEucGFnZXM/Lm5vZGVzPy5bMF0/LmhvbWVGaWVsZHM7CiAgICBpZiAoIWYpIHJldHVybiBudWxsOwogICAgcmV0dXJuIHsKICAgICAgaGVyb0V5ZWJyb3c6IGYuaGVyb0V5ZWJyb3cgfHwgbnVsbCwKICAgICAgaGVyb1RpdGxlOiBmLmhlcm9UaXRsZSB8fCBudWxsLAogICAgICBoZXJvTGVhZDogZi5oZXJvTGVhZCB8fCBudWxsLAogICAgICBoZXJvQ3RhUHJpbWFyeUxhYmVsOiBmLmhlcm9DdGFQcmltYXJ5TGFiZWwgfHwgbnVsbCwKICAgICAgaGVyb0N0YVByaW1hcnlVcmw6IGYuaGVyb0N0YVByaW1hcnlVcmwgfHwgbnVsbCwKICAgICAgaGVyb0N0YVNlY29uZGFyeUxhYmVsOiBmLmhlcm9DdGFTZWNvbmRhcnlMYWJlbCB8fCBudWxsLAogICAgICBoZXJvQ3RhU2Vjb25kYXJ5VXJsOiBmLmhlcm9DdGFTZWNvbmRhcnlVcmwgfHwgbnVsbCwKICAgICAgaGVyb0ltYWdlOiBmLmhlcm9JbWFnZT8ubm9kZQogICAgICAgID8geyBzb3VyY2VVcmw6IGYuaGVyb0ltYWdlLm5vZGUuc291cmNlVXJsLCBhbHRUZXh0OiBmLmhlcm9JbWFnZS5ub2RlLmFsdFRleHQgPz8gJycgfQogICAgICAgIDogbnVsbCwKICAgICAgaGVyb0NhcHRpb25UaXRsZTogZi5oZXJvQ2FwdGlvblRpdGxlIHx8IG51bGwsCiAgICAgIGhlcm9DYXB0aW9uU3ViOiBmLmhlcm9DYXB0aW9uU3ViIHx8IG51bGwsCiAgICAgIGtwaXM6IChmLmtwaXMgPz8gW10pCiAgICAgICAgLm1hcCgoaykgPT4gKHsgdmFsZXVyOiBrLnZhbGV1ciA/PyAnJywgdW5pdGU6IGsudW5pdGUgPz8gJycsIGxhYmVsOiBrLmxhYmVsID8/ICcnIH0pKQogICAgICAgIC5maWx0ZXIoKGspID0+IGsudmFsZXVyIHx8IGsubGFiZWwpLAogICAgfTsKICB9IGNhdGNoIChlcnJvcikgewogICAgbG9nV3BFcnJvcignYWNjdWVpbCcsIGVycm9yKTsKICAgIHJldHVybiBudWxsOwogIH0KfQo=", "base64").toString("utf8");
const patches = [
  [
    "  getServices,\n",
    "  getServices,\n  getHome,\n"
  ],
  [
    "default.home as Record<string, string>;",
    "default.home as Record<string, string>;\n  const wp = await getHome(locale);"
  ],
  [
    "{t.heroEyebrow}",
    "{wp?.heroEyebrow || t.heroEyebrow}"
  ],
  [
    "{t.heroTitle1} <span className=\"title-accent\">{t.heroTitleAccent}</span>.",
    "{wp?.heroTitle ?? <>{t.heroTitle1} <span className=\"title-accent\">{t.heroTitleAccent}</span>.</>}"
  ],
  [
    "<p className=\"hero-lead\">{t.heroLead}</p>",
    "<p className=\"hero-lead\">{wp?.heroLead || t.heroLead}</p>"
  ],
  [
    "<a className=\"btn-v2 btn-v2-primary\" href=\"/datacenters\">",
    "<a className=\"btn-v2 btn-v2-primary\" href={wp?.heroCtaPrimaryUrl || \"/datacenters\"}>"
  ],
  [
    "{t.heroCtaPrimary}\n",
    "{wp?.heroCtaPrimaryLabel || t.heroCtaPrimary}\n"
  ],
  [
    "<a className=\"btn-v2 btn-v2-ghost\" href=\"/contact\">{t.heroCtaSecondary}</a>",
    "<a className=\"btn-v2 btn-v2-ghost\" href={wp?.heroCtaSecondaryUrl || \"/contact\"}>{wp?.heroCtaSecondaryLabel || t.heroCtaSecondary}</a>"
  ],
  [
    "src={heroImage}",
    "src={wp?.heroImage?.sourceUrl || heroImage}"
  ],
  [
    "<strong>{t.heroCaptionTitle}</strong>",
    "<strong>{wp?.heroCaptionTitle || t.heroCaptionTitle}</strong>"
  ],
  [
    "const kpis = networkKpis(datacenters);",
    "const kpis = wp?.kpis?.length ? wp.kpis : networkKpis(datacenters);"
  ]
];
{
  const f = "lib/wordpress.ts";
  const s = fs.readFileSync(f, "utf8");
  if (!s.includes("export async function getHome")) { fs.writeFileSync(f, s.trimEnd() + getHomeBlock); console.log("getHome ajouté à", f); }
  else console.log("getHome déjà présent");
}
{
  const f = "app/[locale]/page.tsx";
  let s = fs.readFileSync(f, "utf8");
  let done = 0, skip = 0;
  for (const [from, to] of patches) {
    if (s.includes(to)) { skip++; continue; }
    if (s.includes(from)) { s = s.replace(from, to); done++; } else skip++;
  }
  fs.writeFileSync(f, s);
  console.log("page accueil : " + done + " branchements, " + skip + " ignorés (déjà faits/introuvables)");
}
console.log("\n✓ Fait. Ctrl+C puis : npm run dev");
