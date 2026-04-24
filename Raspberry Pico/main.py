import time
from machine import Pin
from hx711 import HX711 

# Konfiguracja pinów
PIN_DT = 2 
PIN_SCK = 3

waga = HX711(d_out=PIN_DT, pd_sck=PIN_SCK)

# Resetowanie i wybudzanie modułu
waga.power_off()
time.sleep_ms(1)
waga.power_on()

print("Rozpoczynam stabilny odczyt danych z uwzględnieniem kalibracji...")

def stabilny_odczyt(waga, ilosc_probek=15):
    odczyty = []
    
    for _ in range(ilosc_probek):
        odczyty.append(waga.read())
        # HX711 standardowo wykonuje 10 pomiarów na sekundę, dajemy mu 100ms na wygenerowanie nowej wartości 
        time.sleep_ms(100) 
        
    # Sortujemy i odcinamy po 20% skrajnych wartości
    odczyty.sort()
    margines = ilosc_probek // 5 
    odczyty_czyste = odczyty[margines : -margines]
    
    # Wyliczamy ostateczną średnią z "czystego" środka
    srednia = sum(odczyty_czyste) // len(odczyty_czyste)
    return srednia

#Stałe dane do konfiguracji
TARA = -382711
WSPOLCZYNNIK = 419823

while True:
    # 1. Pobieramy uśredniony odczyt z czujnika
    surowy_odczyt = stabilny_odczyt(waga)
    
    # 2. Wyliczamy kilogramy i od razu mnożymy przez 1000, aby uzyskać gramy
    waga_g = ((surowy_odczyt - TARA) / WSPOLCZYNNIK) * 1000
    
    # 3. Blokujemy wartości ujemne przy pustej szali
    if waga_g < 0:
        waga_g = 0
    
    # 4. Wyświetlamy wynik w gramach, bez kłamliwych miejsc po przecinku (:.0f)
    print(f'{{"sensor_A": {waga_g:.0f}}}')

    # Sekunda przerwy przed kolejną serią pomiarową
    time.sleep(1)

