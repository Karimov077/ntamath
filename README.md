# NTAMath - Telegram WebApp Test Topshirish Platformasi

Vite + React + TypeScript + Tailwind CSS asosida yaratilgan, Telegram Mini App va Vercel platformasiga to'liq moslashgan zamonaviy test topshirish tizimi.

---

## 🚀 Asosiy imkoniyatlar

1. **Telegram WebApp to'liq integratsiyasi**:
   - `Telegram.WebApp.ready()`, `expand()`, `enableClosingConfirmation()`.
   - Telegram yorug'/qorong'i mavzusi (`colorScheme`) bilan avtomatik moslashuv.
   - Haptic Feedback (vibratsiya bilan aloqa) va mahalliy BackButton qo'llab-quvvatlash.
   - `X-Frame-Options: ALLOWALL` konfiguratsiyasi (`vercel.json` da Telegram WebApp iframe uchun).

2. **Telegram Bot API orqali avtomatik hisobot**:
   - O'quvchi testni yakunlagan zahoti quyidagi hisobot bevosita **Telegram Kanalga** (`-1004429502898`) va **Adminga** (`1840817356`) formatlangan HTML xabar ko'rinishida yuboriladi:
     - O'quvchi F.I. va username
     - Dars nomi va raqami
     - Natija (masalan: 18 / 20 ta to'g'ri - 90%)
     - Sarflangan vaqt (daqiqalarda)
     - Sana va soat

3. **Fisher-Yates tasodifiy saralash algoritmi**:
   - Darsdagi barcha savollar bazasidan (100 tagacha) o'quvchi har gal test boshlaganda aynan **tasodifiy 20 ta savol** tanlab beriladi.

4. **Keng qamrovli Admin Panel**:
   - Darslar yaratish (1-dars, 2-dars...) va vaqtini belgilash.
   - Bittalab qo'lda savol qo'shish / tahrirlash (A, B, C, D variantlar, to'g'ri javob, izoh).
   - **Bulk Import (Ommaviy yuklash)**: Oddiy matn formatidan (A, B, C, D) yoki JSON formatidan birdaniga 100 ta savolni bir necha soniyada yuklash.
   - 20 ta o'quvchi ro'yxati, parollari va ularning o'rtacha test ko'rsatkichlari.
   - Barcha natijalar statistikasi va filtrlash.
   - **JSON Backup Export/Import**: Server yoki ma'lumotlar bazasisiz ishlaganda barcha darslar va natijalarni JSON fayl ko'rinishida saqlab olish va tiklash.
   - **Supabase Cloud Sync**: Supabase REST API orqali barcha ma'lumotlarni bulutga yuklash va yuklab olish.

---

## 👥 Foydalanuvchilar va Kirish ma'lumotlari

### 🛡️ Administrator hisobi:
- **Username:** `admin`
- **Parol:** `SuperAdminTest2026!`

### 🎓 20 ta Dastlabki O'quvchilar:
| T/r | O'quvchi F.I. | Login (Username) | Dastlabki Parol |
|---|---|---|---|
| 1 | Jaxongir Abdurashidov | `jaxongir_a` | `Jaxo#2026` |
| 2 | Mushtariy Abduxoshimova | `mushtariy_a` | `Mush#2026` |
| 3 | Nurislom Adilbayev | `nurislom_a` | `Nuri#2026` |
| 4 | Nurmuhammad Adilbayev | `nurmuhammad_a` | `Nurm#2026` |
| 5 | Tursunoy Alimbekova | `tursunoy_a` | `Turs#2026` |
| 6 | Durdona Alixanova | `durdona_a` | `Durd#2026` |
| 7 | Javohir Baxriddinov | `javohir_b` | `Javo#2026` |
| 8 | Ibrohim Begmatov | `ibrohim_b` | `Ibro#2026` |
| 9 | Sultonbek Dexqonov | `sultonbek_d` | `Sult#2026` |
| 10 | Salovat Eldorov | `salovat_e` | `Salo#2026` |
| 11 | Shaxlo Ergashvoyeva | `shaxlo_e` | `Shax#2026` |
| 12 | Iroda Ilxomova | `iroda_i` | `Irod#2026` |
| 13 | Karomat Kuzimurodova | `karomat_k` | `Karo#2026` |
| 14 | Muhammadziyo Qochqorov | `muhammadziyo_q` | `Muha#2026` |
| 15 | Odina Rahmonaliyeva | `odina_r` | `Odin#2026` |
| 16 | Umidjon Saydullayev | `umidjon_s` | `Umid#2026` |
| 17 | Toxir To'rabekov | `toxir_t` | `Toxi#2026` |
| 18 | Karina Turdaliyeva | `karina_t` | `Kari#2026` |
| 19 | Diyoraxon Xodjidadayeva | `diyoraxon_x` | `Diyo#2026` |
| 20 | Ro'zzana Abdumalikov | `rozzana_a` | `Rozz#2026` |

*(Login sahifasida bir tugma bilan istalgan hisobni avtomatik to'ldirish imkoniyati ham mavjud)*

---

## 📁 Fayllar strukturasi

```text
ntamath/
├── index.html                   # Telegram SDK, viewport va shriftlar
├── package.json                 # Bog'liqliklar va buyruqlar
├── tsconfig.json                # TypeScript konfiguratsiyasi
├── vite.config.ts               # Vite konfiguratsiyasi
├── tailwind.config.js           # Tailwind CSS sozlamalari
├── vercel.json                  # SPA routing & iframe headers
├── .env                         # Telegram Bot Token va ID lar
├── .env.example
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx                 # Ilova boshlang'ich nuqtasi
    ├── App.tsx                  # Asosiy router va Telegram BackButton boshqaruvi
    ├── index.css                # Tailwind va scrollbar stillari
    ├── vite-env.d.ts            # Vite muhit o'zgaruvchilari turlari
    ├── types/
    │   └── index.ts             # User, Lesson, Question, TestResult turlari
    ├── data/
    │   ├── students.json        # 20 ta o'quvchi va admin boshlang'ich ma'lumotlari
    │   └── tests.json           # Dastlabki matematika darslari va test savollari
    ├── context/
    │   └── AuthContext.tsx      # Foydalanuvchi sessiyasi, login/logout, mavzu
    ├── services/
    │   ├── telegram.ts          # Telegram Bot API xabarnoma & WebApp SDK integratsiyasi
    │   ├── storage.ts           # localStorage, import/export, zaxiralash
    │   └── supabase.ts          # Supabase REST sinxronlash arxitekturasi
    ├── utils/
    │   └── shuffle.ts           # Fisher-Yates tasodifiy saralash algoritmi
    ├── components/
    │   ├── Navbar.tsx           # Tepa panel, profil va mavzu tugmasi
    │   └── Modal.tsx            # Qayta ishlatiluvchi modal darcha
    └── pages/
        ├── LoginPage.tsx        # Kirish sahifasi va namunaviy hisoblar tanlovi
        ├── StudentDashboard.tsx # O'quvchi kabineti, darslar va oldingi natijalar
        ├── QuizPage.tsx         # 20 ta savolli test topshirish jarayoni, taymer, navigator
        ├── QuizResultPage.tsx   # Natijalar tahlili, confetti, telegram holati
        └── AdminDashboard/
            ├── AdminDashboard.tsx       # Asosiy admin interfeysi (4 ta tab)
            ├── QuestionFormModal.tsx    # Bittalab savol qo'shish/tahrirlash
            └── BulkImportModal.tsx      # Matn/JSON formatda 100 ta savolni birdan yuklash
```

---

## 🛠️ Loyihani mahalliy (Local) ishga tushirish

1. Bog'liqliklarni o'rnatish:
   ```bash
   npm install
   ```

2. Ishga tushirish:
   ```bash
   npm run dev
   ```

3. Brauzerda ochish:
   `http://localhost:3000`

---

## 🌐 Vercel-ga deploy qilish bo'yicha qadam-baqadam ko'rsatma

Loyiha Vercel platformasiga 100% moslashtirilgan (`vercel.json` fayli qo'shilgan).

### 1-Usul: GitHub orqali (Tavsiya etiladi)
1. Kodni GitHub reponingizga push qiling:
   ```bash
   git init
   git add .
   git commit -m "NTAMath Test Platform initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```
2. [vercel.com](https://vercel.com) ga kiring va **"Add New Project"** tugmasini bosing.
3. GitHub reponi tanlang (**Import**).
4. **Environment Variables** bo'limiga quyidagilarni kiriting:
   - `VITE_TELEGRAM_BOT_TOKEN` = `9165520607:AAHcHBpeBnC4p3vepLbKmz_6_pg2YKAi-AA`
   - `VITE_TELEGRAM_CHANNEL_ID` = `-1004429502898`
   - `VITE_TELEGRAM_ADMIN_ID` = `1840817356`
5. **Deploy** tugmasini bosing. 1 daqiqada tayyor Vercel havolasiga ega bo'lasiz (masalan: `https://ntamath.vercel.app`).

### 2-Usul: Vercel CLI orqali
```bash
npm i -g vercel
vercel
```

---

## 🤖 Telegram Bot (BotFather) ga WebApp ulash

Vercel havolangiz tayyor bo'lgach (masalan: `https://ntamath.vercel.app`):
1. Telegramda [@BotFather](https://t.me/BotFather) botiga o'ting.
2. `/mybots` buyrug'ini yuboring va botingizni tanlang.
3. **Bot Settings** -> **Menu Button** -> **Configure menu button** ni tanlang.
4. Vercel havolangizni yuboring: `https://ntamath.vercel.app`.
5. Tugma nomini yozing (masalan: `Test Topshirish 📝`).
6. Endi barcha foydalanuvchilar botingizga kirib, to'g'ridan-to'g'ri WebApp-ni ochishi va test topshirishi mumkin!
