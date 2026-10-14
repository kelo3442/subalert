# Opłacik

**Wszystkie stałe opłaty w jednym miejscu. Z każdego banku.**

Opłacik ([oplacik.pl](https://www.oplacik.pl)) to aplikacja webowa (PWA) dla polskich użytkowników: subskrypcje i
rachunki domowe w jednym miejscu, miesięczny i roczny koszt, kalendarz płatności (także w kalendarzu telefonu), kończące
się okresy próbne (Trial Guard), przypomnienia e-mail i push przed obciążeniem oraz automatyczne dodawanie i aktualizacja
pozycji z przekazanych e-maili.

> Opłacik **nie** łączy się z bankiem ani nie czyta skrzynki pocztowej — analizuje tylko plik z historii konta
> (w przeglądarce) i e-maile, które użytkownik sam przekaże. Nie anuluje subskrypcji za użytkownika — przypomina
> i podpowiada, gdzie to zrobić.

## Stos technologiczny

- Next.js 16 (App Router, Server Actions, `proxy.ts`), React 19, TypeScript
- Tailwind CSS 4, ikony Lucide
- Supabase: Auth + Postgres z Row Level Security
- Zod 4 — ta sama walidacja w przeglądarce i na serwerze
- Vitest — testy logiki domenowej
- Resend (HTTP API, bez SDK) — wysyłka przypomnień
- Vercel + Vercel Cron — wdrożenie i codzienna wysyłka

## Funkcje

| Obszar | Co działa |
| --- | --- |
| Landing | Hero, funkcje, kalkulator kosztów bez rejestracji, sekcja o przypomnieniach, FAQ |
| Konto | Rejestracja, logowanie, wylogowanie (Supabase Auth), potwierdzenie e-mail, bezpieczne przekierowanie `?next=`, reset hasła e-mailem, zmiana hasła, usunięcie konta wraz z danymi |
| Pulpit | Suma miesięczna i roczna, liczba aktywnych, najbliższa płatność, nadchodzące odnowienia (30 dni), wydatki wg kategorii, lista subskrypcji |
| Szybki start | Po rejestracji: zaznaczenie używanych usług (ok. 30 popularnych, także polskich) i własnych, wpisanie kwot i dnia płatności, podsumowanie miesięczne/roczne na żywo, zapis wszystkich naraz (`/panel/start`) |
| Import z historii konta | Plik CSV z bankowości internetowej (UTF-8 lub Windows-1250, różne układy kolumn, ręczne wskazanie kolumn jako zapas) jest analizowany **tylko w przeglądarce**; wykrywane są płatności cykliczne (tydzień/miesiąc/kwartał/rok), znane usługi, możliwie nieaktywne subskrypcje. Zapisywane jest tylko to, co użytkownik zaznaczy. Przykładowy plik demonstracyjny do wypróbowania |
| Automatyczne dodawanie z e-maili | Każdy użytkownik ma prywatny adres do przekazywania potwierdzeń płatności (np. filtr w Gmailu). Rozpoznane usługi z kwotą są dodawane od razu, pozostałe czekają na pulpicie na „Dodaj / Uzupełnij / Odrzuć”. Kod potwierdzenia przekazywania z Gmaila pojawia się w ustawieniach. Przechowywane są tylko nadawca, temat i wyciągnięte dane — nie treść |
| Rachunki domowe | Prąd, gaz, woda, czynsz, internet, telefon, ubezpieczenia; cykle co 2 miesiące i co pół roku; kwota orientacyjna („ok. 180 zł”) dla zmiennych rachunków; rozpoznawanie popularnych polskich dostawców w imporcie z banku |
| Premium | Plan darmowy do 3 aktywnych pozycji (limit pilnowany też przez bazę danych). Premium: 9,99 zł/mies. (karta, odnawiane, anulowanie w portalu Stripe) lub 79 zł/rok (BLIK, Przelewy24, karta — jednorazowo, bez automatycznego odnawiania). Premium odblokowuje brak limitu i automatyczne dodawanie z e-maili |
| Logowanie przez Google | Przycisk na stronach logowania i rejestracji (po włączeniu w Supabase i ustawieniu `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`) |
| Eksport danych | Plik CSV (Excel, UTF-8) ze wszystkimi pozycjami — Ustawienia → „Pobierz moje dane” |
| Subskrypcje | Dodawanie (szybki wybór popularnych usług lub własna), edycja, usuwanie z potwierdzeniem, filtr aktywne/anulowane |
| Trial Guard | Data końca okresu próbnego, liczba dni do końca, wyróżnienie w panelu, komunikat, że przypomnienie nie anuluje usługi |
| Kalendarz | Agenda płatności i końców okresów próbnych (30 dni / 3 miesiące / rok), sumy miesięczne, wyróżnienie najbliższych dni |
| Cancel Assistant | Link do zarządzania usługą, wskazówki anulowania, oznaczenie „anulowałem samodzielnie” / przywrócenie |
| Przypomnienia | Ustawienia (wł./wył., ile dni wcześniej, strefa czasowa), cron z deduplikacją, wysyłka przez Resend |

Bez kluczy Supabase aplikacja działa w trybie deweloperskim: strona główna i kalkulator działają, a logowanie
i panel pokazują ekran z instrukcją konfiguracji (nic nie jest symulowane).

## Uruchomienie lokalne

Wymagania: Node.js 20.9+ (testowane na 22), npm.

```bash
git clone https://github.com/kelo3442/subalert.git D:\subalert   # lub dowolny katalog
cd D:\subalert
npm install
copy .env.example .env.local      # macOS/Linux: cp .env.example .env.local
# uzupełnij .env.local (sekcja niżej)
npm run dev
```

Aplikacja: http://localhost:3000

### Skrypty

| Komenda | Opis |
| --- | --- |
| `npm run dev` | serwer deweloperski |
| `npm run build` / `npm start` | build produkcyjny i uruchomienie |
| `npm test` | testy jednostkowe (Vitest) |
| `npm run lint` | ESLint |
| `npm run typecheck` | generowanie typów tras Next.js + `tsc --noEmit` |

## Zmienne środowiskowe

| Zmienna | Wymagana | Gdzie | Opis |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | tak | klient + serwer | URL projektu Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | tak | klient + serwer | klucz publiczny (`sb_publishable_…`); działa też starszy `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `NEXT_PUBLIC_SITE_URL` | zalecana | serwer | publiczny adres aplikacji (linki w e-mailach). Na Vercel domyślnie domena produkcyjna |
| `SUPABASE_SECRET_KEY` | do przypomnień | **tylko serwer** | klucz `secret`/`service_role`; omija RLS, używany wyłącznie przez cron. Działa też nazwa `SUPABASE_SERVICE_ROLE_KEY` |
| `CRON_SECRET` | do przypomnień | **tylko serwer** | chroni `/api/cron/reminders` |
| `RESEND_API_KEY` | do przypomnień | **tylko serwer** | klucz API Resend |
| `REMINDER_FROM_EMAIL` | do przypomnień | **tylko serwer** | nadawca, np. `Opłacik <przypomnienia@twojadomena.pl>` (domena zweryfikowana w Resend) |

Zmienne `NEXT_PUBLIC_*` są wkompilowywane w build — po ich zmianie zrób nowy build/deploy.
Nigdy nie dodawaj prefiksu `NEXT_PUBLIC_` do kluczy sekretnych.

## Konfiguracja Supabase

1. Załóż projekt na https://supabase.com (region np. `eu-central-1` — Frankfurt).
2. **Schemat bazy** — uruchom migracje (po kolei) jednym ze sposobów:
   - *SQL Editor* w panelu Supabase → wklej i uruchom zawartość każdego pliku z `supabase/migrations/`
     w kolejności nazw (`20261012000000_init.sql`, `20261013000000_delete_own_account.sql`,
     `20261014000000_email_import.sql`, `20261015000000_premium_and_bills.sql`), albo
   - Supabase CLI: `npx supabase link --project-ref <ref>` i `npx supabase db push`.
3. **Klucze** — *Project Settings → API Keys*: skopiuj URL, klucz publishable (do `.env.local`) oraz secret
   (tylko jeśli uruchamiasz przypomnienia).
4. **Auth → URL Configuration**:
   - *Site URL*: `http://localhost:3000` lokalnie, a na produkcji adres z Vercel.
   - *Redirect URLs*: dodaj `http://localhost:3000/**` oraz `https://<twoja-domena>/**`
     (linki z e-maili prowadzą do `/auth/confirm?next=…`, więc potrzebny jest wzorzec z `**`).
5. **Auth → Providers → Email**: zostaw włączone. Przy włączonym „Confirm email” użytkownik po rejestracji
   dostaje link aktywacyjny prowadzący do `/auth/confirm`. Domyślny serwer pocztowy Supabase ma niskie limity —
   na produkcji skonfiguruj własny SMTP (*Auth → SMTP Settings*, np. ten sam Resend).
6. Opcjonalnie: *Auth → Policies* → minimalna długość hasła 8 znaków (aplikacja i tak to wymusza).
7. Opcjonalnie: *Auth → Email Templates → Reset Password* — domyślny link działa, gdy użytkownik otworzy go
   w tej samej przeglądarce, w której poprosił o reset. Aby działał też na innym urządzeniu, zamień link na:
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/panel/ustawienia/haslo`
   (analogicznie dla *Confirm signup*: `type=email&next=/panel`).

### Model danych

- `profiles` — preferencje przypomnień (strefa czasowa, ile dni wcześniej, wł./wył.). Tworzony triggerem
  przy rejestracji. Użytkownik może zmieniać tylko kolumny preferencji.
- `subscriptions` — subskrypcje. Kwoty w groszach (`amount_cents`), waluta wyłącznie PLN, cykle
  `weekly|monthly|quarterly|yearly`, `next_payment_date` jako data (bez godziny), opcjonalne
  `trial_ends_at`, `category`, `manage_url` (tylko `http(s)://`), status `active|cancelled`.
- `delete_own_account()` — funkcja, przez którą zalogowany użytkownik usuwa wyłącznie własne konto
  (kaskadowo znikają profil, subskrypcje i przypomnienia).
- `reminders` — dziennik wysyłek; unikalny klucz `(subscription_id, kind, event_date)` gwarantuje, że
  przypomnienie o danym terminie trafi do skrzynki najwyżej raz. Użytkownik może je tylko czytać.

### Bezpieczeństwo

- RLS włączony na wszystkich tabelach; polityki `auth.uid() = user_id` dla odczytu/zapisu/usuwania.
- Rola `anon` nie ma dostępu do danych; zapisy do `reminders` i funkcja `claim_reminder` tylko dla `service_role`.
- Ograniczenia `CHECK` w bazie dublują walidację aplikacji (kwota, cykl, URL, długości pól).
- Każda Server Action ponownie weryfikuje sesję (`supabase.auth.getUser()`) i waliduje dane Zodem.
- Hasła obsługuje wyłącznie Supabase Auth. Klucz `secret` jest używany tylko w `src/lib/supabase/admin.ts`
  (moduł `server-only`).
- Przekierowania po logowaniu przyjmują wyłącznie ścieżki wewnętrzne (`src/lib/safe-redirect.ts`).

## Przypomnienia e-mail — jak działają

1. Vercel Cron wywołuje codziennie `GET /api/cron/reminders` (harmonogram w `vercel.json`, 06:00 UTC)
   z nagłówkiem `Authorization: Bearer $CRON_SECRET`.
2. Dla każdego użytkownika z włączonymi przypomnieniami liczone jest „dziś” **w jego strefie czasowej**,
   następny termin płatności (stara data jest przesuwana o kolejne cykle) i koniec okresu próbnego.
3. Przypomnienie jest należne od `termin − N dni` do samego terminu — jeśli cron raz nie zadziała,
   kolejne uruchomienie nadrobi wysyłkę.
4. Wiersz w `reminders` jest wstawiany z `ON CONFLICT DO NOTHING`, następnie atomowo „zajmowany” funkcją
   `claim_reminder` (równoległe uruchomienia nie wyślą duplikatu), a Resend dostaje `Idempotency-Key`.
   Nieudane wysyłki są ponawiane maksymalnie 3 razy.
5. Gdy okres próbny kończy się w dniu płatności, wysyłane jest jedno przypomnienie (o końcu okresu próbnego).

Bez `SUPABASE_SECRET_KEY`, `RESEND_API_KEY` lub `REMINDER_FROM_EMAIL` endpoint zwraca `503 not_configured`
i niczego nie zapisuje ani nie wysyła. Panel informuje wtedy użytkownika, że wysyłka nie jest aktywna.

Ręczne wywołanie (np. test na produkcji):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<twoja-domena>/api/cron/reminders
```

## Automatyczne dodawanie z e-maili — konfiguracja

Funkcja jest opcjonalna; bez tej konfiguracji ustawienia pokazują informację, że nie jest dostępna.

1. Załóż konto w usłudze odbierającej pocztę przychodzącą — kod przyjmuje format webhooka
   [Postmark Inbound](https://postmarkapp.com/developer/webhooks/inbound-webhook)
   (pola `From`, `Subject`, `TextBody`, `HtmlBody`, `To`/`ToFull`/`MailboxHash`, `MessageID`, `Date`).
2. Adres użytkownika powstaje z szablonu `INBOUND_EMAIL_ADDRESS` (`{token}` = 32-znakowy losowy token z tabeli `profiles`):
   - bez własnej domeny: `TWOJ_INBOUND_HASH+{token}@inbound.postmarkapp.com` (adresowanie „plus”),
   - z domeną: `{token}@in.twojadomena.pl` (rekord MX domeny wskazuje na dostawcę).
3. Wygeneruj sekret (`openssl rand -hex 32`), ustaw go jako `INBOUND_EMAIL_WEBHOOK_SECRET`, a w dostawcy podaj URL webhooka
   z Basic Auth: `https://oplacik:<SEKRET>@<twoja-domena>/api/inbound-email`.
4. Wymagany jest też `SUPABASE_SECRET_KEY` (webhook zapisuje dane bez sesji użytkownika).

**Aktualizacje istniejących pozycji.** E-mail o usłudze, którą użytkownik już śledzi, zmienia ją zamiast tworzyć duplikat
(przy włączonym automatycznym dodawaniu): potwierdzenie płatności ustawia następny termin od dnia obciążenia (tylko gdy
płatność wypadała w ciągu ±10 dni) i wykrywa nową cenę (w granicach ×3 od dotychczasowej), mail o okresie próbnym ustawia
jego koniec, zapowiedź zmiany ceny zmienia kwotę, a potwierdzenie anulowania oznacza pozycję jako anulowaną. Każda zmiana jest
widoczna na pulpicie w sekcji „Wykryte w e-mailach” (`detected_subscriptions.applied_change`).

Bezpieczeństwo: webhook bez poprawnego hasła zwraca 401; nieznany adresat jest ignorowany (200, żeby dostawca nie ponawiał);
limit 100 wiadomości na użytkownika na dobę; ta sama wiadomość (`MessageID`) jest przetwarzana raz; użytkownik może
w ustawieniach wygenerować nowy adres, co unieważnia stary.

## Logowanie przez Google — konfiguracja

1. [Google Cloud Console](https://console.cloud.google.com/) → nowy projekt → *APIs & Services → OAuth consent screen*
   (typ „External”, nazwa aplikacji, e-mail kontaktowy, domena).
2. *Credentials → Create credentials → OAuth client ID* → typ „Web application”.
   W *Authorized redirect URIs* wpisz adres z Supabase: *Authentication → Sign In / Providers → Google* pokazuje
   „Callback URL” (`https://<projekt>.supabase.co/auth/v1/callback`).
3. Skopiuj Client ID i Client secret do Supabase (*Providers → Google*) i włącz dostawcę.
4. Ustaw `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` i zbuduj aplikację ponownie.
   Redirect URLs w Supabase muszą zawierać `https://<twoja-domena>/**` (patrz „Konfiguracja Supabase”).

## Premium i płatności (Stripe) — konfiguracja

1. Załóż konto na [stripe.com](https://stripe.com) (do przyjmowania płatności potrzebna jest działalność gospodarcza
   lub inna forma prowadzenia sprzedaży — sprawdź wymagania podatkowe).
2. *Settings → Payment methods*: włącz **Cards**, **BLIK** i **Przelewy24**. Plan miesięczny pokaże tylko metody
   obsługujące płatności cykliczne (karty, Apple Pay / Google Pay); plan roczny — wszystkie włączone.
3. *Settings → Billing → Customer portal*: zapisz konfigurację (pozwól anulować subskrypcję i zmienić kartę).
4. *Developers → Webhooks → Add endpoint*: `https://<twoja-domena>/api/stripe/webhook`, zdarzenia:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
5. Ustaw `STRIPE_SECRET_KEY` i `STRIPE_WEBHOOK_SECRET` (oraz `SUPABASE_SECRET_KEY`). Ceny (9,99 zł / 79 zł) są
   zdefiniowane w kodzie (`src/lib/premium/plan.ts`) — nie trzeba tworzyć produktów w Stripe.
6. Testy: klucze `sk_test_...` i karta `4242 4242 4242 4242`; lokalnie webhooki przekażesz poleceniem
   `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
7. Sprzedaż włącza `NEXT_PUBLIC_PREMIUM_SALES_ENABLED=true` (potem nowy deploy). Bez tej zmiennej Premium jest
   pokazywane jako „wkrótce”: nie da się go kupić, odwiedzający zostawiają e-mail na stronie głównej, a zalogowani klikają
   „Powiadom mnie”. Każdy dostaje e-mail z potwierdzeniem (z linkiem „wypisz mnie”), a na adres kontaktowy przychodzi
   informacja o nowym zapisie. Listę (tabela `premium_waitlist`) widzisz w `/panel/admin` — dostęp mają tylko konta
   z `ADMIN_EMAILS` (adresy po przecinku). Tam też pobierzesz CSV i po włączeniu sprzedaży wyślesz wszystkim jedną
   wiadomość „Premium już działa” (po 100 osób na kliknięcie, każdy dostaje ją tylko raz).

Webhook weryfikuje podpis Stripe (HMAC, tolerancja 5 minut), każde zdarzenie przetwarza raz (tabela `stripe_events`)
i tylko on może nadać Premium — użytkownik nie może zmienić `premium_until` w bazie.

Webhook przy zdarzeniach subskrypcji pobiera jej aktualny stan ze Stripe, więc kolejność zdarzeń nie ma znaczenia.

## Regulamin i polityka prywatności

Strony `/regulamin` i `/prywatnosc` są gotowe. Administrator danych i e-mail kontaktowy są wpisane jako wartości
domyślne w `src/lib/legal.ts`; zmienne `LEGAL_OPERATOR_NAME`, `LEGAL_OPERATOR_ADDRESS`, `LEGAL_OPERATOR_TAX_ID` i
`NEXT_PUBLIC_CONTACT_EMAIL` je nadpisują. Adres do doręczeń jest opcjonalny, ale przed uruchomieniem sprzedaży Premium
trzeba go podać (wymóg ustawy o prawach konsumenta). Treść to rzetelny wzór oparty na polskich przepisach, ale przed rozpoczęciem sprzedaży
warto, by przejrzał ją prawnik lub księgowy. Rejestracja wymaga zaznaczenia akceptacji regulaminu (sprawdzane też na serwerze).

## Aplikacja na telefon (PWA) i kalendarz

- **Instalacja:** `src/app/manifest.ts`, ikony w `public/icons/`, service worker `public/sw.js` (powiadomienia push i strona
  offline; strony z danymi konta nie są zapisywane w pamięci podręcznej). W ustawieniach jest przycisk „Zainstaluj aplikację”
  (Chrome/Android) lub instrukcja dla iPhone’a, a na pulpicie telefonu — baner, który można zamknąć.
- **Powiadomienia push:** ustaw `NEXT_PUBLIC_VAPID_PUBLIC_KEY` i `VAPID_PRIVATE_KEY` (`npx web-push generate-vapid-keys`),
  potem nowy deploy. Przypomnienia z crona trafiają wtedy także na urządzenia, które włączyły powiadomienia
  (tabela `push_subscriptions`; wygasłe urządzenia są usuwane automatycznie). Na iPhonie push działa po dodaniu do ekranu
  początkowego (iOS 16.4+).
- **Kalendarz:** każdy użytkownik ma prywatny link `/api/kalendarz/<token>.ics` (iCalendar) z płatnościami i końcami okresów
  próbnych na ~13 miesięcy. Google, Apple i Outlook subskrybują go i same odświeżają. Link można unieważnić w ustawieniach.
- Migracja: `supabase/migrations/20261016000000_calendar_and_push.sql`.

## Opinie użytkowników

Przycisk „Zgłoś opinię” (pasek boczny, a na telefonie ikona w nagłówku) zapisuje wiadomość w tabeli `feedback`
(maks. 10 dziennie na konto) i wysyła ją przez Resend na adres kontaktowy (`NEXT_PUBLIC_CONTACT_EMAIL`, domyślnie
kontakt@oplacik.pl) z adresem użytkownika w polu „Odpowiedz do”.

## Wyszukiwarki

`/robots.txt` (bez panelu i API), `/sitemap.xml` i dane strukturalne (schema.org `WebSite`/`WebApplication`) na stronie
głównej. Zgłoś domenę w Google Search Console i dodaj mapę strony.

## Statystyki odwiedzin

Aplikacja ma wbudowane [Vercel Web Analytics](https://vercel.com/docs/analytics): bez cookies, bez parametrów adresu
i identyfikatorów z panelu. Włączasz je w Vercel → projekt → **Analytics → Enable**; dane pojawiają się po kolejnym
deployu. Poza Vercel (np. lokalnie) skrypt nic nie wysyła.

## Wdrożenie na Vercel

1. Zaloguj się na [vercel.com](https://vercel.com) kontem GitHub → *Add New → Project* → wybierz repozytorium
   (przy pierwszym razie *Adjust GitHub App Permissions* i nadaj dostęp do repozytorium). Framework zostanie wykryty
   automatycznie. Nazwa projektu wyznacza adres `nazwa.vercel.app`.
2. Przed kliknięciem *Deploy* rozwiń *Environment Variables* i dodaj co najmniej:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` (np. `https://www.oplacik.pl`),
   `SUPABASE_SECRET_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_CONTACT_EMAIL` i dane do regulaminu. Pozostałe (Resend, Stripe,
   Google, odbiór e-maili) dodasz później — po każdej zmianie zmiennych zrób *Redeploy*.
3. Deploy. Wdrażana jest gałąź domyślna repozytorium (*Settings → Git → Production Branch*).
4. W Supabase: *Authentication → URL Configuration* → *Site URL* = adres Vercel, a w *Redirect URLs* dodaj
   `https://<twoj-adres>/**`.
5. Cron z `vercel.json` aktywuje się automatycznie na produkcji. Plan Hobby pozwala na uruchomienie raz
   dziennie — to wystarcza, bo przypomnienia są liczone w dniach.
6. Własna domena: *Settings → Domains → Add* i rekordy DNS wskazane przez Vercel; potem zaktualizuj
   `NEXT_PUBLIC_SITE_URL` i adresy w Supabase.
7. Resend: zweryfikuj domenę nadawcy (rekordy DNS) i ustaw `REMINDER_FROM_EMAIL` na adres w tej domenie.

## Testy

- `npm test` — 150 testów jednostkowych: koszty i cykle, przesuwanie dat (koniec miesiąca, lata przestępne,
  przełom roku, DST), okresy próbne, harmonogram i deduplikacja przypomnień, strefy czasowe, walidacja
  formularzy, kwoty, bezpieczne przekierowania, mapowanie błędów Auth, szablon e-maila (escapowanie HTML).
- `supabase/tests/rls.test.sql` — test izolacji danych (RLS) na czystym PostgreSQL. Uruchomienie lokalne
  (**nie** na projekcie Supabase):

  ```bash
  createdb oplacik_test
  psql -d oplacik_test -f supabase/tests/auth_stub.sql
  psql -d oplacik_test -f supabase/migrations/20261012000000_init.sql
  psql -d oplacik_test -f supabase/migrations/20261013000000_delete_own_account.sql
  psql -d oplacik_test -f supabase/migrations/20261014000000_email_import.sql
  psql -d oplacik_test -f supabase/migrations/20261015000000_premium_and_bills.sql
  psql -d oplacik_test -f supabase/migrations/20261016000000_calendar_and_push.sql
  psql -d oplacik_test -f supabase/migrations/20261017000000_email_updates_and_feedback.sql
  psql -d oplacik_test -f supabase/migrations/20261018000000_premium_waitlist.sql
  psql -d oplacik_test -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql   # → "RLS tests passed"
  ```

## Struktura

```
src/
  actions/           Server Actions (auth, subskrypcje, ustawienia)
  app/               trasy: / , /logowanie, /rejestracja, /zapomnialem-hasla, /panel/*, /auth/confirm, /api/cron/reminders
  components/        ui/ (prymitywy), landing/, app/ (panel), subscriptions/, auth/
  lib/
    dates.ts, money.ts             daty bez godzin (UTC), kwoty w groszach
    subscriptions/                 cykle i koszty, harmonogram, Trial Guard, kategorie, popularne usługi
    reminders/                     wyliczanie należnych przypomnień, plan, wysyłka, szablon e-mail
    validation/                    schematy Zod
    supabase/                      klienci: serwer, proxy (odświeżanie sesji), admin (cron)
    data/                          warstwa dostępu do danych (server-only)
  proxy.ts           ochrona /panel i odświeżanie sesji
supabase/
  migrations/        schemat + RLS
  tests/             test RLS
```

## Ograniczenia i kolejne kroki

- Brak zmiany adresu e-mail w aplikacji; zmiana hasła nie wymaga podania obecnego hasła (domyślne zachowanie Supabase).
- Tylko waluta PLN; tylko jasno określone cykle (bez np. co 2 miesiące).
- Interfejs ma tylko motyw ciemny.
- Linki i instrukcje anulowania dla popularnych usług są ogólne; dostawcy zmieniają swoje strony, więc warto
  je okresowo weryfikować (`src/lib/subscriptions/popular-services.ts`).
- Przypomnienia wysyłane raz dziennie (godzina zależna od harmonogramu crona, nie od strefy użytkownika).
