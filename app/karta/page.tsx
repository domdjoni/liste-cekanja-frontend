'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface RegijaStatistika {
  regija__naziv: string;
  prosjecno: number;
  maksimalno: number;
  ukupno_zapisa: number;
}

export default function KartaPage() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const [statistika, setStatistika] = useState<RegijaStatistika[]>([]);
  const [odabranaRegija, setOdabranaRegija] = useState<RegijaStatistika | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/statistika/`)
      .then(res => res.json())
      .then(data => {
        setStatistika(data.cekanje_po_regiji || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || mapLoaded) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      setMapLoaded(true);
      initMap();
    };
    document.head.appendChild(script);
  }, [loading]);

  const matchRegija = (naziv: string, statistika: RegijaStatistika[]) => {
    const n = naziv.toLowerCase();
    return statistika.find(r => {
      const rn = r.regija__naziv.toLowerCase();
      const words = rn.split(' ');
      return words.some(w => w.length > 4 && n.includes(w)) || n.includes(words[0]);
    });
  };

  const getBoja = (prosjek: number) => {
    if (prosjek > 80) return '#dc2626';
    if (prosjek > 50) return '#d97706';
    if (prosjek > 30) return '#ca8a04';
    return '#16a34a';
  };

  const initMap = () => {
    if (!mapRef.current || !(window as any).L) return;
    if (mapInstanceRef.current) return;

    const L = (window as any).L;

    const map = L.map(mapRef.current, {
      center: [45.1, 16.4],
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // Light tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap ©CartoDB',
      maxZoom: 10,
    }).addTo(map);

    // Fetch GeoJSON
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson')
      .then(r => r.json())
      .then(geoData => {
        // Filter only Croatia
        const hrvatska = {
          ...geoData,
          features: geoData.features.filter((f: any) =>
            f.properties?.admin === 'Croatia' || f.properties?.iso_a2 === 'HR'
          )
        };

        const stat = (window as any).__statistika || [];

        L.geoJSON(hrvatska, {
          style: (feature: any) => {
            const naziv = feature.properties?.name || feature.properties?.NAME_1 || '';
            const regija = matchRegija(naziv, stat);
            const boja = regija ? getBoja(regija.prosjecno) : '#94a3b8';
            return {
              fillColor: boja,
              fillOpacity: 0.7,
              color: '#fff',
              weight: 2,
            };
          },
          onEachFeature: (feature: any, layer: any) => {
            const naziv = feature.properties?.name || feature.properties?.NAME_1 || '';
            const regija = matchRegija(naziv, stat);

            layer.on({
              mouseover: (e: any) => {
                e.target.setStyle({ fillOpacity: 0.9, weight: 3, color: '#0f172a' });
                if (regija) {
                  (window as any).__setRegija(regija);
                }
              },
              mouseout: (e: any) => {
                e.target.setStyle({ fillOpacity: 0.7, weight: 2, color: '#fff' });
              },
              click: () => {
                if (regija) (window as any).__setRegija(regija);
              },
            });

            const prosjek = regija ? Math.round(regija.prosjecno) + ' dana' : 'N/A';
            layer.bindTooltip(
              `<div style="font-family:sans-serif;padding:4px"><strong>${naziv}</strong><br/>Prosjek: ${prosjek}</div>`,
              { sticky: true }
            );
          },
        }).addTo(map);
      })
      .catch(() => {
        console.log('GeoJSON fetch failed, using fallback');
      });
  };

  useEffect(() => {
    (window as any).__statistika = statistika;
    (window as any).__setRegija = setOdabranaRegija;
  }, [statistika]);

  useEffect(() => {
    if (!loading && mapLoaded && mapRef.current && !mapInstanceRef.current) {
      initMap();
    }
  }, [loading, mapLoaded]);

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
        .hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 0.75rem;
        }
        .back-btn:hover { background: rgba(255,255,255,0.12); color: #e2e8f0; }
        .hero h1 { font-size: 1.4rem; font-weight: 700; color: #fff; }
        .hero p { color: #64748b; font-size: 0.85rem; margin-top: 0.25rem; }

        .layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 1.5rem;
        }

        .map-container {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          height: 540px;
          position: relative;
        }

        .map-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #64748b;
          font-size: 0.9rem;
          gap: 0.5rem;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        #map { width: 100%; height: 100%; }

        .sidebar { display: flex; flex-direction: column; gap: 1rem; }

        .legenda {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
        }
        .legenda h3 {
          font-size: 0.78rem;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .legenda-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          font-size: 0.82rem;
          color: #475569;
        }
        .legenda-dot {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .info-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.3s;
        }
        .info-card.active {
          border-color: #3b82f6;
          box-shadow: 0 4px 20px rgba(59,130,246,0.12);
        }
        .info-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.5rem;
        }
        .info-naziv {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        .info-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .info-stat-label {
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 3px;
        }
        .info-stat-value {
          font-size: 1.3rem;
          font-weight: 800;
        }
        .info-empty {
          color: #94a3b8;
          font-size: 0.85rem;
          text-align: center;
          padding: 0.75rem 0;
          line-height: 1.5;
        }

        .rang-lista { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; }
        .rang-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.45rem 0;
          border-bottom: 1px solid #f8fafc;
          font-size: 0.8rem;
        }
        .rang-item:last-child { border-bottom: none; }
        .rang-naziv { color: #475569; }
        .rang-dana { font-weight: 700; }

        @media (max-width: 768px) {
          .layout { grid-template-columns: 1fr; }
          .map-container { height: 350px; }
        }
      `}</style>

      <div className="hero">
        <div className="hero-inner">
          <div>
            <button className="back-btn" onClick={() => router.push('/')}>
              ← Nazad na pretraživanje
            </button>
            <h1>Interaktivna karta čekanja</h1>
            <p>Pređi mišem ili klikni na županiju · Boja = prosječno čekanje</p>
          </div>
        </div>
      </div>

      <div className="layout">
        <div className="map-container">
          {loading ? (
            <div className="map-loading">
              <div className="spinner"></div>
              Učitavam podatke...
            </div>
          ) : (
            <div id="map" ref={mapRef}></div>
          )}
        </div>

        <div className="sidebar">
          <div className="legenda">
            <h3>Prosječno čekanje</h3>
            <div className="legenda-item">
              <div className="legenda-dot" style={{ background: '#dc2626' }}></div>
              Više od 80 dana
            </div>
            <div className="legenda-item">
              <div className="legenda-dot" style={{ background: '#d97706' }}></div>
              50 – 80 dana
            </div>
            <div className="legenda-item">
              <div className="legenda-dot" style={{ background: '#ca8a04' }}></div>
              30 – 50 dana
            </div>
            <div className="legenda-item">
              <div className="legenda-dot" style={{ background: '#16a34a' }}></div>
              Manje od 30 dana
            </div>
          </div>

          <div className={`info-card${odabranaRegija ? ' active' : ''}`}>
            <div className="info-label">Odabrana županija</div>
            {odabranaRegija ? (
              <>
                <div className="info-naziv">{odabranaRegija.regija__naziv}</div>
                <div className="info-stats">
                  <div>
                    <div className="info-stat-label">Prosjek</div>
                    <div className="info-stat-value" style={{ color: bojaDana(odabranaRegija.prosjecno) }}>
                      {Math.round(odabranaRegija.prosjecno)} dana
                    </div>
                  </div>
                  <div>
                    <div className="info-stat-label">Maksimum</div>
                    <div className="info-stat-value" style={{ color: '#dc2626' }}>
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

          <div className="rang-lista">
            <div className="legenda">
              <h3 style={{ marginBottom: '0.75rem' }}>Rang po prosjeku</h3>
              {statistika.slice(0, 10).map((r, i) => (
                <div key={i} className="rang-item">
                  <span className="rang-naziv">
                    {r.regija__naziv
                      .replace(' županija', '')
                      .replace(' i Grad Zagreb', ' + Zagreb')}
                  </span>
                  <span className="rang-dana" style={{ color: bojaDana(r.prosjecno) }}>
                    {Math.round(r.prosjecno)}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}