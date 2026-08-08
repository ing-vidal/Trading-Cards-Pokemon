"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = AdminLayout;
const react_1 = __importDefault(require("react"));
const Sidebar_1 = require("../components/Sidebar");
const Header_1 = require("../components/Header");
exports.metadata = {
    title: 'TCG Vision — Admin Panel',
    description: 'Panel de administración de cartas y colecciones Pokémon TCG.'
};
function AdminLayout({ children }) {
    return (<html lang="es">
      <body style={{
            margin: 0,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: '#09090b',
            color: '#f4f4f5',
            display: 'flex',
            minHeight: '100vh'
        }}>
        <div style={{ display: 'none' }} aria-hidden="true">
          <img src="/next.svg" alt="next"/>
          <img src="/vercel.svg" alt="vercel"/>
        </div>
        <Sidebar_1.Sidebar />
        <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
          <Header_1.Header />
          <main style={{ marginTop: '64px', padding: '2rem', flex: 1, backgroundColor: '#09090b' }}>
            {children}
          </main>
        </div>
      </body>
    </html>);
}
