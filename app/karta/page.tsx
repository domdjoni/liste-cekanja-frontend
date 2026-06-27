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

// Koordinate centara županija
const ZUPANIJE_KOORDINATE: Record<string, [number, number]> = {
  'Zagrebačka županija i Grad Zagreb': [45.814, 15.978],
  'Krapinsko-zagorska županija': [46.16, 15.87],
  'Sisačko-moslavačka županija': [45.46, 16.37],
  'Karlovačka županija': [45.49, 15.55],
  'Varaždinska županija': [46.30, 16.34],
  'Koprivničko-križevačka županija': [46.16, 16.83],
  'Bjelovarsko-bilogorska županija': [45.90, 17.25],
  'Primorsko-goranska županija': [45.34, 14.44],
  'Ličko-senjska županija': [44.56, 15.37],
  'Virovitičko-podravska županija': [45.83, 17.38],
  'Požeško-slavonska županija': [45.34, 17.69],
  'Brodsko-posavska županija': [45.16, 17.52],
  'Osječko-baranjska županija': [45.55, 18.32],
  'Vukovarsko-srijemska županija': [45.35, 18.99],
  'Šibensko-kninska županija': [43.73, 16.00],
  'Zadarska županija': [44.12, 15.22],
  'Splitsko-dalmatinska županija': [43.51, 16.45],
  'Istarska županija': [45.13, 13.90],
  'Dubrovačko-neretvanska županija': [43.01, 17.45],
  'Međimurska županija': [46.48, 16.42],
};

export default function KartaPage() {
  const router = useRouter();
  const [statistika, setStatistika] = useState<RegijaStatistika[]>([]);
  const [odabranaRegija, setOdabranaRegija] = useState<RegijaStatistika | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/statistika/`)
      .then(res => res.json())
      .then(data => {
        setStatistika(data.cekanje_po_regiji || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => initMap();
    document.head.appendChild(script);
  }, [loading, statistika]);

  const getBoja = (prosjek: number) => {
    if (prosjek > 80) return '#dc2626';
    if (prosjek > 50) return '#d97706';
    if (prosjek > 30) return '#ca8a04';
    return '#16a34a';
  };

  const initMap = () => {
    const L = (window as any).L;
    if (!L || (document.getElementById('map') as any)?._leaflet_id) return;

    const map = L.map('map', {
      center: [44.8, 16.5],
      zoom: 7,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap ©CartoDB',
      maxZoom: 12,
    }).addTo(map);

    statistika.forEach(regija => {
      const coords = ZUPANIJE_KOORDINATE[regija.regija__naziv];
      if (!coords) return;

      const boja = getBoja(regija.prosjecno);
      const radius = 20 + (regija.prosjecno / 5);

      const circle = L.circleMarker(coords, {
        radius: Math.min(radius, 45),
        fillColor: boja,
        fillOpacity: 0.85,
        color: '#fff',
        weight: 2,
      });

      circle.bindTooltip(`
        <div style="font-family:sans-serif;padding:6px;min-width:160px">
          <strong style="font-size:0.9rem">${regija.regija__naziv}</strong><br/>
          <span style="color:${boja};font-weight:700;font-size:1rem">${Math.round(regija.prosjecno)} dana</span> prosjek<br/>
          <span style="color:#64748b;font-size:0.8rem">Max: ${regija.maksimalno} dana</span>
        </div>
      `, { sticky: true });

      circle.on('click', () => setOdabranaRegija(regija));
      circle.on('mouseover', () => setOdabranaRegija(regija));

      circle.addTo(map);
    });
  };

  const bojaDana = (dana: number) => {
    if (dana > 80) return '#dc2626';
    if (dana > 50) return '#d97706';
    if (dana > 30) return '#ca8a04';
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
          cursor: pointer; transition: all 0.2s; margin-bottom: 0.75rem;
        }
        .back-btn:hover { background: rgba(255,255,255,0.12); color: #e2e8f0; }
        .hero h1 { font-size: 1.4rem; font-weight: 700; color: #fff; }
        .hero p { color: #64748b; font-size: 0.85rem; margin-top: 0.25rem; }
        .layout {
          max-width: 1100px; margin: 0 auto; padding: 1.5rem 2rem;
          display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem;
        }
        .map-container {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 12px; overflow: hidden; height: 540px;
        }
        #map { width: 100%; height: 100%; }
        .sidebar { display: flex; flex-direction: column; gap: 1rem; }
        .card {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 12px; padding: 1.25rem;
        }
        .card.active { border-color: #3b82f6; box-shadow: 0 4px 20px rgba(59,130,246,0.12); }
        .card-title {
          font-size: 0.75rem; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.875rem;
        }
        .legenda-item {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 0.5rem; font-size: 0.82rem; color: #475569;
        }
        .legenda-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
        .info-naziv { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; line-height: 1.3; }
        .info-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .stat-label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
        .stat-value { font-size: 1.3rem; font-weight: 800; }
        .info-empty { color: #94a3b8; font-size: 0.85rem; text-align: center; padding: 0.75rem 0; line-height: 1.5; }
        .rang-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.45rem 0; border-bottom: 1px solid #f8fafc; font-size: 0.8rem;
        }
        .rang-item:last-child { border-bottom: none; }
        .spinner {
          width: 20px; height: 20px; border: 2px solid #e2e8f0;
          border-top-color: #3b82f6; border-radius: 50%;
          animation: spin 0.8s linear infinite; margin: auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .layout { grid-template-columns: 1fr; }
          .map-container { height: 380px; }
        }
      `}</style>

      <div className="hero">
        <div className="hero-inner">
          <button className="back-btn" onClick={() => router.push('/')}>← Nazad</button>
          <h1>Interaktivna karta čekanja</h1>
          <p>Klikni ili pređi mišem na krug · Veličina i boja = prosječno čekanje</p>
        </div>
      </div>

      <div className="layout">
        <div className="map-container">
          {loading ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div id="map"></div>
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
              <div className="info-empty">Klikni na krug<br />za detalje</div>
            )}
          </div>

          <div className="card">
            <div className="card-title">Rang po prosjeku</div>
            {statistika.slice(0, 10).map((r, i) => (
              <div key={i} className="rang-item">
                <span style={{ color: '#475569', fontSize: '0.78rem' }}>
                  {r.regija__naziv.replace(' županija', '').replace(' i Grad Zagreb', '')}
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