'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = Header;
const react_1 = __importDefault(require("react"));
function Header() {
    return (<header style={{
            height: '64px',
            backgroundColor: '#18181b',
            borderBottom: '1px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'fixed',
            top: 0,
            left: '260px',
            right: 0,
            zIndex: 30
        }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: '#064e3b',
            color: '#34d399',
            fontSize: '0.75rem',
            fontWeight: 600
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}/>
          API REST: Operativa
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f4f4f5' }}>Admin TCG</div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>SUPER_ADMIN</div>
        </div>
        <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a855f7',
            fontWeight: 'bold',
            fontSize: '0.9rem'
        }}>
          AD
        </div>
      </div>
    </header>);
}
