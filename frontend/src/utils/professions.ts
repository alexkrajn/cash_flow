import type { Profession } from '@/types';

export const professions: Profession[] = [
  {
    "id": "doctor",
    "name": "Врач",
    "description": "Ставите диагнозы по гуглу, выписываете аспирин от всего.",
    "salary": 13200,
    "taxes": 3420,
    "otherExpenses": 6230,
    "childExpenses": 640,
    "totalExpenses": 9650,
    "cashFlow": 3550
  },
  {
    "id": "truck_driver",
    "name": "Водитель грузовика",
    "description": "Знаете все лучшие шашлычные вдоль трассы.",
    "salary": 2500,
    "taxes": 460,
    "otherExpenses": 1160,
    "childExpenses": 140,
    "totalExpenses": 1620,
    "cashFlow": 880
  },
  {
    "id": "police_officer",
    "name": "Офицер полиции",
    "description": "Любите мигалки, но ненавидите отчётность.",
    "salary": 3000,
    "taxes": 580,
    "otherExpenses": 1300,
    "childExpenses": 160,
    "totalExpenses": 1880,
    "cashFlow": 1120
  },
  {
    "id": "engineer",
    "name": "Конструктор",
    "description": "Рисуете чертежи, которые понимаете только вы.",
    "salary": 4900,
    "taxes": 1050,
    "otherExpenses": 2160,
    "childExpenses": 250,
    "totalExpenses": 3210,
    "cashFlow": 1690
  },
  {
    "id": "lawyer",
    "name": "Адвокат",
    "description": "Мастерски спорите даже с навигатором.",
    "salary": 7500,
    "taxes": 1830,
    "otherExpenses": 3590,
    "childExpenses": 640,
    "totalExpenses": 5420,
    "cashFlow": 2080
  },
  {
    "id": "pilot",
    "name": "Пилот",
    "description": "Считаете пробки только на взлётной полосе.",
    "salary": 9500,
    "taxes": 2350,
    "otherExpenses": 4550,
    "childExpenses": 480,
    "totalExpenses": 6900,
    "cashFlow": 2600
  },
  {
    "id": "office_manager",
    "name": "Офис-менеджер",
    "description": "Знаете пароль от Wi-Fi и судьбы всех сотрудников.",
    "salary": 4600,
    "taxes": 910,
    "otherExpenses": 2020,
    "childExpenses": 240,
    "totalExpenses": 2930,
    "cashFlow": 1670
  },
  {
    "id": "teacher",
    "name": "Учитель",
    "description": "Объясняете одно и то же 20 раз в день — и всё равно слышите «а можно ещё раз?».",
    "salary": 3300,
    "taxes": 630,
    "otherExpenses": 1560,
    "childExpenses": 180,
    "totalExpenses": 2190,
    "cashFlow": 1110
  },
  {
    "id": "secretary",
    "name": "Секретарь",
    "description": "Мастер звонков, кофе и слухов в одном лице.",
    "salary": 2500,
    "taxes": 460,
    "otherExpenses": 1160,
    "childExpenses": 140,
    "totalExpenses": 1620,
    "cashFlow": 880
  },
  {
    "id": "mechanic",
    "name": "Механик",
    "description": "Можете починить машину скотчем и молитвой.",
    "salary": 2000,
    "taxes": 360,
    "otherExpenses": 920,
    "childExpenses": 110,
    "totalExpenses": 1280,
    "cashFlow": 720
  },
  {
    "id": "nurse",
    "name": "Медсестра",
    "description": "Колете уколы с точностью снайпера.",
    "salary": 3100,
    "taxes": 600,
    "otherExpenses": 1380,
    "childExpenses": 170,
    "totalExpenses": 1980,
    "cashFlow": 1120
  },
  {
    "id": "janitor",
    "name": "Швейцар",
    "description": "Главный эксперт по дверям и чужим секретам.",
    "salary": 1600,
    "taxes": 280,
    "otherExpenses": 670,
    "childExpenses": 70,
    "totalExpenses": 950,
    "cashFlow": 650
  }
];

export function getProfessionById(id: string): Profession | undefined {
  return professions.find(p => p.id === id);
}
