'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface ListaCekanja {
  id: number;
  zahvat_naziv: string;
  regija_naziv: string;
  ustanova_naziv: string;
  datum_termina: string;
  broj_dana_cekanja: number;
}

export default function ZahvatPage() {
  const params = useParams();
  const router = useRouter();
  const [nazivZahvata, setNazivZahvata] = useState('');
  const [rezultati, setRezultati] = useState<ListaCekanja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id;
    fetch(`${API_URL}/api/liste-cekanja/?zahvat_id=${id}`)
      .then(res => res.json())
      .then(data => {
        const zapisi = data.results || data;
        zapisi.sort((a: ListaCekanja, b: ListaCekanja) => b.broj_dana_cekanja - a.broj_dana_cekanja);
        setRezultati(zapisi);
        if (zapisi.length > 0) setNazivZahvata(zapisi[0].zahvat_naziv);
        setLoading(false);
      });
  }, [params.id]);

  const bojaDana = (dana: number) => {
    if (dana > 365) return '#dc2626';
    if (dana > 180) return '#d97706';
    if (dana > 90) return '#ca8a04';
    return '#16a34a';
  };

  const labelDana = (dana: number) => {
    if (dana > 365) return 'Kritično';
    if (dana > 180) return 'Dugo';
    if (dana > 90) return 'Umjereno';
    return 'Kratko';
  };

  const prosjecno = rezultati.length > 0
    ? Math.round(rezultati.reduce((sum, r) => sum + r.broj_dana_cekanja, 0) / rezultati.length)
    : 0;
  const maksimalno = rezultati.length > 0 ? Math.max(...rezultati.map(r => r.broj_dana_cekanja)) : 0;
  const minimalno = rezultati.length > 0 ? Math.min(...rezultati.map(r => r.broj_dana_cekanja)) : 0;

  if (loading) return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8fafc; }
        .loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 1rem;
          color: #64748b;
          font-family: sans-serif;
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div className="loader">
        <div className="spinner"></div>
        Učitavam podatke...
      </div>
    </>
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        .hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          padding: 2rem 2rem 3rem;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-inner { max-width: 860px; margin: 0 auto; position: relative; }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
          margin-bottom: 1.5rem;
          transition: all 0.2s;
          text-decoration: none;
        }
        .back-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #94a3b8;
        }

        .hero-tag {
          display: inline-block;
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.3);
          color: #93c5fd;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .hero h1 {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 0.5rem;
        }

        .hero-sub {
          color: #64748b;
          font-size: 0.9rem;
        }

        .stats-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 2rem;
        }
        .stat-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 1.25rem;
          text-align: center;
          backdrop-filter: blur(10px);
        }
        .stat-card-value {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }
        .stat-card-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .main { max-width: 860px; margin: 0 auto; padding: 2.5rem 2rem; }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
        }
        .count-badge {
          background: #f1f5f9;
          color: #64748b;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
        }

        .lista { display: grid; gap: 0.5rem; }
        .lista-item {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .lista-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
        }
        .lista-item:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.07);
          transform: translateX(3px);
        }

        .item-regija {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.95rem;
          margin-bottom: 0.2rem;
        }
        .item-datum {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .item-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .item-dana {
          font-size: 1.1rem;
          font-weight: 800;
        }
        .item-label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .progress-bar {
          height: 3px;
          background: #f1f5f9;
          border-radius: 2px;
          margin-top: 0.5rem;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.8s ease;
        }

        .footer {
          text-align: center;
          color: #94a3b8;
          font-size: 0.8rem;
          padding: 2rem;
          border-top: 1px solid #e2e8f0;
          margin-top: 2rem;
        }

        @media (max-width: 600px) {
          .stats-cards { grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
          .stat-card { padding: 1rem 0.5rem; }
          .stat-card-value { font-size: 1.5rem; }
        }
      `}</style>

      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          <button className="back-btn" onClick={() => router.push('/')}>
            ← Nazad
          </button>
          <div className="hero-tag">Medicinski zahvat</div>
          <h1>{nazivZahvata}</h1>
          <p className="hero-sub">{rezultati.length} županija · Podaci s HZZO-a · Ažurirano danas</p>

          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: '#dc2626' }}>{maksimalno}</div>
              <div className="stat-card-label">dana max</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: '#d97706' }}>{prosjecno}</div>
              <div className="stat-card-label">dana prosjek</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: '#16a34a' }}>{minimalno}</div>
              <div className="stat-card-label">dana min</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="section-header">
          <h2 className="section-title">Čekanje po županijama</h2>
          <span className="count-badge">{rezultati.length} županija</span>
        </div>

        <div className="lista">
          {rezultati.map((item, i) => {
            const boja = bojaDana(item.broj_dana_cekanja);
            const label = labelDana(item.broj_dana_cekanja);
            const postotak = maksimalno > 0 ? (item.broj_dana_cekanja / maksimalno) * 100 : 0;
            return (
              <div key={i} className="lista-item" style={{ '--boja': boja } as React.CSSProperties}>
                <style>{`.lista-item:nth-child(${i + 1})::before { background: ${boja}; }`}</style>
                <div>
                  <div className="item-regija">{item.regija_naziv}</div>
                  <div className="item-datum">{item.datum_termina}</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${postotak}%`, background: boja + '60' }}></div>
                  </div>
                </div>
                <div className="item-right">
                  <span className="item-dana" style={{ color: boja }}>{item.broj_dana_cekanja} dana</span>
                  <span className="item-label" style={{ background: boja + '18', color: boja }}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="footer">
        Podaci preuzeti s HZZO liste čekanja (liste.cezih.hr) · Ažuriranje svakih 2 sata
      </div>
    </>
  );
}