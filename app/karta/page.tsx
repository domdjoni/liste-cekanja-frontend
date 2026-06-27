'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface RegijaStatistika {
  regija__naziv: string;
  prosjecno: number;
  maksimalno: number;
  ukupno_zapisa: number;
}

const ZUPANIJE = [
  { naziv: 'Međimurska županija', x: 72, y: 5 },
  { naziv: 'Varaždinska županija', x: 62, y: 11 },
  { naziv: 'Krapinsko-zagorska županija', x: 50, y: 11 },
  { naziv: 'Koprivničko-križevačka županija', x: 74, y: 17 },
  { naziv: 'Bjelovarsko-bilogorska županija', x: 71, y: 25 },
  { naziv: 'Zagrebačka županija i Grad Zagreb', x: 52, y: 22 },
  { naziv: 'Virovitičko-podravska županija', x: 82, y: 22 },
  { naziv: 'Sisačko-moslavačka županija', x: 56, y: 33 },
  { naziv: 'Karlovačka županija', x: 42, y: 35 },
  { naziv: 'Požeško-slavonska županija', x: 75, y: 34 },
  { naziv: 'Brodsko-posavska županija', x: 74, y: 42 },
  { naziv: 'Osječko-baranjska županija', x: 88, y: 28 },
  { naziv: 'Vukovarsko-srijemska županija', x: 92, y: 40 },
  { naziv: 'Primorsko-goranska županija', x: 30, y: 37 },
  { naziv: 'Ličko-senjska županija', x: 38, y: 47 },
  { naziv: 'Zadarska županija', x: 36, y: 61 },
  { naziv: 'Šibensko-kninska županija', x: 44, y: 67 },
  { naziv: 'Splitsko-dalmatinska županija', x: 52, y: 76 },
  { naziv: 'Istarska županija', x: 14, y: 39 },
  { naziv: 'Dubrovačko-neretvanska županija', x: 64, y: 88 },
];

export default function KartaPage() {
  const router = useRouter();
  const [statistika, setStatistika] = useState<RegijaStatistika[]>([]);
  const [odabranaRegija, setOdabranaRegija] = useState<RegijaStatistika | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/statistika/`)
      .then(res => res.json())
      .then(data => {
        setStatistika(data.cekanje_po_regiji || []);
        setLoading(false);
      });
  }, []);

  const getStat = (naziv: string) =>
    statistika.find(r => r.regija__naziv === naziv);

  const getBoja = (prosjek: number) => {
    if (prosjek > 80) return '#dc2626';
    if (prosjek > 50) return '#d97706';
    if (prosjek > 30) return '#ca8a04';
    return '#16a34a';
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          padding: 1.5rem 2rem;
        }
        .hero-inner { max-width: 1100px; margin: 0 auto; }
        .back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          color: #94a3b8; background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 14px; border-radius: 8px; font-size: 0.85rem;
          cursor: pointer; margin-bottom: 0.75rem; transition: all 0.2s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.12); color: #e2e8f0; }
        .hero h1 { font-size: 1.4rem; font-weight: 700; color: #fff; }
        .hero p { color: #64748b; font-size: 0.85rem; margin-top: 0.25rem; }
        .layout {
          max-width: 1100px; margin: 0 auto;
          padding: 1.5rem 2rem;
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 1.5rem;
        }
        .map-wrap {
          background: #e8f4fd;
          border: 1px solid #bfdbfe;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          aspect-ratio: 1.15;
        }
        .map-svg { width: 100%; height: 100%; display: block; }
        .county-group { cursor: pointer; }
        .county-circle { transition: r 0.2s, filter 0.2s; }
        .county-group:hover .county-circle {
          filter: brightness(1.15) drop-shadow(0 0 3px rgba(0,0,0,0.3));
        }
        .county-text { pointer-events: none; user-select: none; }
        .tooltip {
          position: absolute;
          background: #0f172a;
          color: #fff;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 0.82rem;
          pointer-events: none;
          z-index: 20;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          white-space: nowrap;
          transform: translate(-50%, calc(-100% - 12px));
          border: 1px solid rgba(255,255,255,0.1);
        }
        .tooltip::after {
          content: '';
          position: absolute;
          bottom: -6px; left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-bottom: 0;
          border-top-color: #0f172a;
        }
        .sidebar { display: flex; flex-direction: column; gap: 1rem; }
        .card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.3s;
        }
        .card.active {
          border-color: #3b82f6;
          box-shadow: 0 4px 20px rgba(59,130,246,0.12);
        }
        .card-title {
          font-size: 0.72rem; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.07em;
          margin-bottom: 0.875rem;
        }
        .legenda-item {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 0.5rem; font-size: 0.82rem; color: #475569;
        }
        .legenda-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
        .info-naziv {
          font-size: 0.95rem; font-weight: 700;
          color: #1e293b; margin-bottom: 1rem; line-height: 1.3;
        }
        .info-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .stat-label {
          font-size: 0.68rem; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px;
        }
        .stat-value { font-size: 1.3rem; font-weight: 800; }
        .info-empty {
          color: #94a3b8; font-size: 0.85rem;
          text-align: center; padding: 0.5rem 0; line-height: 1.6;
        }
        .rang-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.4rem 0; border-bottom: 1px solid #f8fafc; font-size: 0.78rem;
          cursor: pointer;
        }
        .rang-item:last-child { border-bottom: none; }
        .rang-item:hover { background: #f8fafc; }
        .spinner {
          width: 24px; height: 24px;
          border: 2px solid #e2e8f0; border-top-color: #3b82f6;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .layout { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="hero">
        <div className="hero-inner">
          <button className="back-btn" onClick={() => router.push('/')}>
            ← Nazad na pretraživanje
          </button>
          <h1>Interaktivna karta čekanja</h1>
          <p>Pređi mišem ili klikni na krug · Veličina i boja = prosječno čekanje</p>
        </div>
      </div>

      <div className="layout">
        <div className="map-wrap">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <svg
                className="map-svg"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                onMouseLeave={() => setOdabranaRegija(null)}
              >
                {/* Pozadina - more */}
                <rect width="100" height="100" fill="#bfdbfe" opacity="0.3"/>

                {/* Jadransko more */}
                <path
                  d="M 8,35 L 18,30 L 20,33 L 22,44 L 24,56
                     L 28,64 L 33,72 L 40,80 L 48,87 L 52,89
                     L 50,95 L 38,90 L 26,82 L 16,70 L 10,58
                     L 7,46 L 8,35 Z"
                  fill="#93c5fd"
                  opacity="0.4"
                />

                {/* Hrvatska - kontinentalni dio */}
                <path
                  d="M 44,13 L 48,13 L 52,13 L 58,13 L 64,12
                     L 68,11 L 72,10 L 76,10 L 80,11 L 84,12
                     L 88,14 L 92,17 L 94,22 L 95,27 L 93,32
                     L 90,36 L 87,39 L 84,40 L 80,39 L 76,37
                     L 72,36 L 68,37 L 64,39 L 60,40 L 56,39
                     L 52,37 L 48,35 L 44,34 L 40,35 L 36,37
                     L 32,38 L 28,37 L 24,35 L 20,33 L 18,30
                     L 17,27 L 18,24 L 20,21 L 23,19 L 27,17
                     L 31,16 L 35,15 L 39,14 L 44,13 Z"
                  fill="#dbeafe"
                  stroke="#93c5fd"
                  strokeWidth="0.5"
                />

                {/* Hrvatska - dalmatinska obala */}
                <path
                  d="M 28,37 L 26,40 L 24,44 L 22,48 L 22,52
                     L 24,56 L 28,64 L 33,72 L 40,80 L 48,87
                     L 52,89 L 56,89 L 60,87 L 63,84 L 64,80
                     L 62,76 L 58,72 L 54,68 L 50,64 L 46,60
                     L 42,56 L 38,52 L 34,48 L 30,44 L 28,40
                     L 28,37 Z"
                  fill="#dbeafe"
                  stroke="#93c5fd"
                  strokeWidth="0.5"
                />

                {/* Slavonija - istočni dio */}
                <path
                  d="M 84,40 L 87,39 L 90,36 L 93,32 L 95,27
                     L 96,30 L 97,35 L 96,40 L 94,44 L 90,46
                     L 86,46 L 84,44 L 84,40 Z"
                  fill="#dbeafe"
                  stroke="#93c5fd"
                  strokeWidth="0.5"
                />

                {/* Jadran natpis */}
                <text
                  x="10" y="62"
                  fill="#3b82f6"
                  fontSize="2.2"
                  fontFamily="sans-serif"
                  opacity="0.6"
                  transform="rotate(-65, 10, 62)"
                >
                  Jadransko more
                </text>

                {/* Županije - krugovi */}
                {ZUPANIJE.map((z, i) => {
                  const stat = getStat(z.naziv);
                  if (!stat) return null;
                  const boja = getBoja(stat.prosjecno);
                  const r = Math.max(3.5, Math.min(7, 3 + stat.prosjecno / 25));

                  return (
                    <g
                      key={i}
                      className="county-group"
                      onMouseEnter={(e) => {
                        setOdabranaRegija(stat);
                        const svg = e.currentTarget.closest('svg') as SVGSVGElement;
                        const rect = svg.getBoundingClientRect();
                        const scaleX = rect.width / 100;
                        const scaleY = rect.height / 100;
                        setHoverPos({
                          x: z.x * scaleX,
                          y: z.y * scaleY,
                        });
                      }}
                      onClick={() => setOdabranaRegija(stat)}
                    >
                      {/* Sjenka */}
                      <circle cx={z.x + 0.3} cy={z.y + 0.3} r={r} fill="rgba(0,0,0,0.12)" />
                      {/* Krug */}
                      <circle
                        className="county-circle"
                        cx={z.x}
                        cy={z.y}
                        r={r}
                        fill={boja}
                        fillOpacity={0.9}
                        stroke="#fff"
                        strokeWidth={0.6}
                      />
                      {/* Broj */}
                      <text
                        className="county-text"
                        x={z.x}
                        y={z.y + 0.4}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#fff"
                        fontSize={r > 5 ? "2.2" : "1.8"}
                        fontWeight="700"
                        fontFamily="sans-serif"
                      >
                        {Math.round(stat.prosjecno)}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip */}
              {odabranaRegija && (
                <div
                  className="tooltip"
                  style={{ left: hoverPos.x, top: hoverPos.y }}
                >
                  <div style={{ fontWeight: '700', marginBottom: '3px' }}>
                    {odabranaRegija.regija__naziv}
                  </div>
                  <div style={{ color: getBoja(odabranaRegija.prosjecno), fontWeight: '700' }}>
                    Prosjek: {Math.round(odabranaRegija.prosjecno)} dana
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>
                    Max: {odabranaRegija.maksimalno} dana
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="sidebar">
          <div className="card">
            <div className="card-title">Prosječno čekanje</div>
            {[
              { boja: '#dc2626', tekst: 'Više od 80 dana' },
              { boja: '#d97706', tekst: '50 – 80 dana' },
              { boja: '#ca8a04', tekst: '30 – 50 dana' },
              { boja: '#16a34a', tekst: 'Manje od 30 dana' },
            ].map((item, i) => (
              <div key={i} className="legenda-item">
                <div className="legenda-dot" style={{ background: item.boja }}></div>
                {item.tekst}
              </div>
            ))}
          </div>

          <div className={`card${odabranaRegija ? ' active' : ''}`}>
            <div className="card-title">Odabrana županija</div>
            {odabranaRegija ? (
              <>
                <div className="info-naziv">{odabranaRegija.regija__naziv}</div>
                <div className="info-stats">
                  <div>
                    <div className="stat-label">Prosjek</div>
                    <div className="stat-value" style={{ color: getBoja(odabranaRegija.prosjecno) }}>
                      {Math.round(odabranaRegija.prosjecno)} dana
                    </div>
                  </div>
                  <div>
                    <div className="stat-label">Maksimum</div>
                    <div className="stat-value" style={{ color: '#dc2626' }}>
                      {odabranaRegija.maksimalno} dana
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="info-empty">
                Pređi mišem<br />na krug
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">Rang po prosjeku</div>
            {statistika.slice(0, 10).map((r, i) => (
              <div
                key={i}
                className="rang-item"
                onClick={() => setOdabranaRegija(r)}
              >
                <span style={{ color: '#475569' }}>
                  {r.regija__naziv
                    .replace(' županija', '')
                    .replace(' i Grad Zagreb', '')}
                </span>
                <span style={{ fontWeight: '700', color: getBoja(r.prosjecno) }}>
                  {Math.round(r.prosjecno)}d
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}