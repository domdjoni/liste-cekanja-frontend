'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface TopCekanje {
  zahvat__naziv: string;
  regija__naziv: string;
  ustanova__naziv: string;
  max_dana: number;
}

interface RegijaStatistika {
  regija__naziv: string;
  prosjecno: number;
  maksimalno: number;
  ukupno_zapisa: number;
}

interface Statistika {
  top_10_najdulje_cekanje: TopCekanje[];
  cekanje_po_regiji: RegijaStatistika[];
  ukupno_zapisa: number;
}

interface Zahvat {
  id: number;
  cezih_id: number;
  naziv: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

function BojaOznaka({ dana }: { dana: number }) {
  const boja = dana > 365 ? '#dc2626' : dana > 180 ? '#d97706' : dana > 90 ? '#ca8a04' : '#16a34a';
  const tekst = dana > 365 ? 'Kritično' : dana > 180 ? 'Dugo' : dana > 90 ? 'Umjereno' : 'Kratko';
  return (
    <span style={{
      background: boja + '18',
      color: boja,
      border: `1px solid ${boja}40`,
      borderRadius: '4px',
      padding: '2px 8px',
      fontSize: '0.7rem',
      fontWeight: '600',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    }}>{tekst}</span>
  );
}

export default function Home() {
  const router = useRouter();
  const [statistika, setStatistika] = useState<Statistika | null>(null);
  const [pretraga, setPretraga] = useState('');
  const [zahvati, setZahvati] = useState<Zahvat[]>([]);
  const [prikaziDropdown, setPrikaziDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/statistika/`)
      .then(res => res.json())
      .then(data => setStatistika(data));
  }, []);

  useEffect(() => {
    if (pretraga.length < 2) {
      setZahvati([]);
      setPrikaziDropdown(false);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`${API_URL}/api/zahvati/?search=${pretraga}`)
        .then(res => res.json())
        .then(data => {
          setZahvati(data.results || data);
          setPrikaziDropdown(true);
          setFocusedIndex(-1);
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [pretraga]);

  const odaberiZahvat = (zahvat: Zahvat) => {
    setPretraga(zahvat.naziv);
    setPrikaziDropdown(false);
    router.push(`/zahvat/${zahvat.cezih_id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!prikaziDropdown) return;
    if (e.key === 'ArrowDown') {
      setFocusedIndex(i => Math.min(i + 1, zahvati.slice(0, 10).length - 1));
    } else if (e.key === 'ArrowUp') {
      setFocusedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      odaberiZahvat(zahvati[focusedIndex]);
    } else if (e.key === 'Escape') {
      setPrikaziDropdown(false);
    }
  };

  const bojaDana = (dana: number) => {
    if (dana > 365) return '#dc2626';
    if (dana > 180) return '#d97706';
    if (dana > 90) return '#ca8a04';
    return '#16a34a';
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        .hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          padding: 3rem 2rem 4rem;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-inner { max-width: 860px; margin: 0 auto; position: relative; }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.3);
          color: #93c5fd;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .hero h1 {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 0.75rem;
        }
        .hero h1 span { color: #60a5fa; }
        .hero p {
          color: #94a3b8;
          font-size: 1rem;
          margin-bottom: 1.5rem;
        }

        .karta-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: #e2e8f0;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          transition: all 0.2s;
        }
        .karta-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.3);
        }

        .search-wrap { position: relative; max-width: 640px; }
        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          font-size: 1rem;
          border: 2px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.07);
          color: #fff;
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .search-input::placeholder { color: #64748b; }
        .search-input:focus {
          border-color: #3b82f6;
          background: rgba(255,255,255,0.1);
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          z-index: 100;
          overflow: hidden;
        }
        .dropdown-item {
          padding: 0.875rem 1.25rem;
          cursor: pointer;
          color: #e2e8f0;
          font-size: 0.9rem;
          border-bottom: 1px solid #1e293b;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .dropdown-item:last-child { border-bottom: none; }
        .dropdown-item:hover, .dropdown-item.focused {
          background: #334155;
          color: #60a5fa;
        }
        .dropdown-item::before { content: '→'; color: #475569; font-size: 0.8rem; }
        .dropdown-item:hover::before, .dropdown-item.focused::before { color: #3b82f6; }

        .stats-bar {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
          flex-wrap: wrap;
        }
        .stat-item { color: #94a3b8; font-size: 0.85rem; }
        .stat-item strong { color: #e2e8f0; font-size: 1.1rem; display: block; }

        .main { max-width: 860px; margin: 0 auto; padding: 2.5rem 2rem; }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }
        .section-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
        .section-pill {
          background: #fee2e2;
          color: #dc2626;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .top-list { display: grid; gap: 0.5rem; margin-bottom: 3rem; }
        .top-item {
          display: grid;
          grid-template-columns: 2.5rem 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .top-item:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 16px rgba(59,130,246,0.1);
          transform: translateY(-1px);
        }
        .top-item.first {
          background: linear-gradient(135deg, #fff5f5, #fff);
          border-color: #fca5a5;
        }
        .rank { font-size: 1.1rem; font-weight: 800; color: #cbd5e1; text-align: center; }
        .rank.first-rank { color: #dc2626; }
        .item-name { font-weight: 600; color: #1e293b; font-size: 0.95rem; margin-bottom: 0.2rem; }
        .item-region { font-size: 0.8rem; color: #64748b; }
        .dana-badge { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .dana-broj { font-size: 1.1rem; font-weight: 800; }

        .regije-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 0.875rem;
          margin-bottom: 3rem;
        }
        .regija-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .regija-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        .regija-naziv { font-weight: 600; color: #1e293b; font-size: 0.9rem; margin-bottom: 0.875rem; }
        .regija-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
        .regija-stat-label { font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
        .regija-stat-value { font-size: 1rem; font-weight: 700; color: #1e293b; }

        .footer {
          text-align: center;
          color: #94a3b8;
          font-size: 0.8rem;
          padding: 2rem;
          border-top: 1px solid #e2e8f0;
        }

        @media (max-width: 600px) {
          .stats-bar { gap: 1rem; }
          .top-item { grid-template-columns: 2rem 1fr auto; gap: 0.75rem; }
        }
      `}</style>

      <div className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <span>●</span> Live podaci · HZZO
          </div>
          <h1>Liste čekanja<br /><span>u Hrvatskoj</span></h1>
          <p>Transparentni pregled čekanja na medicinske pretrage i zahvate u svim županijama.</p>

          <button className="karta-btn" onClick={() => router.push('/karta')}>
            🗺️ Pogledaj interaktivnu kartu Hrvatske →
          </button>

          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              ref={inputRef}
              className="search-input"
              type="text"
              value={pretraga}
              onChange={e => setPretraga(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pretraži zahvat... npr. MR mozga, kardiologija, UZV"
              autoComplete="off"
            />
            {prikaziDropdown && zahvati.length > 0 && (
              <div className="dropdown">
                {zahvati.slice(0, 10).map((zahvat, i) => (
                  <div
                    key={zahvat.id}
                    className={`dropdown-item${i === focusedIndex ? ' focused' : ''}`}
                    onClick={() => odaberiZahvat(zahvat)}
                  >
                    {zahvat.naziv}
                  </div>
                ))}
              </div>
            )}
          </div>

          {statistika && (
            <div className="stats-bar">
              <div className="stat-item">
                <strong><AnimatedNumber value={statistika.ukupno_zapisa} /></strong>
                zapisa u bazi
              </div>
              <div className="stat-item">
                <strong><AnimatedNumber value={statistika.top_10_najdulje_cekanje[0]?.max_dana || 0} /> dana</strong>
                najdulje čekanje
              </div>
              <div className="stat-item">
                <strong>20</strong>
                županija pokriveno
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="main">
        <div className="section-header">
          <h2 className="section-title">Najdulje čekanje</h2>
          <span className="section-pill">Top 10</span>
        </div>

        <div className="top-list">
          {statistika?.top_10_najdulje_cekanje.map((item, i) => (
            <div
              key={i}
              className={`top-item${i === 0 ? ' first' : ''}`}
              onClick={() => {
                fetch(`${API_URL}/api/zahvati/?search=${encodeURIComponent(item.zahvat__naziv)}`)
                  .then(res => res.json())
                  .then(data => {
                    const r = data.results || data;
                    if (r.length > 0) router.push(`/zahvat/${r[0].cezih_id}`);
                  });
              }}
            >
              <span className={`rank${i === 0 ? ' first-rank' : ''}`}>{i + 1}</span>
              <div>
                <div className="item-name">{item.zahvat__naziv}</div>
                <div className="item-region">{item.regija__naziv}</div>
              </div>
              <div className="dana-badge">
                <span className="dana-broj" style={{ color: bojaDana(item.max_dana) }}>
                  {item.max_dana} dana
                </span>
                <BojaOznaka dana={item.max_dana} />
              </div>
            </div>
          ))}
        </div>

        <div className="section-header">
          <h2 className="section-title">Čekanje po županijama</h2>
        </div>

        <div className="regije-grid">
          {statistika?.cekanje_po_regiji.map((regija, i) => {
            const boja = regija.prosjecno > 80 ? '#dc2626' : regija.prosjecno > 40 ? '#d97706' : '#16a34a';
            return (
              <div key={i} className="regija-card">
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: '4px', background: boja,
                  borderRadius: '10px 0 0 10px'
                }}></div>
                <div className="regija-naziv">{regija.regija__naziv}</div>
                <div className="regija-stats">
                  <div>
                    <div className="regija-stat-label">Prosjek</div>
                    <div className="regija-stat-value" style={{ color: boja }}>
                      {Math.round(regija.prosjecno)} dana
                    </div>
                  </div>
                  <div>
                    <div className="regija-stat-label">Maksimum</div>
                    <div className="regija-stat-value">{regija.maksimalno} dana</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="footer">
        Podaci preuzeti s HZZO liste čekanja (liste.cezih.hr) · Ažuriranje svakih 2 sata · Sve informacije su javno dostupne
      </div>
    </>
  );
}