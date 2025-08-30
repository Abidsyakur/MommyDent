"use client";

import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// ----------------------
// TYPES
// ----------------------
interface ToothInfo {
  id: number;
  name: string;
  blurb: string;
}

interface ToothProps {
  id: number;
  position: [number, number, number];
  isActive: boolean;
  onClick: (id: number) => void;
}

interface TeethRowProps {
  y?: number;
  mirror?: 1 | -1;
  activeId: number | null;
  onSelect: (id: number) => void;
}

interface TeethSceneProps {
  activeId: number | null;
  onSelect: (id: number) => void;
}

interface InfoPanelProps {
  activeTooth: ToothInfo | null;
  onClear: () => void;
}

// ----------------------
// DATA: Info per gigi
// ----------------------
const toothInfos: ToothInfo[] = Array.from({ length: 32 }, (_, i) => {
  const id = i + 1;
  const names = [
    "Molar kanan atas (3rd)",
    "Molar kanan atas (2nd)",
    "Molar kanan atas (1st)",
    "Premolar kanan atas (2nd)",
    "Premolar kanan atas (1st)",
    "Caninus kanan atas",
    "Insisivus lateral kanan atas",
    "Insisivus sentral kanan atas",
    "Insisivus sentral kiri atas",
    "Insisivus lateral kiri atas",
    "Caninus kiri atas",
    "Premolar kiri atas (1st)",
    "Premolar kiri atas (2nd)",
    "Molar kiri atas (1st)",
    "Molar kiri atas (2nd)",
    "Molar kiri atas (3rd)",
    "Molar kanan bawah (3rd)",
    "Molar kanan bawah (2nd)",
    "Molar kanan bawah (1st)",
    "Premolar kanan bawah (2nd)",
    "Premolar kanan bawah (1st)",
    "Caninus kanan bawah",
    "Insisivus lateral kanan bawah",
    "Insisivus sentral kanan bawah",
    "Insisivus sentral kiri bawah",
    "Insisivus lateral kiri bawah",
    "Caninus kiri bawah",
    "Premolar kiri bawah (1st)",
    "Premolar kiri bawah (2nd)",
    "Molar kiri bawah (1st)",
    "Molar kiri bawah (2nd)",
    "Molar kiri bawah (3rd)",
  ];

  const tips = [
    "Perubahan hormon saat hamil dapat meningkatkan risiko gingivitis. Sikat gigi lembut 2x sehari dan gunakan benang gigi.",
    "Mual muntah dapat mengikis email. Kumur air + 1 sdt baking soda setelah muntah, tunggu 30 menit baru sikat.",
    "Ngidam manis? Batasi frekuensi camilan bergula dan minum air putih setelahnya.",
    "Kontrol karang gigi (scaling) umumnya aman pada trimester 2. Konsultasikan jadwal dengan dokter gigi.",
    "Gunakan pasta gigi berfluor. Jika gusi mudah berdarah, jangan hentikan sikat gigi — fokuskan teknik lembut.",
    "X-ray gigi hanya bila perlu, dengan pelindung timah dan sesuai saran dokter.",
    "Obat bius lokal seperti lidokain umumnya dapat dipertimbangkan; selalu infokan status kehamilan.",
    "Gusi bengkak? Kompres dingin di pipi dapat membantu sementara, namun periksa jika nyeri berlanjut.",
  ];

  return {
    id,
    name: names[i] ?? `Gigi ${id}`,
    blurb: tips[i % tips.length],
  } as ToothInfo;
});

// ----------------------
// 3D Tooth component
// ----------------------
function Tooth({ id, position, isActive, onClick }: ToothProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState<boolean>(false);

  useFrame(() => {
    if (!ref.current) return;
    // animasi halus saat hover/aktif
    const targetScale = isActive || hovered ? 1.12 : 1.0;
    const s = ref.current.scale;
    s.x += (targetScale - s.x) * 0.2;
    s.y += (targetScale - s.y) * 0.2;
    s.z += (targetScale - s.z) * 0.2;
  });

  return (
    <group position={position}>
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick(id);
        }}
      >
        {/* Bentuk sederhana: silinder menyerupai mahkota gigi */}
        <cylinderGeometry args={[0.22, 0.28, 0.6, 24]} />
        <meshStandardMaterial metalness={0.05} roughness={0.5} color={isActive ? "#87CEFA" : hovered ? "#e7f0ff" : "#ffffff"} />
      </mesh>
    </group>
  );
}

// ----------------------
// Layout gigi: 16 atas, 16 bawah
// ----------------------
function TeethRow({ y = 0.5, mirror = 1, activeId, onSelect }: TeethRowProps) {
  const positions = useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 16; i++) {
      const t = (i - 7.5) / 7.5; // -1..1
      const x = t * 3.6; // lebar rahang
      const z = -Math.pow(t, 2) * 1.6 * mirror; // sedikit lengkung
      arr.push([x, y, z]);
    }
    return arr;
  }, [y, mirror]);

  return (
    <group rotation={[mirror === 1 ? -0.1 : 0.1, 0, 0] as unknown as THREE.Euler}>
      {positions.map((p, i) => {
        const id = mirror === 1 ? i + 1 : i + 17; // 1..16 atas, 17..32 bawah
        return (
          <Tooth key={id} id={id} position={p} isActive={activeId === id} onClick={onSelect} />
        );
      })}
    </group>
  );
}

// ----------------------
// Scene 3D
// ----------------------
function TeethScene({ activeId, onSelect }: TeethSceneProps) {
  return (
    <Canvas shadows camera={{ position: [0, 2.2, 6], fov: 45 }} className="rounded-2xl">
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

      <group position={[0, 0, 0]}>
        <TeethRow y={0.7} mirror={1} activeId={activeId} onSelect={onSelect} />
        <TeethRow y={-0.7} mirror={-1} activeId={activeId} onSelect={onSelect} />
      </group>

      <ContactShadows position={[0, -1.2, 0]} opacity={0.35} scale={10} blur={2.5} far={2} />
      <Environment preset="city" />
      <OrbitControls enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={(3 * Math.PI) / 4} />
    </Canvas>
  );
}

// ----------------------
// UI Komponen
// ----------------------
function InfoPanel({ activeTooth, onClear }: InfoPanelProps) {
  return (
    <AnimatePresence>
      {activeTooth && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: "spring", damping: 20, stiffness: 220 }}
          className="fixed bottom-6 right-6 max-w-md"
        >
          <Card className="shadow-xl border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">{activeTooth.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{activeTooth.blurb}</p>
              <div className="text-xs text-muted-foreground">
                Catatan: Informasi ini bersifat edukatif, bukan pengganti diagnosis. Selalu konsultasikan dengan dokter gigi Anda.
              </div>
              <div className="flex gap-2">
                <Button onClick={onClear} className="rounded-2xl">Tutup</Button>
                <Button variant="secondary" className="rounded-2xl">Buat Janji</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ----------------------
// Komponen Utama (Landing Page)
// ----------------------
export default function DentalPregnancyLanding() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const activeTooth = activeId ? toothInfos.find((t) => t.id === activeId) ?? null : null;
  const [query, setQuery] = useState<string>("");

  const filtered = useMemo<ToothInfo[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return toothInfos.slice(0, 8);
    return toothInfos.filter((t) => (t.name + " " + t.blurb).toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-sky-50">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-sky-500/90 shadow-lg" />
          <span className="font-semibold text-lg">Mommydents</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm text-muted-foreground">
          <a href="#fitur" className="hover:text-sky-700">Fitur</a>
          <a href="#3d" className="hover:text-sky-700">Model 3D</a>
          <a href="#faq" className="hover:text-sky-700">FAQ</a>
        </nav>
        <Button className="rounded-2xl">Buat Janji</Button>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center">
        {/* HERO */}
        <section className="py-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Kesehatan Gigi Ibu Hamil, <span className="text-sky-600">Interaktif</span> & Informatif
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Jelajahi model gigi 3D: ketuk gigi untuk melihat tips perawatan selama kehamilan. Konten edukatif yang ramah ibu,
            dirancang untuk mencegah gingivitis, mengelola mual, dan menjaga senyum sehat.
          </p>
          <div className="mt-6 flex gap-3">
            <Button className="rounded-2xl" onClick={() => document.getElementById("3d")?.scrollIntoView({ behavior: "smooth" })}>Coba Demo 3D</Button>
            <Button variant="secondary" className="rounded-2xl">Konsultasi Online</Button>
          </div>

          {/* Search edukasi singkat */}
          <Card className="mt-8 rounded-2xl border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari: gingivitis, mual, x-ray, scaling..." className="rounded-2xl" />
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {filtered.map((t) => (
                  <button key={t.id} onClick={() => setActiveId(t.id)} className="text-left p-3 bg-white rounded-2xl shadow hover:shadow-md transition">
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{t.blurb}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3D VIEW */}
        <section id="3d" className="h-[520px] md:h-[600px] rounded-2xl overflow-hidden shadow-lg bg-white">
          <TeethScene activeId={activeId} onSelect={setActiveId} />
        </section>
      </main>

      {/* FITUR */}
      <section id="fitur" className="max-w-6xl mx-auto px-6 mt-16 grid md:grid-cols-3 gap-6">
        {[{
          title: "Model 3D Interaktif",
          desc: "Klik setiap gigi untuk mendapatkan tips perawatan spesifik selama kehamilan.",
        }, {
          title: "Konten Terverifikasi",
          desc: "Ringkasan edukatif yang aman dan mudah dipahami. Bukan pengganti konsultasi medis.",
        }, {
          title: "Siap Dikembangkan",
          desc: "Dapat dihubungkan ke CMS, booking, dan chat klinik untuk alur janji temu lengkap.",
        }].map((f, i) => (
          <Card key={i} className="rounded-2xl border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{f.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{f.desc}</CardContent>
          </Card>
        ))}
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-6xl mx-auto px-6 mt-16 mb-24">
        <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[{
            q: "Apakah aman scaling saat hamil?",
            a: "Secara umum, pembersihan karang gigi dapat dipertimbangkan terutama pada trimester kedua. Selalu konsultasikan dengan dokter gigi Anda.",
          }, {
            q: "Bagaimana jika sering mual?",
            a: "Bilas mulut dengan larutan air + sedikit baking soda, hindari sikat segera setelah muntah, dan jaga hidrasi.",
          }, {
            q: "Perlukah x-ray?",
            a: "Hanya bila dibutuhkan. Gunakan pelindung khusus dan ikuti saran dokter gigi.",
          }, {
            q: "Apakah anestesi lokal aman?",
            a: "Beberapa anestesi lokal dapat dipertimbangkan. Beritahu dokter bahwa Anda sedang hamil.",
          }].map((item, idx) => (
            <Card key={idx} className="rounded-2xl border-0 shadow">
              <CardHeader>
                <CardTitle className="text-base">{item.q}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.a}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <InfoPanel activeTooth={activeTooth} onClear={() => setActiveId(null)} />

      <footer className="text-center text-xs text-muted-foreground pb-10">
        © {new Date().getFullYear()} MommyDent. Informasi bersifat edukatif dan tidak menggantikan konsultasi langsung dengan dokter gigi.
      </footer>
    </div>
  );
}

// ----------------------
// Catatan Teknis & Integrasi (komentar untuk dev):
// - File ini TypeScript-ready (.tsx) untuk Next.js App Router. Pastikan berada di `components/DentalPregnancyLanding.tsx`.
// - Gunakan di `app/page.tsx` dengan: 
//      "use client"; 
//      import DentalPregnancyLanding from "@/components/DentalPregnancyLanding";
//      export default function Page(){ return <DentalPregnancyLanding/> }
// - Ganti geometry Tooth dengan GLTF asli per gigi + useGLTF untuk klik presisi.
// - Pertimbangkan kompresi Draco/KTX2 untuk GLTF agar loading cepat.
// - Tambahkan plugin Tailwind line-clamp bila ingin memotong teks deskripsi.
