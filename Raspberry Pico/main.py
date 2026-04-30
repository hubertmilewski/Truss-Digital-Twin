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

print("Start...")

# Stałe dane do konfiguracji
TARA = -382711
WSPOLCZYNNIK = 419823
ROZMIAR_BUFORA = 15

# Przyspieszenie ziemskie do obliczeń Niutonów
G = 9.81 

# Tworzymy pustą listę, która będzie naszym "oknem" średniej kroczącej
bufor = []

# Zapełniamy bufor startowy (zrobi to tylko raz przy uruchomieniu)
while len(bufor) < ROZMIAR_BUFORA:
    if waga.is_ready():
        bufor.append(waga.read())
    time.sleep_ms(10)

while True:
    # Zamiast time.sleep, po prostu sprawdzamy, czy układ ma dane
    if waga.is_ready(): 
        
        surowy_odczyt = waga.read()
        
        # Średnia krocząca 
        bufor.pop(0)          # Wyrzucamy najstarszy odczyt
        bufor.append(surowy_odczyt) # Dodajemy najświeższy
        
        # Kopiujemy i sortujemy bufor, żeby odrzucić skrajności 
        posortowane = sorted(bufor)
        margines = ROZMIAR_BUFORA // 5 
        odczyty_czyste = posortowane[margines : -margines]
        
        srednia = sum(odczyty_czyste) // len(odczyty_czyste)
        
        # Wyliczamy gramy
        waga_g = ((srednia - TARA) / WSPOLCZYNNIK) * 1000
        
        if waga_g < 0:
            waga_g = 0
            
        # Wyliczamy Niutony: masa w kilogramach * przyspieszenie ziemskie
        waga_N = (waga_g / 1000) * G
            
        # Wysyłamy paczkę JSON do aplikacji z dwiema wartościami
        print(f'{{"sensor_A_g": {waga_g:.0f}, "sensor_A_N": {waga_N:.2f}}}')

    # Minimalne opóźnienie (1 milisekunda), aby nie spalić procesora Pico
    time.sleep_ms(1)
