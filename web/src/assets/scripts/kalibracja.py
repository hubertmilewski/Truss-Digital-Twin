import time
from machine import Pin
from hx711 import HX711

# Szybka konfiguracja pinów 
konfiguracja_pinow = [
    {"name": "sensor_X", "dt": x, "sck": y},
]

# Inicjalizacja obiektów HX711
czujniki = []
for cfg in konfiguracja_pinow:
    hx = HX711(d_out=cfg["dt"], pd_sck=cfg["sck"])
    hx.power_off()
    time.sleep_ms(10)
    hx.power_on()
    czujniki.append({"name": cfg["name"], "driver": hx})

print("Rozpoczęcie odczytu SUROWYCH danych ADC.")
print("Format: Nazwa_Czujnika -> Surowa_Wartosc")
print("----------------------------------------")

while True:
    for czujnik in czujniki:
        hx = czujnik["driver"]
        if hx.is_ready():
            surowy_odczyt = hx.read()
            print(f"{czujnik['name']}: {surowy_odczyt}")
            
    time.sleep_ms(200) # Spokojny odczyt 5 razy na sekundę