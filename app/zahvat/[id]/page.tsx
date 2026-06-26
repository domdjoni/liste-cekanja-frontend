'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface ListaCekanja {
  id: number;
  zahvat_naziv: string;
  regija_naziv: string;
  ustanova_naziv: string;
  datum_termina: string;
  broj_dana_cekanja: number;
}

interface Zahvat {
  id: number;
  cezih_id: number;
  naziv: string;
}

export default function ZahvatPage() {
  const params = useParams();
  const router = useRouter();
  const [zahvat, setZahvat] = useState<Zahvat | null>(null);
  const [rezultati, setRezultati] = useState<ListaCekanja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id;

    fetch(`http://127.0.0.1:8000/api/zahvati/?search=`)
      .then(res => res.json())
      .then(() => {});

    fetch(`http://127.0.0.1:8000/api/liste-cekanja/?zahvat_id=${id}`)
      .then(res => res.json())
      .then(data => {
        const zapisi = data.results || data;
        zapisi.sort((a: ListaCekanja, b: ListaCekanja) => b.broj_dana_cekanja - a.broj_dana_cekanja);
        setRezultati(zapisi);
        if (zapisi.length > 0) {
          setZahvat({ id: 0, cezih_id: Number(id), naziv: zapisi[0].zahvat_naziv });
        }
        setLoading(false);
      });
  }, [params.id]);

  const bojaDana = (dana: number) => {
    if (dana > 365) return '#e63946';
    if (dana > 180) return '#f4a261';
    if (dana > 90) return '#e9c46a';
    return '#2a9d8f';
  };

  const prosjecno = rezultati.length > 0
    ? Math.round(rezultati.reduce((sum, r) => sum + r.broj_dana_cekanja, 0) / rezultati.length)
    : 0;
  const maksimalno = rezultati.length > 0 ? Math.max(...rezultati.map(r => r.broj_dana_cekanja)) : 0;
  const minimalno = rezultati.length > 0 ? Math.min(...rezultati.map(r => r.broj_dana_cekanja)) : 0;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      Učitavam podatke...
    </div>
  );

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>

      {/* NAZAD */}
      <button
        onClick={() => router.push('/')}
        style={{
          background: 'none',
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          padding: '0.4rem 1rem',
          cursor: 'pointer',
          color: '#666',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}
      >
        ← Nazad na pretraživanje
      </button>

      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', margin: '0 0 0.5rem', color: '#1d3557' }}>
          {zahvat?.naziv}
        </h1>
        <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
          Podaci s HZZO-a · {rezultati.length} županija · Ažurirano danas
        </p>
      </div>

      {/* STATISTIKA */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{ padding: '1.25rem', background: '#fff5f5', border: '1px solid #e63946', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e63946' }}>{maksimalno}</div>
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>dana max.</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#fff8f0', border: '1px solid #f4a261', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f4a261' }}>{prosjecno}</div>
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>dana prosjek</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#f0faf8', border: '1px solid #2a9d8f', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2a9d8f' }}>{minimalno}</div>
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>dana min.</div>
        </div>
      </div>

      {/* LISTA */}
      <h2 style={{ fontSize: '1.1rem', color: '#1d3557', marginBottom: '1rem' }}>
        Čekanje po županijama
      </h2>
      <div style={{ display: 'grid', gap: '0.6rem' }}>
        {rezultati.map((item, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.9rem 1.25rem',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            borderLeft: `4px solid ${bojaDana(item.broj_dana_cekanja)}`,
          }}>
            <div>
              <div style={{ fontWeight: '600', color: '#1d3557', fontSize: '0.95rem' }}>
                {item.regija_naziv}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.15rem' }}>
                {item.datum_termina}
              </div>
            </div>
            <div style={{
              background: bojaDana(item.broj_dana_cekanja),
              color: 'white',
              padding: '0.35rem 0.8rem',
              borderRadius: '20px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
            }}>
              {item.broj_dana_cekanja} dana
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer style={{ marginTop: '3rem', borderTop: '1px solid #dee2e6', paddingTop: '1rem', color: '#999', fontSize: '0.8rem', textAlign: 'center' }}>
        Podaci preuzeti s HZZO liste čekanja (liste.cezih.hr) · Ažuriranje svakih 2 sata
      </footer>

    </main>
  );
}