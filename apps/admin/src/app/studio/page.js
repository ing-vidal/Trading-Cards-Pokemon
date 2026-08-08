'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StudioCMSPage;
const react_1 = __importStar(require("react"));
function StudioCMSPage() {
    const [selectedShader, setSelectedShader] = (0, react_1.useState)('basic-foil');
    const [intensity, setIntensity] = (0, react_1.useState)(60);
    const [foilPattern, setFoilPattern] = (0, react_1.useState)('linear-rainbow');
    const [particleSpeed, setParticleSpeed] = (0, react_1.useState)(1.5);
    const [colorTint, setColorTint] = (0, react_1.useState)('#a855f7');
    return (<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#f4f4f5' }}>
          Studio CMS — Diseñador de Shaders & Presets 3D
        </h1>
        <p style={{ margin: '0.25rem 0 0 0', color: '#a1a1aa', fontSize: '0.9rem' }}>
          Configura y edita en tiempo real los parámetros GLSL para efectos de rareza (Foil, Rainbow, Gold, Cosmic).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Live Preview Panel */}
        <div style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '480px',
            position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1.25rem',
            fontSize: '0.8rem',
            color: '#71717a',
            fontWeight: 600
        }}>
            VISTA PREVIA 3D EN TIEMPO REAL
          </div>

          {/* Simulated 3D Card Object */}
          <div style={{
            width: '240px',
            height: '340px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, #1e1b4b 0%, ${colorTint} 50%, #0f172a 100%)`,
            border: '2px solid #a855f7',
            boxShadow: `0 0 ${intensity / 2}px ${colorTint}90`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1.25rem',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Charizard VMAX</span>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>330 HP</span>
            </div>

            <div style={{
            flex: 1,
            margin: '1rem 0',
            borderRadius: '8px',
            border: '1px solid #ffffff30',
            background: `radial-gradient(circle, ${colorTint}40 0%, transparent 80%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
        }}>
              ✨
            </div>

            <div style={{ fontSize: '0.75rem', color: '#e2e8f0', textAlign: 'center' }}>
              Shader: <b>{selectedShader}</b> | Foil: <b>{foilPattern}</b>
            </div>
          </div>
        </div>

        {/* Controls Sidebar Panel */}
        <div style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f4f4f5' }}>Controles de Shader</h3>

          {/* Shader Preset Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>
              Preset de Shader Base
            </label>
            <select value={selectedShader} onChange={(e) => setSelectedShader(e.target.value)} style={{
            width: '100%',
            padding: '0.65rem',
            borderRadius: '6px',
            border: '1px solid #3f3f46',
            backgroundColor: '#09090b',
            color: '#f4f4f5',
            fontSize: '0.9rem'
        }}>
              <option value="basic-foil">Basic Holographic Foil</option>
              <option value="rainbow-hyper">Rainbow Hyper Rare</option>
              <option value="gold-rellic">Gold Metallic Relic</option>
              <option value="cosmic-glitch">Cosmic Glitch Particles</option>
            </select>
          </div>

          {/* Intensity Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>
              <span>Intensidad de Brillo</span>
              <span style={{ color: '#a855f7', fontWeight: 700 }}>{intensity}%</span>
            </div>
            <input type="range" min="0" max="100" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}/>
          </div>

          {/* Foil Pattern */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>
              Patrón Foil Metalizado
            </label>
            <select value={foilPattern} onChange={(e) => setFoilPattern(e.target.value)} style={{
            width: '100%',
            padding: '0.65rem',
            borderRadius: '6px',
            border: '1px solid #3f3f46',
            backgroundColor: '#09090b',
            color: '#f4f4f5',
            fontSize: '0.9rem'
        }}>
              <option value="linear-rainbow">Linear Rainbow</option>
              <option value="diagonal-shatter">Diagonal Shattered Glass</option>
              <option value="starburst">Starburst Flare</option>
            </select>
          </div>

          {/* Color Tint */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>
              Tinte de Reflejo Fresnel
            </label>
            <input type="color" value={colorTint} onChange={(e) => setColorTint(e.target.value)} style={{
            width: '100%',
            height: '40px',
            borderRadius: '6px',
            border: '1px solid #3f3f46',
            backgroundColor: '#09090b',
            cursor: 'pointer'
        }}/>
          </div>

          <button onClick={() => alert('Preset guardado exitosamente en la base de datos')} style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#a855f7',
            color: '#ffffff',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem'
        }}>
            Guardar Preset en Studio DB
          </button>
        </div>
      </div>
    </div>);
}
