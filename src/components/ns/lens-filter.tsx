import { Fragment } from "react";

/**
 * Edge-refraction lens for glass surfaces.
 *
 * The displacement map is neutral grey in the middle and ramps to the edges,
 * so the backdrop bends only near a surface's rim, like the edge of a lens.
 * Each colour channel is displaced by a slightly different amount, which adds
 * a faint chromatic fringe. Only Chromium can use an SVG filter inside
 * `backdrop-filter`; other browsers keep the frosted fallback (see GlassLight
 * and the `.lg` rules in styles.css).
 */

const MAP_W = 512;
const MAP_H = 256;
const BAND = 24; // width of the refracting rim, in map units

const MAP_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_W}" height="${MAP_H}" viewBox="0 0 ${MAP_W} ${MAP_H}">` +
  `<defs>` +
  `<linearGradient id="x" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient>` +
  `<linearGradient id="y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0f0"/></linearGradient>` +
  `<filter id="f" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${BAND / 2}"/></filter>` +
  `</defs>` +
  `<rect width="${MAP_W}" height="${MAP_H}" fill="url(#x)"/>` +
  `<rect width="${MAP_W}" height="${MAP_H}" fill="url(#y)" style="mix-blend-mode:screen"/>` +
  `<rect x="${BAND}" y="${BAND}" width="${MAP_W - BAND * 2}" height="${MAP_H - BAND * 2}" rx="${BAND}" fill="#808000" filter="url(#f)"/>` +
  `</svg>`;

const MAP_URI = `data:image/svg+xml,${encodeURIComponent(MAP_SVG)}`;

// Displacement per channel: red bends most, blue least.
const CHANNELS = [
  { id: "r", scale: -72, matrix: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" },
  { id: "g", scale: -66, matrix: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" },
  { id: "b", scale: -60, matrix: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" },
];

export function LensFilter() {
  return (
    <svg className="ns-lens-host" width="0" height="0" aria-hidden="true" focusable="false">
      <filter id="ns-lens" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feImage href={MAP_URI} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
        {CHANNELS.map((c) => (
          // Fragments, not <g>: filter primitives must be direct children of <filter>.
          <Fragment key={c.id}>
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={c.scale}
              xChannelSelector="R"
              yChannelSelector="G"
              result={`d${c.id}`}
            />
            <feColorMatrix in={`d${c.id}`} type="matrix" values={c.matrix} result={c.id} />
          </Fragment>
        ))}
        <feBlend in="r" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b" mode="screen" />
      </filter>
    </svg>
  );
}
