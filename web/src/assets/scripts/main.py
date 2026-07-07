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
        
        # Poprawiony czas resetu 10ms pozwala na czysty start układu
        self.waga.power_off()
        time.sleep_ms(10)
        self.waga.power_on()
        
        self.bufor = []

    def is_ready(self):
        return self.waga.is_ready()

    def read_data(self):
        surowy_odczyt = self.waga.read()
        
        # Bezpieczna średnia krocząca, działa nawet gdy bufor jeszcze nie jest pełny
        self.bufor.append(surowy_odczyt)
        if len(self.bufor) > self.rozmiar_bufora:
            self.bufor.pop(0) 
        
        posortowane = sorted(self.bufor)
        
        # Skrajności odrzucamy dopiero, gdy mamy wystarczająco dużo danych w buforze
        margines = len(posortowane) // 5 
        
        if margines > 0:
            odczyty_czyste = posortowane[margines : -margines]
        else:
            odczyty_czyste = posortowane
            
        srednia = sum(odczyty_czyste) // len(odczyty_czyste)
        
        waga_g = ((srednia - self.tara) / self.wspolczynnik) * 1000
            
        waga_N = (waga_g / 1000) * self.g
        
        return {
            f"{self.name}_g": int(waga_g),
            f"{self.name}_N": waga_N
        }


def main():
    print("System gotowy. Start odczytów...")
    
    czujniki = [
      LoadCell(
            name="sensor_A",
            pin_dt=4,  
            pin_sck=5,
            tara=2382072,
            wspolczynnik=-971,      
            rozmiar_bufora=20
        ),
        LoadCell(
            name="sensor_B",
            pin_dt=7,  
            pin_sck=8,
            tara=-489565, 
            wspolczynnik=-598912,   
            rozmiar_bufora=20
        ),
        LoadCell(
            name="sensor_C",
            pin_dt=14,  
            pin_sck=15,
            tara=112139,
            wspolczynnik=633048,
            rozmiar_bufora=20
        ),
        LoadCell(
            name="sensor_D",
            pin_dt=12,  
            pin_sck=13,
            tara=3046894,
            wspolczynnik=503531,      
            rozmiar_bufora=20
        )
    ]
    
    config_msg = {
        "type": "config",
        "sensors": [
            {"id": "sensor_A", "label": "Belka (A)"},
            {"id": "sensor_B", "label": "Belka (B)"},
            {"id": "sensor_C", "label": "Belka (C)"},
            {"id": "sensor_D", "label": "Belka (D)"}
        ]
    }
    print(json.dumps(config_msg))
    
    ostatnie_odczyty = {}
    last_config_time = time.ticks_ms()
    last_json_time = time.ticks_ms()
    
    while True:
        now = time.ticks_ms()
        
        # 1. Odczyt dostępnych danych w tle
        for czujnik in czujniki:
            if czujnik.is_ready():
                dane = czujnik.read_data()
                ostatnie_odczyty.update(dane)
        
        # 2. Wysyłka danych pomiarowych z rygorem czasowym (co 250ms -> 4Hz)
        if time.ticks_diff(now, last_json_time) > 250:
            if ostatnie_odczyty:
                json_parts = []
                for k, v in ostatnie_odczyty.items():
                    if isinstance(v, float):
                        json_parts.append(f'"{k}": {v:.2f}')
                    else:
                        json_parts.append(f'"{k}": {v}')
                
                print("{" + ", ".join(json_parts) + "}")
            last_json_time = now

        # 3. Wysyłka konfiguracji co 5 sekund
        if time.ticks_diff(now, last_config_time) > 5000:
            print(json.dumps(config_msg))
            last_config_time = now

        time.sleep_ms(20)

if __name__ == "__main__":
    main()