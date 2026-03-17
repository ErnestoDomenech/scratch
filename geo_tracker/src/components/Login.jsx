import { useState } from 'react';
import { LogIn, Phone } from 'lucide-react';

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation: starts with + and follows by at least 6 digits
    const phoneRegex = /^\+[1-9]\d{5,14}$/;
    
    if (!phoneRegex.test(phone)) {
      setError('Por favor, ingresa un número válido con código internacional (ej. +34666666666)');
      return;
    }

    setError('');
    onLogin(phone);
  };

  return (
    <div className="glass-panel text-center">
      <div className="mb-8" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: 'var(--primary-glow)',
          padding: '1rem',
          borderRadius: '50%',
          display: 'inline-flex'
        }}>
          <Phone size={32} color="var(--primary)" />
        </div>
      </div>
      
      <h1 className="mb-2" style={{ fontSize: '1.8rem', fontWeight: '700' }}>TimeOn Tracker</h1>
      <p className="text-muted mb-8">Inicia sesión para comenzar </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6" style={{ position: 'relative' }}>
          <input
            type="tel"
            className="input-field"
            placeholder="+34 666 666 666"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          {error && (
            <p className="text-danger mt-2" style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'left' }}>
              {error}
            </p>
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          <LogIn size={20} />
          <span>Ingresar</span>
        </button>
      </form>
    </div>
  );
}
