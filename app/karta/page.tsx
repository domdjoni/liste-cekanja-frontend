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

// Mapiranje SVG id-a na naziv regije u bazi
const SVG_ID_MAP: Record<string, string> = {
  'HR20': 'Međimurska županija',
  'HR05': 'Varaždinska županija',
  'HR02': 'Krapinsko-zagorska županija',
  'HR06': 'Koprivničko-križevačka županija',
  'HR07': 'Bjelovarsko-bilogorska županija',
  'HR21': 'Zagrebačka županija i Grad Zagreb',
  'HR01': 'Zagrebačka županija i Grad Zagreb',
  'HR10': 'Virovitičko-podravska županija',
  'HR03': 'Sisačko-moslavačka županija',
  'HR04': 'Karlovačka županija',
  'HR11': 'Požeško-slavonska županija',
  'HR12': 'Brodsko-posavska županija',
  'HR14': 'Osječko-baranjska županija',
  'HR16': 'Vukovarsko-srijemska županija',
  'HR08': 'Primorsko-goranska županija',
  'HR09': 'Ličko-senjska županija',
  'HR13': 'Zadarska županija',
  'HR15': 'Šibensko-kninska županija',
  'HR17': 'Splitsko-dalmatinska županija',
  'HR18': 'Istarska županija',
  'HR19': 'Dubrovačko-neretvanska županija',
};

export default function KartaPage() {
  const router = useRouter();
  const [statistika, setStatistika] = useState<RegijaStatistika[]>([]);
  const [odabranaRegija, setOdabranaRegija] = useState<RegijaStatistika | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    fetch(`${API_URL}/api/statistika/`)
      .then(res => res.json())
      .then(data => {
        setStatistika(data.cekanje_po_regiji || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch('/hrvatska.svg')
      .then(res => res.text())
      .then(text => setSvgContent(text));
  }, []);

  const getStat = (svgId: string): RegijaStatistika | undefined => {
    const naziv = SVG_ID_MAP[svgId];
    if (!naziv) return undefined;
    return statistika.find(r => r.regija__naziv === naziv);
  };

  const getBoja = (prosjek: number) => {
    if (prosjek > 80) return '#dc2626';
    if (prosjek > 50) return '#d97706';
    if (prosjek > 30) return '#ca8a04';
    return '#16a34a';
  };

  // Inject colors into SVG paths
  const getColoredSvg = () => {
    if (!svgContent || statistika.length === 0) return svgContent;

    let colored = svgContent;

    Object.keys(SVG_ID_MAP).forEach(svgId => {
      const stat = getStat(svgId);
      if (!stat) return;

      const boja = getBoja(stat.prosjecno);
      const isHovered = hoveredId === svgId;
      const opacity = isHovered ? '1' : '0.85';
      const strokeWidth = isHovered ? '2' : '0.5';

      // Replace the path's fill color
      const regex = new RegExp(`(id="${svgId}"[^>]*>)`, 'g');
      colored = colored.replace(
        new RegExp(`(<path[^>]*id="${svgId}"[^/]*/?>)`, 'g'),
        (match) => {
          // Remove existing style/fill attributes and add new ones
          let newPath = match
            .replace(/fill="[^"]*"/g, '')
            .replace(/stroke="[^"]*"/g, '')
            .replace(/style="[^"]*"/g, '');

          // Insert before the closing >
          newPath = newPath.replace(
            /\/?>$/,
            ` fill="${boja}" fill-opacity="${opacity}" stroke="white" stroke-width="${strokeWidth}" style="cursor:pointer;transition:fill-opacity 0.2s"/>`
          );
          return newPath;
        }
      );
    });

    return colored;
  };

  const handleSvgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as SVGElement;
    const path = target.closest('path');
    if (!path) return;

    const id = path.getAttribute('id');
    if (!id || !SVG_ID_MAP[id]) return;

    const stat = getStat(id);
    if (stat) setOdabranaRegija(stat);
  };

  const handleSvgMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as SVGElement;
    const path = target.closest('path');
    if (!path) {
      setHoveredId(null);
      return;
    }
    const id = path.getAttribute('id');
    if (id && SVG_ID_MAP[id]) {
      setHoveredId(id);
      const stat = getStat(id);
      if (stat) setOdabranaRegija(stat);
    } else {
      setHoveredId(null);
    }
  };

  const bojaDana = (dana: number) => getBoja(dana);

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
        }
        .map-wrap svg {
          width: 100%;
          height: auto;
          display: block;
        }
        .map-wrap path {
          cursor: pointer;
          transition: fill-opacity 0.2s, stroke-width 0.2s;
        }
        .map-wrap path:hover {
          fill-opacity: 1 !important;
          stroke-width: 2 !important;
          stroke: #1e293b !important;
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
        .legenda-dot { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
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
          padding: 0.4rem 0; border-bottom: 1px solid #f8fafc;
          font-size: 0.78rem; cursor: pointer;
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
          <p>Pređi mišem ili klikni na županiju · Boja = prosječno čekanje</p>
        </div>
      </div>

      <div className="layout">
        <div className="map-wrap">
          {loading || !svgContent ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div
              onClick={handleSvgClick}
              onMouseMove={handleSvgMouseMove}
              onMouseLeave={() => setHoveredId(null)}
              dangerouslySetInnerHTML={{ __html: getColoredSvg() }}
            />
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
                    <div className="stat-value" style={{ color: bojaDana(odabranaRegija.prosjecno) }}>
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
                Pređi mišem<br />na županiju
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
                <span style={{ fontWeight: '700', color: bojaDana(r.prosjecno) }}>
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