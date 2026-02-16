export type Weekday =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado";

export type UsaDayRow = {
  day: Weekday;
  plannedLbs: number;
  producedLbs: number;
  excessLbs: number;
};

export type CustomerProductionRow = {
  customer: string;
  plannedKg: number;
  producedKg: number;
  dispatched: boolean;
};

export type LatamAsiaDayRow = {
  day: Weekday;
  plannedKg: number;
  producedKg: number;
  details: CustomerProductionRow[];
};

export type WeeklyFreshData = {
  weekLabel: string;
  usa: UsaDayRow[];
  brazil: LatamAsiaDayRow[];
  china: LatamAsiaDayRow[];
};

export const weeklyFreshData: WeeklyFreshData = {
  weekLabel: "Semana 21",

  usa: [
    {
      day: "Lunes",
      plannedLbs: 220_000,
      producedLbs: 215_000,
      excessLbs: 8_000,
    },
    {
      day: "Martes",
      plannedLbs: 240_000,
      producedLbs: 248_000,
      excessLbs: 15_000,
    },
    {
      day: "Miércoles",
      plannedLbs: 230_000,
      producedLbs: 225_000,
      excessLbs: 4_000,
    },
    {
      day: "Jueves",
      plannedLbs: 250_000,
      producedLbs: 255_000,
      excessLbs: 12_000,
    },
    {
      day: "Viernes",
      plannedLbs: 260_000,
      producedLbs: 258_000,
      excessLbs: 6_000,
    },
    {
      day: "Sábado",
      plannedLbs: 180_000,
      producedLbs: 176_000,
      excessLbs: 3_000,
    },
  ],

  brazil: [
    {
      day: "Lunes",
      plannedKg: 55_000,
      producedKg: 52_000,
      details: [
        {
          customer: "Carrefour Brasil",
          plannedKg: 18_500,
          producedKg: 18_000,
          dispatched: true,
        },
        {
          customer: "Grupo Pão de Açúcar",
          plannedKg: 16_000,
          producedKg: 14_000,
          dispatched: false,
        },
        {
          customer: "Sonda / Distribuidor",
          plannedKg: 20_500,
          producedKg: 20_000,
          dispatched: true,
        },
      ],
    },
    {
      day: "Martes",
      plannedKg: 60_000,
      producedKg: 61_500,
      details: [
        {
          customer: "Atacadão",
          plannedKg: 22_000,
          producedKg: 22_000,
          dispatched: false,
        },
        {
          customer: "Assaí",
          plannedKg: 18_000,
          producedKg: 19_500,
          dispatched: false,
        },
        {
          customer: "Food Service BR",
          plannedKg: 20_000,
          producedKg: 20_000,
          dispatched: true,
        },
      ],
    },
    {
      day: "Miércoles",
      plannedKg: 58_000,
      producedKg: 56_000,
      details: [
        {
          customer: "Carrefour Brasil",
          plannedKg: 20_000,
          producedKg: 20_000,
          dispatched: true,
        },
        {
          customer: "Grupo Pão de Açúcar",
          plannedKg: 18_000,
          producedKg: 16_000,
          dispatched: true,
        },
        {
          customer: "Distribuidor SP",
          plannedKg: 20_000,
          producedKg: 20_000,
          dispatched: false,
        },
      ],
    },
    {
      day: "Jueves",
      plannedKg: 62_000,
      producedKg: 63_000,
      details: [
        {
          customer: "Atacadão",
          plannedKg: 25_000,
          producedKg: 25_000,
          dispatched: true,
        },
        {
          customer: "Assaí",
          plannedKg: 17_000,
          producedKg: 18_000,
          dispatched: true,
        },
        {
          customer: "Food Service BR",
          plannedKg: 20_000,
          producedKg: 20_000,
          dispatched: false,
        },
      ],
    },
    {
      day: "Viernes",
      plannedKg: 64_000,
      producedKg: 60_000,
      details: [
        {
          customer: "Carrefour Brasil",
          plannedKg: 24_000,
          producedKg: 24_000,
          dispatched: false,
        },
        {
          customer: "Grupo Pão de Açúcar",
          plannedKg: 18_000,
          producedKg: 16_000,
          dispatched: false,
        },
        {
          customer: "Distribuidor RJ",
          plannedKg: 22_000,
          producedKg: 20_000,
          dispatched: true,
        },
      ],
    },
    {
      day: "Sábado",
      plannedKg: 45_000,
      producedKg: 44_000,
      details: [
        {
          customer: "Atacadão",
          plannedKg: 18_000,
          producedKg: 18_000,
          dispatched: true,
        },
        {
          customer: "Assaí",
          plannedKg: 13_000,
          producedKg: 12_000,
          dispatched: true,
        },
        {
          customer: "Food Service BR",
          plannedKg: 14_000,
          producedKg: 14_000,
          dispatched: false,
        },
      ],
    },
  ],

  china: [
    {
      day: "Lunes",
      plannedKg: 38_000,
      producedKg: 36_500,
      details: [
        {
          customer: "Shanghai Distributor A",
          plannedKg: 15_000,
          producedKg: 14_000,
          dispatched: true,
        },
        {
          customer: "Beijing Retailer",
          plannedKg: 11_000,
          producedKg: 10_500,
          dispatched: false,
        },
        {
          customer: "Horeca CN",
          plannedKg: 12_000,
          producedKg: 12_000,
          dispatched: true,
        },
      ],
    },
    {
      day: "Martes",
      plannedKg: 40_000,
      producedKg: 41_000,
      details: [
        {
          customer: "Shanghai Distributor A",
          plannedKg: 16_000,
          producedKg: 16_000,
          dispatched: false,
        },
        {
          customer: "Guangzhou Retail",
          plannedKg: 12_000,
          producedKg: 12_000,
          dispatched: false,
        },
        {
          customer: "Horeca CN",
          plannedKg: 12_000,
          producedKg: 13_000,
          dispatched: true,
        },
      ],
    },
    {
      day: "Miércoles",
      plannedKg: 39_000,
      producedKg: 37_000,
      details: [
        {
          customer: "Beijing Retailer",
          plannedKg: 14_000,
          producedKg: 14_000,
          dispatched: true,
        },
        {
          customer: "Shanghai Distributor B",
          plannedKg: 11_000,
          producedKg: 11_000,
          dispatched: false,
        },
        {
          customer: "Horeca CN",
          plannedKg: 14_000,
          producedKg: 12_000,
          dispatched: true,
        },
      ],
    },
    {
      day: "Jueves",
      plannedKg: 41_000,
      producedKg: 42_500,
      details: [
        {
          customer: "Shanghai Distributor A",
          plannedKg: 18_000,
          producedKg: 18_000,
          dispatched: true,
        },
        {
          customer: "Guangzhou Retail",
          plannedKg: 12_000,
          producedKg: 12_500,
          dispatched: true,
        },
        {
          customer: "Horeca CN",
          plannedKg: 11_000,
          producedKg: 12_000,
          dispatched: false,
        },
      ],
    },
    {
      day: "Viernes",
      plannedKg: 42_000,
      producedKg: 40_000,
      details: [
        {
          customer: "Beijing Retailer",
          plannedKg: 14_000,
          producedKg: 14_000,
          dispatched: false,
        },
        {
          customer: "Shanghai Distributor B",
          plannedKg: 12_000,
          producedKg: 12_000,
          dispatched: false,
        },
        {
          customer: "Horeca CN",
          plannedKg: 16_000,
          producedKg: 14_000,
          dispatched: true,
        },
      ],
    },
    {
      day: "Sábado",
      plannedKg: 30_000,
      producedKg: 29_000,
      details: [
        {
          customer: "Shanghai Distributor A",
          plannedKg: 12_000,
          producedKg: 12_000,
          dispatched: true,
        },
        {
          customer: "Guangzhou Retail",
          plannedKg: 8_000,
          producedKg: 8_000,
          dispatched: true,
        },
        {
          customer: "Horeca CN",
          plannedKg: 10_000,
          producedKg: 9_000,
          dispatched: false,
        },
      ],
    },
  ],
};
