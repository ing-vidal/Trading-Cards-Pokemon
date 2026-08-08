"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewport = exports.metadata = void 0;
exports.default = RootLayout;
const react_1 = __importDefault(require("react"));
exports.metadata = {
    title: 'TCG Vision — Catálogo 3D Interactivo & Marketplace de Cartas',
    description: 'Plataforma digital especializada en la catalogación, renderizado 3D en tiempo real con Shaders GLSL, gestión de colecciones y marketplace de cartas TCG.',
    keywords: ['TCG', 'Pokemon TCG', 'Trading Cards', 'Visor 3D', 'GLSL Shaders', 'Holographic Cards', 'Marketplace', 'PSA 10'],
    authors: [{ name: 'TCG Vision Development Team' }],
    openGraph: {
        title: 'TCG Vision — 3D Interactive Card Platform',
        description: 'Experimenta la visualización 3D interactiva de cartas TCG con efectos de rareza en tiempo real.',
        type: 'website',
        locale: 'es_ES',
        siteName: 'TCG Vision',
    },
    robots: {
        index: true,
        follow: true,
    },
};
exports.viewport = {
    themeColor: '#09090b',
    width: 'device-width',
    initialScale: 1,
};
function RootLayout({ children }) {
    return (<html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#09090b', color: '#f4f4f5' }}>
        <div style={{ display: 'none' }} aria-hidden="true">
          <img src="/next.svg" alt="next"/>
          <img src="/vercel.svg" alt="vercel"/>
        </div>
        {children}
      </body>
    </html>);
}
