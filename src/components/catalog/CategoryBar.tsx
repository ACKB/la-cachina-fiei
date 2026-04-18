"use client";

/**
 * CategoryBar.tsx — Barra horizontal de categorías con scroll
 *
 * Renderiza píldoras de categoría con íconos. Está pensado para
 * ser manejado por el componente padre (CatalogClient) mediante
 * props de estado controlado.
 */

import { type LucideIcon } from "lucide-react";
import {
  Cpu,
  CircuitBoard,
  Mic,
  Camera,
  Battery,
  Wrench,
  Radio,
  Cable,
  Thermometer,
  Package,
} from "lucide-react";

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  emoji?: string;
  /** Palabras clave que deben aparecer en category.name (case-insensitive) */
  match: string[];
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  label: string;
  /** Palabras clave para filtrar en product.title (case-insensitive) */
  match: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: "microcontroladores",
    label: "Microcontroladores",
    icon: Cpu,
    match: ["microcontrolador", "micro", "mcu"],
    subcategories: [
      { id: "esp32", label: "ESP32", match: ["esp32"] },
      { id: "esp32s3", label: "ESP32-S3", match: ["esp32-s3", "esp32s3"] },
      { id: "esp8266", label: "ESP8266", match: ["esp8266"] },
      { id: "arduino-nano", label: "Arduino Nano", match: ["arduino nano"] },
      { id: "arduino-mega", label: "Arduino Mega", match: ["arduino mega"] },
      { id: "stm32", label: "STM32", match: ["stm32"] },
      {
        id: "arduino-uno",
        label: "Arduino Uno",
        match: ["arduino uno", "arduino r3"],
      },
      { id: "attiny", label: "ATtiny", match: ["attiny"] },
    ],
  },
  {
    id: "placas",
    label: "Placas de Desarrollo",
    icon: CircuitBoard,
    match: ["placa", "board", "sbc"],
    subcategories: [
      {
        id: "rpi4",
        label: "Raspberry Pi 4",
        match: ["raspberry pi 4", "rpi4", "rpi 4"],
      },
      {
        id: "rpi5",
        label: "Raspberry Pi 5",
        match: ["raspberry pi 5", "rpi5"],
      },
      {
        id: "rpi-pico",
        label: "Raspberry Pi Pico",
        match: ["raspberry pi pico", "rpi pico", "pico w"],
      },
      {
        id: "jetson-nano",
        label: "Jetson Nano",
        match: ["jetson nano", "jetson"],
      },
      {
        id: "orange-pi",
        label: "Orange Pi",
        match: ["orange pi", "orangepi"],
      },
      { id: "banana-pi", label: "Banana Pi", match: ["banana pi"] },
    ],
  },
  {
    id: "microfonos",
    label: "Micrófonos",
    icon: Mic,
    match: ["micrófono", "microfono", "mic", "audio"],
    subcategories: [
      {
        id: "inmp441",
        label: "INMP441 (I2S)",
        match: ["inmp441", "inmp 441"],
      },
      { id: "max4466", label: "MAX4466", match: ["max4466"] },
      { id: "max9814", label: "MAX9814", match: ["max9814"] },
      { id: "ky-038", label: "KY-038", match: ["ky-038", "ky038"] },
    ],
  },
  {
    id: "camaras",
    label: "Cámaras",
    icon: Camera,
    match: ["cámara", "camara", "camera", "cam"],
    subcategories: [
      { id: "ov2640", label: "OV2640", match: ["ov2640"] },
      { id: "ov7670", label: "OV7670", match: ["ov7670"] },
      {
        id: "pi-camera",
        label: "Pi Camera",
        match: ["pi camera", "pi cam", "picamera"],
      },
      { id: "usb-cam", label: "USB Cam", match: ["usb cam", "webcam"] },
    ],
  },
  {
    id: "sensores",
    label: "Sensores",
    icon: Thermometer,
    match: ["sensor", "sensores"],
    subcategories: [
      { id: "dht22", label: "DHT22", match: ["dht22", "dht 22"] },
      { id: "dht11", label: "DHT11", match: ["dht11"] },
      { id: "mpu6050", label: "MPU6050", match: ["mpu6050", "mpu 6050"] },
      { id: "hcsr04", label: "HC-SR04", match: ["hc-sr04", "hcsr04"] },
      { id: "bmp180", label: "BMP180", match: ["bmp180"] },
      { id: "pir", label: "PIR", match: ["pir"] },
    ],
  },
  {
    id: "baterias",
    label: "Baterías",
    icon: Battery,
    match: ["batería", "bateria", "lipo", "lion", "battery"],
    subcategories: [
      { id: "lipo", label: "LiPo", match: ["lipo"] },
      { id: "18650", label: "18650", match: ["18650"] },
      { id: "powerbank", label: "Power Bank", match: ["power bank"] },
      {
        id: "tp4056",
        label: "Módulo TP4056",
        match: ["tp4056", "tp 4056"],
      },
    ],
  },
  {
    id: "radio",
    label: "RF / Wireless",
    icon: Radio,
    match: ["rf", "radio", "wireless", "wifi", "lora", "bluetooth", "zigbee"],
    subcategories: [
      {
        id: "nrf24",
        label: "nRF24L01",
        match: ["nrf24", "nrf 24", "nrf24l01"],
      },
      { id: "lora", label: "LoRa", match: ["lora", "sx1276", "sx1278"] },
      { id: "hc05", label: "HC-05/HC-06", match: ["hc-05", "hc05", "hc-06"] },
      { id: "sim800", label: "SIM800", match: ["sim800", "gsm"] },
    ],
  },
  {
    id: "herramientas",
    label: "Herramientas",
    icon: Wrench,
    match: ["herramienta", "tool", "soldador", "multímetro", "multimetro"],
    subcategories: [
      { id: "soldador", label: "Soldador", match: ["soldador"] },
      { id: "multimetro", label: "Multímetro", match: ["multímetro", "multimetro"] },
      {
        id: "osciloscopio",
        label: "Osciloscopio",
        match: ["osciloscopio", "oscilloscope"],
      },
      { id: "fuente", label: "Fuente de poder", match: ["fuente de poder", "psu"] },
    ],
  },
  {
    id: "cables",
    label: "Cables y Conectores",
    icon: Cable,
    match: ["cable", "conector", "dupont", "jumper"],
    subcategories: [
      { id: "dupont", label: "Dupont/Jumper", match: ["dupont", "jumper"] },
      { id: "usb", label: "USB", match: ["usb"] },
      { id: "hdmi", label: "HDMI", match: ["hdmi"] },
    ],
  },
  {
    id: "otros",
    label: "Otros",
    icon: Package,
    match: [],
    subcategories: [],
  },
];

interface CategoryBarProps {
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
}

export default function CategoryBar({
  activeCategory,
  onSelect,
}: CategoryBarProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-1">
      <div className="flex items-center gap-2 w-max px-1 pb-1">
        {/* Botón "Todos" */}
        <button
          onClick={() => onSelect(null)}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
            whitespace-nowrap transition-all duration-200 border
            ${
              activeCategory === null
                ? "bg-orange-600 text-white border-orange-600 shadow-sm shadow-orange-200 dark:shadow-orange-900/40"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400"
            }
          `}
        >
          <span>🏷️</span>
          <span>Todos</span>
        </button>

        {/* Categorías */}
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(isActive ? null : cat.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                whitespace-nowrap transition-all duration-200 border
                ${
                  isActive
                    ? "bg-orange-600 text-white border-orange-600 shadow-sm shadow-orange-200 dark:shadow-orange-900/40"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400"
                }
              `}
            >
              <Icon size={14} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
