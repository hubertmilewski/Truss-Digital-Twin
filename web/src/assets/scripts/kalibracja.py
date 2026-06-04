import time
from hx711 import HX711

class Kalibrator:
    def __init__(self, dt, sck):
        # Inicjalizacja układu i twardy reset sprzętowy
        self.hx = HX711(d_out=dt, pd_sck=sck)
        self.hx.power_off()
        time.sleep_ms(1)
        self.hx.power_on()

    def pobierz_srednia(self, probki=15):
        # Zbieranie zdefiniowanej liczby surowych próbek
        odczyty = []
        while len(odczyty) < probki:
            if self.hx.is_ready():
                odczyty.append(self.hx.read())
            time.sleep_ms(10)
            
        # Odrzucanie zakłuceń, odcinamy 20% skrajnych wartości z góry i z dołu
        odczyty.sort()
        m = probki // 5
        czyste = odczyty[m:-m] if m > 0 else odczyty
        
        # Wyliczenie i zwrot średniej
        return sum(czyste) // len(czyste)


def uruchom_kalibracje():
    # Konfiguracja początkowa pinów
    dt = int(input("Pin DT: "))
    sck = int(input("Pin SCK: "))
    waga = Kalibrator(dt, sck)
    
    # Mierzenie punktu zerowego kratownicy
    input("Zdejmij obciążenie i wciśnij ENTER...")
    tara = waga.pobierz_srednia()
    
    # Mierzenie odchylenia dla znanego obciążenia
    wzorzec = float(input("Połóż wzorzec, wpisz jego wagę [g] i wciśnij ENTER: "))
    time.sleep(2) # Oczekiwanie, aż fizyczne wibracje belki po położeniu przedmiotu wygasną
    
    # Obliczenie współczynnika proporcjonalności
    wspolczynnik = (waga.pobierz_srednia() - tara) / wzorzec
    
    # Wyświetlenie gotowych danych do skopiowania
    print("\n--- WYNIKI ---")
    print(f"TARA: {tara}")
    print(f"WSPOLCZYNNIK: {wspolczynnik:.0f}")


# Aby przeprowadzić kalibrację, usuń znak '#' z poniższej linijki i uruchom skrypt
# uruchom_kalibracje()