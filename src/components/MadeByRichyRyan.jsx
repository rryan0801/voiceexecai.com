// "Made by" badge shown in the footer of every Richy Ryan AI Agency site.
const BADGE_URL =
  "https://media.base44.com/images/public/69dd6507b6b3acb87a78ec64/dcacc78a6_richy-ryan-ai-agency-badge.webp";

export default function MadeByRichyRyan({ className = "" }) {
  return (
    <a
      href="https://richyryanofficial.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-3 text-sm ${className}`}
      aria-label="A Richy Ryan AI Agency product"
    >
      <img
        src={BADGE_URL}
        alt="Richy Ryan AI Agency logo"
        width={44}
        height={44}
        style={{ width: 44, height: 44, borderRadius: "9999px", boxShadow: "0 0 0 2px #D6AF37" }}
        loading="lazy"
      />
      <span className="opacity-70 group-hover:opacity-100 transition-opacity">A Richy Ryan AI Agency product</span>
    </a>
  );
}
