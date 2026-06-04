import time
import json
from machine import Pin
from hx711 import HX711 

class LoadCell:
    def __init__(self, name, pin_dt, pin_sck, tara, wspolczynnik, rozmiar_bufora=15):
        self.name = name
        self.tara = tara
        self.wspolczynnik = wspolczynnik
        self.rozmiar_bufora = rozmiar_bufora
        self.g = 9.81 
        
        self.waga = HX711(d_out=pin_dt, pd_sck=pin_sck)
        
        # Resetowanie i wybudzanie modułu
        self.waga.power_off()
        time.sleep_ms(1)
        self.waga.power_on()
        
        # Tworzymy pustą listę, która będzie naszym "oknem" średniej kroczącej
        self.bufor = []
        
        # Zapełniamy bufor startowy (zrobi to tylko raz przy uruchomieniu)
        while len(self.bufor) < self.rozmiar_bufora:
            if self.waga.is_ready():
                self.bufor.append(self.waga.read())
            time.sleep_ms(10)

    def is_ready(self):
        return self.waga.is_ready()

    def read_data(self):
        surowy_odczyt = self.waga.read()
        
        # Średnia krocząca 
        self.bufor.pop(0)                # Wyrzucamy najstarszy odczyt
        self.bufor.append(surowy_odczyt) # Dodajemy najświeższy
        
        # Kopiujemy i sortujemy bufor, żeby odrzucić skrajności 
        posortowane = sorted(self.bufor)
        margines = self.rozmiar_bufora // 5 
        
        if margines > 0:
            odczyty_czyste = posortowane[margines : -margines]
        else:
            odczyty_czyste = posortowane
            
        srednia = sum(odczyty_czyste) // len(odczyty_czyste)
        
        # Wyliczamy gramy
        waga_g = ((srednia - self.tara) / self.wspolczynnik) * 1000
        
        if waga_g < 0:
            waga_g = 0
            
        # Wyliczamy Niutony: masa w kilogramach * przyspieszenie ziemskie
        waga_N = (waga_g / 1000) * self.g
        
        return {
            f"{self.name}_g": int(waga_g),
            f"{self.name}_N": waga_N
        }


def main():
    print("System gotowy. Start odczytów...")
    
    # Inicjalizacja czujników z danymi z kalibracji
    czujniki = [
        LoadCell(
            name="sensor_A",
            pin_dt=2, 
            pin_sck=3,
            tara=-346790,
            wspolczynnik=973382,
            rozmiar_bufora=20
        ),
        LoadCell(
            name="sensor_B",
            pin_dt=4, 
            pin_sck=5,
            tara=-53350, 
            wspolczynnik=896836, 
            rozmiar_bufora=20
        ),
        LoadCell(
            name="sensor_C",
            pin_dt=6, 
            pin_sck=7,
            tara=-97180,
            wspolczynnik=981618, 
            rozmiar_bufora=20
        )
    ]
    
    # Konfiguracja czujników 
    config_msg = {
        "type": "config",
        "sensors": [
            {"id": "sensor_A", "label": "Belka (A)"},
            {"id": "sensor_B", "label": "Belka (B)"},
            {"id": "sensor_C", "label": "Belka (C)"}
        ]
    }
    print(json.dumps(config_msg))
    
    ostatnie_odczyty = {}
    last_config_time = time.ticks_ms()
    
    while True:
        zaktualizowano = False
        
        for czujnik in czujniki:
            if czujnik.is_ready():
                dane = czujnik.read_data()
                ostatnie_odczyty.update(dane)
                zaktualizowano = True
                
        # Jeśli którykolwiek czujnik podał nowe dane, wysyłamy połączoną paczkę JSON
        if zaktualizowano and ostatnie_odczyty:
            json_parts = []
            for k, v in ostatnie_odczyty.items():
                if isinstance(v, float):
                    json_parts.append(f'"{k}": {v:.2f}')
                else:
                    json_parts.append(f'"{k}": {v}')
            
            print("{" + ", ".join(json_parts) + "}")

        # Wysyłamy konfigurację co 5 sekund
        if time.ticks_diff(time.ticks_ms(), last_config_time) > 5000:
            print(json.dumps(config_msg))
            last_config_time = time.ticks_ms()

        time.sleep_ms(1)

if __name__ == "__main__":
    main()