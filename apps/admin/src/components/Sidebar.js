'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = Sidebar;
const react_1 = __importDefault(require("react"));
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const NAV_ITEMS = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Cartas', href: '/cards', icon: '📇' },
    { label: 'Colecciones', href: '/collections', icon: '📦' },
    { label: 'Rarezas', href: '/rarities', icon: '⭐' },
    { label: 'Tipos de Energía', href: '/energy-types', icon: '⚡' },
];
function Sidebar() {
    const pathname = (0, navigation_1.usePathname)();
    return (<aside style={{
            width: '260px',
            backgroundColor: '#18181b',
            borderRight: '1px solid #27272a',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 40
        }}>
      <div style={{
            padding: '1.5rem 1.25rem',
            borderBottom: '1px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        }}>
        <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#ffffff'
        }}>
          TCG
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#f4f4f5', fontWeight: 600 }}>TCG Vision</h2>
          <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Panel de Administración</span>
        </div>
      </div>

      <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (<li key={item.href}>
                <link_1.default href={item.href} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400,
                    backgroundColor: isActive ? '#27272a' : 'transparent',
                    color: isActive ? '#a855f7' : '#a1a1aa',
                    transition: 'all 0.15s ease'
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  {item.label}
                </link_1.default>
              </li>);
        })}
        </ul>
      </nav>

      <div style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid #27272a',
            fontSize: '0.8rem',
            color: '#71717a'
        }}>
        <p style={{ margin: 0 }}>TCG Vision v1.0.0</p>
        <p style={{ margin: '0.25rem 0 0 0' }}>Monorepo Turborepo</p>
      </div>
    </aside>);
}
