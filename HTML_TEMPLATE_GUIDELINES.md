# Panduan & Pedoman Pembuatan Custom HTML + CSS Template (User & Admin Guidelines)

Dokumen ini berisi panduan lengkap, aturan teknis, dan kamus tag dinamis untuk membuat template portofolio (**Bisnis / Agensi** maupun **Personal / Developer**) yang kompatibel dengan sistem Porto-Dev.

---

## 1. Konsep & Alur Kerja Template

1. **Upload / Input Mandiri:** Admin atau Creator dapat mengunggah 1 file HTML utuh (yang sudah memuat tag `<style>` di dalamnya) atau menginputkan kode HTML dan CSS secara terpisah melalui **Admin Template Studio**.
2. **Auto CSS Extraction:** Saat file `.html` diunggah, sistem secara otomatis mengekstrak blok `<style>...</style>` menjadi custom CSS mandiri.
3. **Dynamic Data Replacement:** Seluruh placeholder bertanda `{{...}}` akan di-compile otomatis dengan data profil asli dari user/bisnis.
4. **Dynamic Theme Engine:** Seluruh warna dikontrol secara real-time melalui CSS Variables (`var(--primary)`, `var(--bg)`, dll). Ketika user mengganti warna di **Theme Studio**, tampilan portofolio langsung berganti seketika (zero-flicker) tanpa perlu reload.

---

## 2. Aturan Wajib Styling (CSS Variables)

Agar tema warna portofolio dapat diubah-ubah oleh pengguna di Theme Studio, **WAJIB** menggunakan CSS Variables bawaan untuk seluruh elemen warna.

### Daftar CSS Variables:

| CSS Variable | Default Value | Deskripsi / Penggunaan |
| :--- | :--- | :--- |
| `var(--primary)` | `#8B6CF6` | Warna aksen utama (Tombol CTA, badge aktif, border highlight, gradient teks) |
| `var(--secondary)` | `#4697F5` | Warna aksen pendukung (Sub-badge, link hover, aksen kedua) |
| `var(--bg)` | `#0F172A` | Background utama halaman (`body`) |
| `var(--surface)` | `#1E293B` | Warna kontainer kartu (Card, navbar, modal container) |
| `var(--text)` | `#F8FAFC` | Warna teks utama (Heading h1-h4, nama profil, judul) |
| `var(--text-secondary)` | `#94A3B8` | Warna teks sekunder (Paragraf, deskripsi, caption, tanggal) |
| `var(--radius)` | `12px` | Kelengkungan sudut elemen (`border-radius` pada tombol & kartu) |

### Contoh Penggunaan CSS:
```css
/* ✅ BENAR: Menggunakan CSS Variables (otomatis reaktif saat tema diganti) */
.hero-btn {
  background-color: var(--primary, #8B6CF6);
  color: #ffffff;
  border-radius: var(--radius, 12px);
}
.service-card {
  background-color: var(--surface, #1E293B);
  color: var(--text, #F8FAFC);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius, 12px);
}
.service-card p {
  color: var(--text-secondary, #94A3B8);
}

/* ❌ SALAH: Hardcode warna HEX langsung (warna tidak akan berubah saat tema diganti) */
.hero-btn {
  background-color: #8B6CF6;
}
```

---

## 3. Kamus Tag Dinamis (Data Placeholders)

Gunakan tag handlebar `{{...}}` berikut agar data profil terisi otomatis:

### A. Data Profil Bisnis (Company / Agency / Studio)
* `{{business.businessName}}` atau `{{businessName}}` / `{{name}}` : Nama resmi perusahaan atau bisnis.
* `{{business.logo}}` atau `{{logo}}` : URL logo bisnis (`<img src="{{business.logo}}" alt="{{business.businessName}}" />`).
* `{{business.description}}` atau `{{description}}` : Deskripsi bisnis, value proposition, atau visi misi.
* `{{headline}}` : Tagline atau slogan utama.
* `{{location}}` : Alamat kantor atau kota operasional.
* `{{email}}` atau `{{contactEmail}}` : Email resmi untuk kontak atau sales inquiry.
* `{{phone}}` atau `{{phoneNumber}}` : Nomor telepon / WhatsApp kantor.

### B. Data Profil Personal (Developer / Creator / Freelancer)
* `{{fullName}}` : Nama lengkap pemilik portofolio.
* `{{headline}}` : Profesi / title (contoh: *Senior Full Stack Engineer*).
* `{{bio}}` : Biografi singkat profil personal.
* `{{avatar}}` : Foto profil personal.
* `{{cvUrl}}` : URL unduhan CV / resume.

---

## 4. Loop Data Berulang (Array Loops)

Gunakan format `{{#each namaArray}} ... {{/each}}` untuk menampilkan daftar data secara otomatis:

### 1. Layanan Bisnis (Services Loop)
```html
<div class="services-grid">
  {{#each services}}
  <div class="service-card">
    <h3>{{title}}</h3>
    <p>{{description}}</p>
    <span class="price-tag">{{price}}</span>
  </div>
  {{/each}}
</div>
```
* `{{title}}` : Nama layanan (contoh: *Web & Mobile App Development*).
* `{{description}}` : Rincian cakupan layanan.
* `{{price}}` : Biaya layanan (contoh: *Starting at $500* atau *Hubungi Kami*).

### 2. Portofolio & Proyek (Projects Loop)
```html
<div class="projects-grid">
  {{#each projects}}
  <div class="project-card">
    <img src="{{thumbnail}}" alt="{{title}}" class="project-thumb" />
    <div class="project-body">
      <span class="project-role">{{role}}</span>
      <h3>{{title}}</h3>
      <p>{{description}}</p>
      <div class="project-links">
        <a href="{{projectUrl}}" target="_blank">Live Demo</a>
        <a href="{{githubUrl}}" target="_blank">Source Code</a>
      </div>
    </div>
  </div>
  {{/each}}
</div>
```
* `{{title}}` : Judul proyek / klien.
* `{{thumbnail}}` : URL gambar thumbnail proyek.
* `{{description}}` : Ringkasan masalah, solusi, atau hasil proyek.
* `{{role}}` : Peran atau bidang kerja (*Frontend, UI/UX, Cloud*).
* `{{projectUrl}}` : Tautan live web/aplikasi.
* `{{githubUrl}}` : Tautan repositori GitHub (jika ada).

### 3. Pengalaman & Milestone (Experiences Loop)
```html
<div class="timeline">
  {{#each experiences}}
  <div class="timeline-item">
    <h4>{{position}} - {{company}}</h4>
    <span class="timeline-date">{{startDate}} &mdash; {{endDate}}</span>
    <p>{{description}}</p>
  </div>
  {{/each}}
</div>
```
* `{{company}}` : Nama perusahaan, klien, atau mitra.
* `{{position}}` : Posisi atau peran kolaborasi.
* `{{startDate}}` : Tahun / bulan mulai.
* `{{endDate}}` : Tahun / bulan selesai (atau *Present* jika masih berjalan).
* `{{description}}` : Highlight tanggung jawab atau pencapaian.

### 4. Keahlian & Teknologi (Skills Loop)
```html
<div class="skills-badges">
  {{#each skills}}
  <span class="badge">{{this}}</span>
  {{/each}}
</div>
```
* `{{this}}` : Nama keahlian atau teknologi (contoh: *React*, *Node.js*, *AWS*).

---

## 5. Panduan Praktik Terbaik (Do's & Don'ts)

### ✅ Lakukan (DO):
1. **Responsive First:** Gunakan CSS Grid atau Flexbox dengan media query (`@media (max-width: 768px)`) agar tampilan optimal di Desktop, Tablet, dan Mobile.
2. **Fallback Value:** Selalu sertakan nilai fallback di CSS variable, contoh: `background: var(--surface, #1E293B)`.
3. **Semantic HTML5:** Gunakan elemen semantik seperti `<header>`, `<nav>`, `<main>`, `<section>`, dan `<footer>`.
4. **Google Fonts:** Jika memakai font khusus, sisipkan tag `<link>` font di dalam `<head>`.

### ❌ Hindari (DON'T):
1. **Jangan Hardcode Warna:** Menghindari kode warna hex permanen agar tema tetap bisa disesuaikan pengguna.
2. **Jangan Menggunakan Script Berbahaya:** Script JS eksternal yang memanipulasi DOM induk atau navigasi luar akan di-block oleh sandbox iframe.
3. **Jangan Membuat Section Statis Kosong:** Selalu gunakan loop `{{#each ...}}` agar konten selalu terisi otomatis saat pengguna memasukkan data mereka.

---

## 6. Starter Template HTML Siap Pakai

Simpan template ini sebagai file `.html` lalu upload di **Admin Template Studio**:

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{business.businessName}}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #0F172A);
      color: var(--text, #F8FAFC);
      line-height: 1.6;
    }
    a { text-decoration: none; color: inherit; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    
    /* Navbar */
    .navbar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.25rem 0; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; font-weight: 800; font-size: 1.15rem; }
    .brand img { width: 38px; height: 38px; border-radius: var(--radius, 12px); object-fit: cover; }
    .btn-contact {
      background: var(--primary, #8B6CF6); color: #fff;
      padding: 0.6rem 1.25rem; border-radius: var(--radius, 12px); font-weight: 600; font-size: 0.9rem;
    }
    
    /* Hero */
    .hero { padding: 5rem 0 3.5rem; text-align: center; }
    .badge {
      display: inline-block; padding: 0.35rem 0.85rem;
      background: var(--surface, #1E293B); color: var(--secondary, #4697F5);
      border-radius: 999px; font-size: 0.8rem; font-weight: 700; margin-bottom: 1rem;
    }
    .hero h1 { font-size: 2.75rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.2; }
    .hero p { max-width: 650px; margin: 0 auto 2rem; color: var(--text-secondary, #94A3B8); font-size: 1.1rem; }

    /* Services & Projects */
    .section { padding: 3.5rem 0; }
    .section-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
    .section-desc { color: var(--text-secondary, #94A3B8); margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .card {
      background: var(--surface, #1E293B); border: 1px solid rgba(255,255,255,0.06);
      border-radius: var(--radius, 12px); padding: 1.75rem; transition: transform 0.2s;
    }
    .card:hover { transform: translateY(-4px); }
    .card h3 { font-size: 1.2rem; margin-bottom: 0.5rem; }
    .card p { color: var(--text-secondary, #94A3B8); font-size: 0.95rem; margin-bottom: 1rem; }
    .price { font-weight: 700; color: var(--secondary, #4697F5); }

    /* Footer */
    footer {
      border-top: 1px solid rgba(255,255,255,0.08); padding: 2.5rem 0;
      text-align: center; color: var(--text-secondary, #94A3B8);
    }
  </style>
</head>
<body>
  <header class="container">
    <nav class="navbar">
      <div class="brand">
        <img src="{{business.logo}}" alt="{{business.businessName}}" />
        <span>{{business.businessName}}</span>
      </div>
      <a href="mailto:{{email}}" class="btn-contact">Hubungi Kami</a>
    </nav>
  </header>

  <section class="container hero">
    <div class="badge">{{headline}}</div>
    <h1>Solusi Terpercaya untuk Skala Bisnis Anda</h1>
    <p>{{business.description}}</p>
    <a href="mailto:{{email}}" class="btn-contact">Mulai Sekarang</a>
  </section>

  <section class="container section">
    <h2 class="section-title">Layanan Kami</h2>
    <p class="section-desc">Daftar penawaran dan kapabilitas bisnis</p>
    <div class="grid">
      {{#each services}}
      <div class="card">
        <h3>{{title}}</h3>
        <p>{{description}}</p>
        <span class="price">{{price}}</span>
      </div>
      {{/each}}
    </div>
  </section>

  <section class="container section">
    <h2 class="section-title">Portofolio & Studi Kasus</h2>
    <p class="section-desc">Karya nyata dan hasil pencapaian</p>
    <div class="grid">
      {{#each projects}}
      <div class="card">
        <img src="{{thumbnail}}" alt="{{title}}" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:1rem;" />
        <h3>{{title}}</h3>
        <p>{{description}}</p>
        <a href="{{projectUrl}}" target="_blank" style="color: var(--primary); font-weight:600;">Lihat Detail &rarr;</a>
      </div>
      {{/each}}
    </div>
  </section>

  <footer>
    <div class="container">
      <p>&copy; 2026 {{business.businessName}} &bull; {{location}}</p>
      <p style="margin-top:0.5rem;">Kontak: {{email}} | {{phone}}</p>
    </div>
  </footer>
</body>
</html>
```
