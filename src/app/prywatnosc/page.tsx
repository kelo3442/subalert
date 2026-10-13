import type { Metadata } from "next";
import { ContactEmail, LegalPage, List, Operator, Section } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Polityka prywatności" };

const PROCESSORS = [
  ["Supabase", "baza danych, logowanie i przechowywanie kont"],
  ["Vercel", "hosting aplikacji i anonimowe statystyki odwiedzin (Vercel Web Analytics)"],
  ["Stripe", "obsługa płatności za Premium (dane karty trafiają wyłącznie do Stripe)"],
  ["Resend", "wysyłka przypomnień e-mail"],
  ["Postmark", "odbiór wiadomości przekazywanych do automatycznego dodawania (tylko w Premium, jeśli z niego korzystasz)"],
  ["Google", "logowanie kontem Google (tylko jeśli wybierzesz tę metodę)"],
];

export default function PrivacyPage() {
  return (
    <LegalPage title="Polityka prywatności">
      <Section title="1. Administrator danych">
        <p>
          Administratorem danych osobowych jest: <Operator />. W sprawach dotyczących danych osobowych możesz pisać na adres{" "}
          <ContactEmail />.
        </p>
      </Section>

      <Section title="2. Jakie dane przetwarzamy">
        <List>
          <li>Dane konta: adres e-mail oraz hasło przechowywane wyłącznie w postaci zaszyfrowanej (skrót) przez Supabase Auth — nie znamy Twojego hasła. Przy logowaniu przez Google otrzymujemy adres e-mail i identyfikator konta Google.</li>
          <li>Dane, które sam wprowadzasz: subskrypcje i rachunki (nazwa, kwota, cykl, terminy, kategoria, link, notatka) oraz ustawienia przypomnień i strefa czasowa.</li>
          <li>
            Plik z historią rachunku: <strong className="text-fg">analizowany wyłącznie w Twojej przeglądarce i nigdy nie wysyłany do nas</strong>.
            Zapisujemy tylko pozycje, które zatwierdzisz.
          </li>
          <li>
            Przekazane e-maile (Premium): zapisujemy wyłącznie nadawcę, temat, datę i rozpoznane dane (nazwa usługi, kwota, termin).{" "}
            <strong className="text-fg">Treści wiadomości nie przechowujemy.</strong>
          </li>
          <li>Dane płatności (Premium): status planu, daty ważności oraz identyfikatory klienta i subskrypcji w Stripe. Numerów kart nie otrzymujemy.</li>
          <li>Dane techniczne: adres IP i informacje o przeglądarce w logach serwera, niezbędne do działania i zabezpieczenia Serwisu.</li>
          <li>
            Statystyki odwiedzin: odwiedzona podstrona (bez parametrów i identyfikatorów), strona, z której przyszedłeś, kraj oraz typ
            urządzenia i przeglądarki. Statystyki są zbiorcze i anonimowe — nie używają plików cookies i nie pozwalają nam rozpoznać,
            kim jesteś.
          </li>
          <li>Lista chętnych na Premium: data zapisu, jeśli klikniesz „Powiadom mnie”. Wypiszesz się, pisząc do nas.</li>
        </List>
      </Section>

      <Section title="3. Cele i podstawy prawne">
        <List>
          <li>Prowadzenie konta i świadczenie usług, w tym przypomnień i Premium — art. 6 ust. 1 lit. b RODO (umowa).</li>
          <li>Rozliczenia i obowiązki podatkowo-księgowe — art. 6 ust. 1 lit. c RODO (obowiązek prawny).</li>
          <li>Zapewnienie bezpieczeństwa, zapobieganie nadużyciom oraz ustalanie i dochodzenie roszczeń — art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes).</li>
          <li>Anonimowe statystyki odwiedzin, służące ulepszaniu Serwisu — art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes).</li>
          <li>Powiadomienie o starcie Premium, jeśli o nie poprosisz — art. 6 ust. 1 lit. a RODO (zgoda, którą możesz wycofać w każdej chwili).</li>
        </List>
        <p>Podanie adresu e-mail jest niezbędne do założenia konta. Nie podejmujemy decyzji opartych wyłącznie na zautomatyzowanym przetwarzaniu, w tym profilowania, wywołujących skutki prawne.</p>
      </Section>

      <Section title="4. Odbiorcy danych">
        <p>Dane powierzamy wyłącznie dostawcom, którzy pomagają nam świadczyć usługę, na podstawie umów powierzenia:</p>
        <ul className="flex flex-col gap-1.5">
          {PROCESSORS.map(([name, purpose]) => (
            <li key={name}>
              <strong className="text-fg">{name}</strong> — {purpose}
            </li>
          ))}
        </ul>
        <p>
          Część z tych dostawców ma siedzibę w USA. Przekazanie danych poza Europejski Obszar Gospodarczy odbywa się na podstawie
          decyzji Komisji Europejskiej w sprawie EU-US Data Privacy Framework lub standardowych klauzul umownych. Nie sprzedajemy
          danych i nie przekazujemy ich w celach marketingowych.
        </p>
      </Section>

      <Section title="5. Jak długo przechowujemy dane">
        <List>
          <li>Dane konta i wprowadzone pozycje — do czasu usunięcia konta (możesz to zrobić w każdej chwili w ustawieniach).</li>
          <li>Dokumenty rozliczeniowe dotyczące płatności — przez okres wymagany przepisami podatkowymi (co do zasady 5 lat od końca roku podatkowego).</li>
          <li>Logi techniczne — przez krótki okres niezbędny do zapewnienia bezpieczeństwa.</li>
        </List>
      </Section>

      <Section title="6. Twoje prawa">
        <p>
          Masz prawo do: dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia (eksport CSV w
          ustawieniach) oraz sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie. Aby skorzystać z tych praw,
          napisz na <ContactEmail />. Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193
          Warszawa).
        </p>
      </Section>

      <Section title="7. Pliki cookies">
        <p>
          Używamy wyłącznie niezbędnych plików cookies, które utrzymują Twoją sesję logowania. Nie używamy cookies reklamowych ani
          analitycznych — statystyki odwiedzin działają bez cookies. Cookies możesz usunąć w ustawieniach przeglądarki — spowoduje to wylogowanie.
        </p>
      </Section>

      <Section title="8. Zmiany polityki">
        <p>O istotnych zmianach tej polityki poinformujemy e-mailem lub komunikatem w Serwisie.</p>
      </Section>
    </LegalPage>
  );
}
