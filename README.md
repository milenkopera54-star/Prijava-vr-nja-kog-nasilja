# Prijava vršnjačkog nasilja

Aplikacija za učenike da prijave vršnjačko nasilje školskom psihologu — anonimno ili sa imenom.

## Pre postavljanja: podesi mejl

Otvori `src/App.jsx`, pronađi na vrhu:

```js
const EMAILJS = {
  serviceId: "TVOJ_SERVICE_ID",
  templateId: "TVOJ_TEMPLATE_ID",
  publicKey: "TVOJ_PUBLIC_KEY",
  psihologEmail: "psiholog@skola.rs",
};
```

1. Napravi besplatan nalog na [emailjs.com](https://www.emailjs.com)
2. **Email Services** → dodaj Gmail/Outlook nalog psihologa → dobićeš `serviceId`
3. **Email Templates** → napravi šablon (možeš koristiti promenljive `{{hitno}}`, `{{podnosilac}}`, `{{razred}}`, `{{vrsta}}`, `{{mesto}}`, `{{ponavlja_se}}`, `{{opis}}`, `{{ukljuceni}}`, `{{kontakt}}`, `{{vreme}}`, `{{to_email}}`) → dobićeš `templateId`
4. **Account → General** → tu je `publicKey`
5. Upiši i mejl psihologa u `psihologEmail`

Dok su polja na `TVOJ_...`, slanje mejla se tiho preskače (aplikacija i dalje radi, prijave se čuvaju za dashboard).

## Ograničenje internog pregleda (dashboard za psihologa)

Ova verzija čuva prijave u `localStorage` (po uređaju/browseru), jer je pravo deljeno skladište
vezano za Claude okruženje. To znači: dashboard prikazuje samo prijave poslate sa **istog uređaja**.

Za pravi zajednički pregled sa svih telefona/računara treba prava baza (npr. besplatan Supabase
nalog) — javi se kad dođeš do tog koraka, mogu da pripremim tu verziju. Do tada je mejl (EmailJS)
glavni i pouzdan način da prijava stigne psihologu.

## Pokretanje lokalno

```bash
npm install
npm run dev
```

## Postavljanje na Vercel (besplatno)

1. Napravi nalog na [github.com](https://github.com) ako ga nemaš
2. Napravi novi repozitorijum (npr. `prijava-nasilja`) i uploaduj sadržaj ovog foldera
3. Napravi nalog na [vercel.com](https://vercel.com) → "Continue with GitHub"
4. "Add New Project" → izaberi repozitorijum → Vercel sam prepozna Vite/React → "Deploy"
5. Za par minuta dobijaš link tipa `prijava-nasilja.vercel.app`, spreman za deljenje učenicima

## PIN za pregled psihologa

Podrazumevani PIN je `1985` — nalazi se u `src/App.jsx` (`const PIN = "1985"`). Promeni ga pre
deljenja aplikacije. Ovo je samo blaga zaštita od slučajnog pristupa, ne prava bezbednost.

## Objavljivanje na Play Store

Play Store traži Android fajl (`.aab`), ne web sajt — zato se sajt "umota" u Android app pomoću
Google-ovog alata **Bubblewrap**. Ovaj projekat već ima sve što je za to potrebno
(`public/manifest.json`, ikonice, `twa-manifest.json`).

**Preduslov:** aplikacija mora prvo biti postavljena na Vercel (vidi sekciju iznad) — Bubblewrap
pakuje pravi, već hostovan link, a ne fajlove sa računara.

### Koraci

1. **Otvori `twa-manifest.json`** i zameni `TVOJ-SAJT.vercel.app` pravim linkom koji si dobio od
   Vercela (na tri mesta: `host`, `iconUrl`, `maskableIconUrl`)

2. **Instaliraj Bubblewrap** (potreban je Node.js i Java JDK 17+ instaliran na računaru):
   ```bash
   npm install -g @bubblewrap/cli
   ```

3. **Pokreni generisanje Android projekta** iz foldera ovog projekta:
   ```bash
   bubblewrap init --manifest=./twa-manifest.json
   ```
   Alat će postaviti par pitanja (potvrdi ponuđene vrednosti) i sam skinuti Android SDK ako
   nedostaje.

4. **Napravi potpisani fajl za Play Store:**
   ```bash
   bubblewrap build
   ```
   Ovo pravi `app-release-bundle.aab` — fajl koji se uploaduje na Play Store. Bubblewrap će
   napraviti i sačuvati **keystore** (fajl za potpisivanje) — čuvaj ga, treba ti za svako buduće
   ažuriranje aplikacije.

5. **Poveži sajt i app** (da Android ne prikazuje traku pretraživača na vrhu): u
   `public/.well-known/assetlinks.json` na sajtu treba da stoji potvrda da app i sajt pripadaju
   istom vlasniku. Bubblewrap ti daje tačan sadržaj tog fajla nakon build-a (ispiše SHA-256
   otisak) — ubaci ga u `public/.well-known/assetlinks.json` i ponovo deploy-uj na Vercel.

6. **Google Play Console nalog** — na [play.google.com/console](https://play.google.com/console),
   jednokratna naknada 25$, tvoj Google nalog (ili nalog škole).

7. **Napravi novu aplikaciju** u Play Console → uploaduj `.aab` fajl → popuni opis, screenshotove,
   politiku privatnosti (obavezna, čak i kratka — ovde se prikupljaju podaci o maloletnicima pa
   vredi da je pregleda neko iz škole) → pošalji na pregled (traje par dana do nedelju).

Koraci 1–5 mogu dodatno da ti pomognem ako zapneš (npr. tačan sadržaj `assetlinks.json` fajla);
koraci 6–7 zahtevaju tvoj Google nalog i ne mogu se uraditi umesto tebe.

