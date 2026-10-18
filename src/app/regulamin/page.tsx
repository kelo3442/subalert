import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail, LegalPage, List, Operator, Section } from "@/components/legal/legal-page";
import { EARLY_ACCESS_LIMIT, EARLY_ACCESS_MONTHS, FREE_PLAN_LIMIT } from "@/lib/premium/plan";

export const metadata: Metadata = { title: "Regulamin" };

export default function TermsPage() {
  return (
    <LegalPage title="Regulamin serwisu Opłacik">
      <Section title="§1. Postanowienia ogólne">
        <List>
          <li>
            Regulamin określa zasady korzystania z serwisu internetowego Opłacik (dalej: „Serwis”), dostępnego pod adresem, na
            którym opublikowano ten dokument, oraz zasady zakupu planu Premium.
          </li>
          <li>
            Usługodawcą i sprzedawcą jest: <Operator /> (dalej: „Usługodawca”).
          </li>
          <li>Regulamin jest regulaminem, o którym mowa w art. 8 ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną.</li>
          <li>
            Pojęcia: „Użytkownik” — osoba korzystająca z Serwisu; „Konsument” — Użytkownik będący konsumentem w rozumieniu art. 22¹
            Kodeksu cywilnego; „Konto” — indywidualne konto Użytkownika w Serwisie; „Premium” — płatny plan Serwisu.
          </li>
        </List>
      </Section>

      <Section title="§2. Usługi">
        <List>
          <li>
            Serwis umożliwia zapisywanie subskrypcji i stałych rachunków, wyliczanie ich kosztów, prowadzenie kalendarza płatności,
            oznaczanie okresów próbnych oraz otrzymywanie przypomnień e-mail.
          </li>
          <li>
            Serwis <strong className="text-fg">nie ma dostępu</strong> do rachunków bankowych ani kont Użytkownika u dostawców usług i{" "}
            <strong className="text-fg">nie anuluje subskrypcji w imieniu Użytkownika</strong>. Przypomnienia i wskazówki mają
            charakter informacyjny; decyzje o płatnościach i rezygnacji z usług Użytkownik podejmuje samodzielnie u dostawców.
          </li>
          <li>
            Plan darmowy obejmuje do {FREE_PLAN_LIMIT} aktywnych pozycji. Plan Premium znosi ten limit i udostępnia automatyczne
            dodawanie subskrypcji z wiadomości e-mail przekazanych przez Użytkownika na indywidualny adres.
          </li>
          <li>
            Funkcja wyszukiwania płatności w pliku z historii rachunku działa w przeglądarce Użytkownika — plik nie jest przesyłany do
            Serwisu. Zapisywane są wyłącznie pozycje zatwierdzone przez Użytkownika.
          </li>
        </List>
      </Section>

      <Section title="§3. Wymagania techniczne">
        <List>
          <li>Do korzystania z Serwisu potrzebne są: urządzenie z dostępem do internetu, aktualna przeglądarka internetowa z włączoną obsługą JavaScript i plików cookies oraz aktywny adres e-mail.</li>
          <li>Zabronione jest dostarczanie treści o charakterze bezprawnym oraz działania zakłócające pracę Serwisu.</li>
        </List>
      </Section>

      <Section title="§4. Konto">
        <List>
          <li>Umowa o świadczenie usług drogą elektroniczną zostaje zawarta z chwilą założenia Konta (rejestracja adresem e-mail lub kontem Google) i akceptacji Regulaminu. Umowa w planie darmowym jest zawarta na czas nieokreślony i jest nieodpłatna.</li>
          <li>Użytkownik może w każdej chwili wypowiedzieć umowę, usuwając Konto w ustawieniach Serwisu. Usunięcie Konta usuwa zapisane w nim dane.</li>
          <li>Użytkownik odpowiada za poufność hasła i poprawność wprowadzanych danych.</li>
          <li>Osoby niepełnoletnie mogą kupić Premium wyłącznie za zgodą przedstawiciela ustawowego.</li>
        </List>
      </Section>

      <Section title="§5. Premium i płatności">
        <List>
          <li>
            Ceny: <strong className="text-fg">9,99 zł miesięcznie</strong> (plan miesięczny) lub{" "}
            <strong className="text-fg">79 zł za 12 miesięcy</strong> (plan roczny). Ceny podane są w złotych polskich i są cenami
            końcowymi.
          </li>
          <li>
            Plan miesięczny jest subskrypcją odnawianą automatycznie co miesiąc i opłacaną kartą płatniczą. Użytkownik może ją
            anulować w każdej chwili w Serwisie (Premium → Zarządzaj subskrypcją) — Premium działa wtedy do końca opłaconego okresu, a
            kolejne opłaty nie są pobierane.
          </li>
          <li>
            Plan roczny jest płatnością jednorazową (BLIK, Przelewy24 lub karta) i{" "}
            <strong className="text-fg">nie odnawia się automatycznie</strong>.
          </li>
          <li>Płatności obsługuje Stripe. Usługodawca nie otrzymuje ani nie przechowuje danych kart płatniczych.</li>
          <li>Umowa o Premium zostaje zawarta z chwilą skutecznej płatności; Premium jest aktywowane niezwłocznie po jej potwierdzeniu.</li>
          <li>Potwierdzenie zakupu jest wysyłane na adres e-mail podany przy płatności.</li>
          <li>
            Promocja startowa: pierwszych {EARLY_ACCESS_LIMIT} Kont otrzymuje Premium bezpłatnie na {EARLY_ACCESS_MONTHS} miesięcy. Aby z niej
            skorzystać, należy potwierdzić adres e-mail Konta, klikając link wysłany przez Usługodawcę (Konta założone przez logowanie Google
            mają adres potwierdzony od razu). O kolejności decyduje chwila potwierdzenia i od niej liczy się okres Premium. Promocja nie
            obejmuje Kont z adresami e-mail jednorazowymi (tymczasowymi). Po tym czasie Konto wraca do planu darmowego automatycznie i bez
            żadnych opłat — w ramach promocji nie podaje się danych płatniczych.
          </li>
        </List>
      </Section>

      <Section title="§6. Prawo odstąpienia od umowy">
        <List>
          <li>
            Konsument może odstąpić od umowy o Premium w terminie 14 dni od jej zawarcia bez podania przyczyny, wysyłając oświadczenie
            na adres <ContactEmail />.
          </li>
          <li>
            Ponieważ Premium jest dostępne od razu po zakupie, na wyraźne żądanie Konsumenta, w razie odstąpienia Usługodawca zwraca
            kwotę proporcjonalną do niewykorzystanej części opłaconego okresu, w terminie 14 dni, tą samą metodą płatności.
          </li>
          <li>Postanowienia dotyczące Konsumentów stosuje się także do osoby fizycznej zawierającej umowę bezpośrednio związaną z jej działalnością gospodarczą, gdy umowa nie ma dla niej charakteru zawodowego (art. 38a ustawy o prawach konsumenta).</li>
        </List>
      </Section>

      <Section title="§7. Reklamacje">
        <List>
          <li>Reklamacje dotyczące działania Serwisu lub płatności można składać na adres <ContactEmail />, opisując problem i podając adres e-mail Konta.</li>
          <li>Usługodawca odpowiada na reklamację w terminie 14 dni od jej otrzymania.</li>
          <li>
            Konsument może skorzystać z pozasądowych sposobów rozpatrywania sporów, m.in. pomocy miejskiego lub powiatowego rzecznika
            konsumentów oraz Wojewódzkiego Inspektoratu Inspekcji Handlowej.
          </li>
        </List>
      </Section>

      <Section title="§8. Odpowiedzialność">
        <List>
          <li>Usługodawca dokłada starań, aby Serwis działał nieprzerwanie, i zastrzega możliwość przerw technicznych.</li>
          <li>
            Wyliczenia kosztów i terminów opierają się na danych wprowadzonych przez Użytkownika. Usługodawca nie odpowiada za opłaty
            pobrane przez dostawców usług, w tym po zakończeniu okresu próbnego, ani za niedostarczenie przypomnienia z przyczyn
            niezależnych (np. filtr antyspamowy).
          </li>
          <li>Ograniczenia odpowiedzialności nie dotyczą Konsumentów w zakresie, w jakim wyłączają je bezwzględnie obowiązujące przepisy.</li>
        </List>
      </Section>

      <Section title="§9. Dane osobowe">
        <p>
          Zasady przetwarzania danych osobowych opisuje{" "}
          <Link href="/prywatnosc" className="text-accent hover:underline">
            Polityka prywatności
          </Link>
          .
        </p>
      </Section>

      <Section title="§10. Postanowienia końcowe">
        <List>
          <li>Usługodawca może zmienić Regulamin z ważnych przyczyn (np. zmiana przepisów lub zakresu usług), informując Użytkowników e-mailem co najmniej 14 dni przed wejściem zmian w życie. Zmiany nie dotyczą już opłaconych okresów Premium.</li>
          <li>W sprawach nieuregulowanych stosuje się prawo polskie, w szczególności Kodeks cywilny, ustawę o prawach konsumenta i ustawę o świadczeniu usług drogą elektroniczną. Wybór prawa nie pozbawia Konsumenta ochrony przysługującej mu na podstawie przepisów kraju jego zwykłego pobytu.</li>
        </List>
      </Section>
    </LegalPage>
  );
}
