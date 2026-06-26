'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function Home() {
  const router = useRouter();
  const [statistika, setStatistika] = useState<Statistika | null>(null);
  const [pretraga, setPretraga] = useState('');
  const [zahvati, setZahvati] = useState<Zahvat[]>([]);
  const [prikaziDropdown, setPrikaziDropdown] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/statistika/')
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
      fetch(`http://127.0.0.1:8000/api/zahvati/?search=${pretraga}`)
        .then(res => res.json())
        .then(data => {
          setZahvati(data.results || data);
          setPrikaziDropdown(true);
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [pretraga]);

  const odaberiZahvat = (zahvat: Zahvat) => {
    setPretraga(zahvat.naziv);
    setPrikaziDropdown(false);
    router.push(`/zahvat/${zahvat.cezih_id}`);
  };

  const bojaDana = (dana: number) => {
    if (dana > 365) return '#e63946';
    if (dana > 180) return '#f4a261';
    if (dana > 90) return '#e9c46a';
    return '#2a9d8f';
  };

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.25rem', color: '#1d3557' }}>
          🏥 Liste čekanja u Hrvatskoj
        </h1>
        <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
          {statistika?.ukupno_zapisa.toLocaleString()} zapisa · Podaci s HZZO-a · Ažurirano danas
        </p>
      </div>

      {/* PRETRAŽIVANJE */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <input
          type="text"
          value={pretraga}
          onChange={e => setPretraga(e.target.value)}
          placeholder="Upiši zahvat... npr. MR mozga, UZV abdomena, kardiologija"
          style={{
            width: '100%',
            padding: '1rem 1.25rem',
            fontSize: '1.05rem',
            border: '2px solid #1d3557',
            borderRadius: '10px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* DROPDOWN */}
        {prikaziDropdown && zahvati.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 100,
            maxHeight: '300px',
            overflowY: 'auto',
          }}>
            {zahvati.slice(0, 10).map(zahvat => (
              <div
                key={zahvat.id}
                onClick={() => odaberiZahvat(zahvat)}
                style={{
                  padding: '0.75rem 1.25rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '0.95rem',
                  color: '#1d3557',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}
              >
                {zahvat.naziv}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOP 10 */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: '#e63946', marginBottom: '1rem', fontSize: '1.2rem' }}>
          ⚠️ Top 10 najduljeg čekanja u Hrvatskoj
        </h2>
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          {statistika?.top_10_najdulje_cekanje.map((item, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '2rem 1fr auto',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.9rem 1.25rem',
              background: i === 0 ? '#fff5f5' : '#f8f9fa',
              border: `1px solid ${i === 0 ? '#e63946' : '#dee2e6'}`,
              borderRadius: '8px',
              cursor: 'pointer',
            }}
            onClick={() => {
              const zahvatNaziv = item.zahvat__naziv;
              fetch(`http://127.0.0.1:8000/api/zahvati/?search=${zahvatNaziv}`)
                .then(res => res.json())
                .then(data => {
                  const zahvati = data.results || data;
                  if (zahvati.length > 0) {
                    router.push(`/zahvat/${zahvati[0].cezih_id}`);
                  }
                });
            }}
            >
              <span style={{ fontWeight: 'bold', color: i === 0 ? '#e63946' : '#999' }}>
                {i + 1}.
              </span>
              <div>
                <div style={{ fontWeight: '600', color: '#1d3557', fontSize: '0.95rem' }}>
                  {item.zahvat__naziv}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.15rem' }}>
                  {item.regija__naziv}
                </div>
              </div>
              <div style={{
                background: bojaDana(item.max_dana),
                color: 'white',
                padding: '0.35rem 0.8rem',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
              }}>
                {item.max_dana} dana
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PO REGIJAMA */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: '#1d3557', marginBottom: '1rem', fontSize: '1.2rem' }}>
          📍 Prosjek čekanja po županijama
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {statistika?.cekanje_po_regiji.map((regija, i) => (
            <div key={i} style={{
              padding: '1.25rem',
              background: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              borderLeft: `4px solid ${regija.prosjecno > 80 ? '#e63946' : regija.prosjecno > 40 ? '#f4a261' : '#2a9d8f'}`,
            }}>
              <div style={{ fontWeight: '600', color: '#1d3557', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                {regija.regija__naziv}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: '#666' }}>Prosjek</div>
                  <div style={{ fontWeight: 'bold', color: '#1d3557' }}>
                    {Math.round(regija.prosjecno)} dana
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666' }}>Maksimum</div>
                  <div style={{ fontWeight: 'bold', color: '#e63946' }}>
                    {regija.maksimalno} dana
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #dee2e6',
        paddingTop: '1rem',
        color: '#999',
        fontSize: '0.8rem',
        textAlign: 'center',
      }}>
        Podaci preuzeti s HZZO liste čekanja (liste.cezih.hr) · Ažuriranje svakih 2 sata
      </footer>

    </main>
  );
}