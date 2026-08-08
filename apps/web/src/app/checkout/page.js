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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CheckoutPage;
const react_1 = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
function CheckoutPage() {
    const [shippingAddress, setShippingAddress] = (0, react_1.useState)('');
    const [paymentMethod, setPaymentMethod] = (0, react_1.useState)('card');
    const [orderComplete, setOrderComplete] = (0, react_1.useState)(false);
    const [orderNumber, setOrderNumber] = (0, react_1.useState)('');
    const cartItems = [
        { id: 'p1', cardName: 'Charizard VMAX', condition: 'PSA 10 Gem Mint', price: 1250.00, quantity: 1, color: '#ec4899' },
        { id: 'p2', cardName: 'Pikachu EX Gold', condition: 'Near Mint (RAW)', price: 149.50, quantity: 1, color: '#eab308' },
    ];
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = 15.00;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    const handleCheckout = (e) => {
        e.preventDefault();
        if (!shippingAddress)
            return;
        const num = `ORD-${Date.now().toString().slice(-6)}`;
        setOrderNumber(num);
        setOrderComplete(true);
    };
    if (orderComplete) {
        return (<div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: 'clamp(2rem, 8vw, 4rem) clamp(1rem, 4vw, 2rem)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '3rem', maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#064e3b', color: '#34d399', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            ✓
          </div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>¡Pedido Confirmado!</h1>
          <p style={{ margin: '0.5rem 0 1.5rem 0', color: '#a1a1aa', fontSize: '0.95rem' }}>
            Tu orden <b style={{ color: '#38bdf8' }}>#{orderNumber}</b> ha sido procesada exitosamente.
          </p>

          <div style={{ backgroundColor: '#09090b', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', textAlign: 'left', fontSize: '0.85rem' }}>
            <div style={{ color: '#a1a1aa' }}>Dirección de Envío:</div>
            <div style={{ fontWeight: 600, color: '#f4f4f5', marginTop: '0.25rem' }}>{shippingAddress}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #27272a' }}>
              <span>Total Pagado:</span>
              <span style={{ fontWeight: 800, color: '#10b981' }}>${total.toFixed(2)} USD</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <link_1.default href="/orders" style={{ backgroundColor: '#a855f7', color: '#ffffff', textDecoration: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600 }}>
              Ver Mis Pedidos
            </link_1.default>
            <link_1.default href="/catalog" style={{ backgroundColor: '#27272a', color: '#f4f4f5', textDecoration: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600 }}>
              Volver a la Tienda
            </link_1.default>
          </div>
        </div>
      </div>);
    }
    return (<div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: 'clamp(1rem, 4vw, 2rem)' }}>
      <div className="checkout-shell" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Checkout & Finalizar Compra</h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#a1a1aa', fontSize: '0.95rem' }}>
              Ingresa tus datos de envío y confirma el pago seguro de tu pedido.
            </p>
          </div>
          <link_1.default href="/catalog" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            ← Volver al Catálogo
          </link_1.default>
        </div>

        {/* Checkout Form & Order Summary */}
        <form className="checkout-grid" onSubmit={handleCheckout} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(280px, 1fr)', gap: '2.5rem' }}>
          {/* Shipping & Payment Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Address Box */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#f4f4f5' }}>1. Dirección de Envío</h3>
              <textarea required rows={3} placeholder="Ingresa tu dirección completa (Calle, Número, Ciudad, Código Postal, País)..." value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#09090b', color: '#f4f4f5', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}/>
            </div>

            {/* Payment Method Box */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#f4f4f5' }}>2. Método de Pago</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', border: paymentMethod === 'card' ? '1px solid #a855f7' : '1px solid #27272a', cursor: 'pointer' }}>
                  <input type="radio" name="pay" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')}/>
                  <span>💳 Tarjeta de Crédito / Débito (Stripe / Visa)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', border: paymentMethod === 'crypto' ? '1px solid #a855f7' : '1px solid #27272a', cursor: 'pointer' }}>
                  <input type="radio" name="pay" checked={paymentMethod === 'crypto'} onChange={() => setPaymentMethod('crypto')}/>
                  <span>⚡ Pago Seguro USDT / Cripto</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Box */}
          <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f4f4f5' }}>Resumen del Pedido</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cartItems.map((item) => (<div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#f4f4f5' }}>{item.cardName}</div>
                    <div style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>{item.condition} x{item.quantity}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>))}
            </div>

            <div style={{ borderTop: '1px solid #27272a', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                <span>Envío Asegurado</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                <span>Impuestos (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#f4f4f5', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #3f3f46' }}>
                <span>Total a Pagar</span>
                <span style={{ color: '#10b981' }}>${total.toFixed(2)} USD</span>
              </div>
            </div>

            <button type="submit" style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#10b981',
            color: '#042f2e',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '0.5rem'
        }}>
              PAGAR AHORA (${total.toFixed(2)})
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        @media (max-width: 760px) {
          .checkout-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
        }
        @media (max-width: 520px) {
          .checkout-shell { gap: 1.25rem !important; }
        }
      `}</style>
    </div>);
}
