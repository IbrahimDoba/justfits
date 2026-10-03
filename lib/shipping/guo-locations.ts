// GUO Logistics centers across Nigeria, transcribed from GUO's "Our Locations"
// flyer (Sept 2026). Keyed by the state slugs used in checkout and admin
// settings. States without an entry have no GUO center yet — customers there
// are served via the nearest listed center.

export const GUO_CARRIER_NAME = "GUO Logistics";

export interface GuoCenter {
  branch: string;
  address: string;
  phones: string[];
}

export const GUO_CENTERS: Record<string, GuoCenter[]> = {
  abia: [
    {
      branch: "Aba",
      address: "23 Milverton Avenue, Aba",
      phones: ["0915 806 6911"],
    },
    {
      branch: "Umuahia",
      address: "50 Mission Hill, Opp. Gado Hotels, Umuahia",
      phones: ["0815 088 2596"],
    },
  ],
  abuja: [
    {
      branch: "Gwarinpa",
      address:
        "House 110 Opposite Goshen International Academy, 4th Avenue along Chambia Plaza Road, Gwarinpa",
      phones: ["0810 360 5276", "0815 088 2574"],
    },
    {
      branch: "Gwarinpa 1st Avenue",
      address:
        'Suite A10, D Convergence by Bricks "n" More Plaza, Block B, 1st Avenue, off 14 Road, opposite Fidelity Bank, Gwarinpa',
      phones: ["0807 514 4288"],
    },
    {
      branch: "Kubwa",
      address: "Lora Mall Plaza, Plot 132 Gado Nasko Rd, Phase 2, Kubwa",
      phones: ["0811 889 0844"],
    },
    {
      branch: "Lugbe",
      address: "Shop 4, De-Ideal Plaza, Beside Wema Bank, FHA, Lugbe",
      phones: ["0703 428 7760"],
    },
    {
      branch: "Mararaba",
      address:
        "Suite 9, Bomma Plaza, Sharp Corner by Criss Park Junction, Abuja-Keffi Exp. Way",
      phones: ["0703 038 0316"],
    },
    {
      branch: "Utako",
      address: "GOUBA Plaza, 15 A. E. Ekukinam Street, Utako District, Abuja",
      phones: ["0704 906 2902", "0705 889 1917"],
    },
    {
      branch: "Wuse 2",
      address:
        "RUBY CENTER, Suite 107 (First Floor), Plot 762 Aminu Kano Crescent beside BANEX, Wuse 2, Abuja",
      phones: ["0915 304 0321"],
    },
    {
      branch: "Zuba",
      address: "Lagos Park, Zuba, Abuja",
      phones: ["0706 290 7173"],
    },
  ],
  "akwa-ibom": [
    {
      branch: "Uyo",
      address:
        "KM 9 Ikot-Ekpene/Uyo Highway by Water Board, Ekit-Itam, Itu, Akwa-Ibom State",
      phones: ["0810 097 2737"],
    },
  ],
  anambra: [
    {
      branch: "Awka",
      address:
        "GUO Transport Co, UNIZIK Junction, beside Mobil filling station, opposite Akuzuluora Plaza, Awka",
      phones: ["0805 404 9220"],
    },
    {
      branch: "Ekwulobia",
      address: "7 Awka Road, Ekwulobia",
      phones: ["0815 088 2226"],
    },
    {
      branch: "Ihiala",
      address: "42 Onitsha-Owerri Rd, by Patigian Hotels Ltd, Ihiala",
      phones: ["0815 088 2573"],
    },
    {
      branch: "Nnewi",
      address: "2 Ibeto Road, Opp. First Bank PLC, Nnewi",
      phones: ["0707 179 4815"],
    },
    {
      branch: "Onitsha Upper Iweka",
      address: "166 Port-Harcourt Rd, Upper Iweka, Onitsha",
      phones: ["0913 511 2989"],
    },
    {
      branch: "Onitsha New Market Road",
      address: "41 New Market Road, opp UBA Head Office, Onitsha",
      phones: ["0705 889 1941"],
    },
    {
      branch: "Umunze",
      address: "Umunze Roundabout, Umunze",
      phones: ["0815 088 2595"],
    },
  ],
  "cross-river": [
    {
      branch: "Ogoja",
      address:
        "4B Okuku Rd, Igoli Ogoja, Opp. OverComers Church, before Montaji Filling Station",
      phones: ["0808 884 1526"],
    },
  ],
  delta: [
    {
      branch: "Asaba HeadBridge",
      address: "Asaba-Onitsha Expressway, by Head-Bridge, Asaba",
      phones: ["0813 416 0084"],
    },
    {
      branch: "Asaba Town",
      address:
        "Suite 6, Independence Mall, beside Villa Toscana Hotel, Okpanam Road, Asaba",
      phones: ["0913 431 1560"],
    },
    {
      branch: "Asaba-Koka",
      address:
        "Asaba-Onitsha Expressway, beside former Road Safety Office, Koka, Asaba, Delta State",
      phones: [],
    },
  ],
  ebonyi: [
    {
      branch: "Abakaliki",
      address: "GUO Terminal, New Park (Opp Int'l Market), Abakaliki",
      phones: [],
    },
    {
      branch: "Afikpo",
      address: "27 Eke Market Road, Opp. Zenith Bank, Afikpo, Ebonyi State",
      phones: [],
    },
  ],
  edo: [
    {
      branch: "Benin City",
      address:
        "211 Ugbowo-Lagos Road, by Technical College Junction, Benin City",
      phones: ["0705 197 4682"],
    },
  ],
  enugu: [
    {
      branch: "Enugu",
      address: "34 Okpara Avenue (between UBA & Polaris Bank), Enugu",
      phones: ["0815 088 2571", "0706 648 3775"],
    },
  ],
  imo: [
    {
      branch: "Akokwa",
      address: "10 Orlu Rd, by Akokwa Roundabout, by Akokwa MFB, Akokwa",
      phones: ["0905 382 8358"],
    },
    {
      branch: "Orlu",
      address: "7 Asika Ilobi Avenue, Opp. NEPA Office, Orlu",
      phones: ["0810 480 5017"],
    },
    {
      branch: "Owerri",
      address: "15 Egbu Road, Owerri",
      phones: ["0905 535 7904"],
    },
  ],
  kaduna: [
    {
      branch: "Kaduna",
      address: "Mando Park, off NAF, Television Park, Kaduna",
      phones: ["0815 084 7385"],
    },
    {
      branch: "Zaria",
      address:
        "Shop 8, Block C, Nasiru El-Rufai Central Motor Park, Yankarfe, Sabon-Gari LGA, Zaria, Kaduna State",
      phones: ["0705 197 4867"],
    },
  ],
  kano: [
    {
      branch: "Kano",
      address: "14 New Road, Sabon-Gari, Kano",
      phones: [],
    },
  ],
  lagos: [
    {
      branch: "Agege",
      address: "3 Agunbiade Street, Oke-Koto, Agege",
      phones: ["0906 383 5884"],
    },
    {
      branch: "Ajah",
      address:
        "KM 22 Lekki-Epe Exp. Road beside Abraham Adesanya Estate, Ajah",
      phones: ["0903 062 9919"],
    },
    {
      branch: "Ajah (Addo Road)",
      address:
        "Shodiya Odunlami Plaza, Shop 3 & 4 (opp. Kekere Bus Stop) along Addo Road, Ajah",
      phones: ["0805 814 9831"],
    },
    {
      branch: "Alaba",
      address:
        "29 Ojo Ebegbede Road, Alaba International Market, opp. Chemist Bus Stop, Alaba",
      phones: ["0706 254 9204"],
    },
    {
      branch: "Amuwo",
      address:
        "Shop 11, Lawfel Mall beside BurgerKing, Festac Access Rd, Amuwo Odofin, Lagos",
      phones: ["0705 229 0062"],
    },
    {
      branch: "Balogun",
      address:
        "1st Floor, Alatise Plaza, Opp No. 33 7UP Plaza, Balogun Market, Lagos",
      phones: ["0705 954 8851", "0813 454 1535"],
    },
    {
      branch: "Cele/Okota",
      address: "164 Okota Road, Okota, Cele",
      phones: ["0815 084 7392", "0905 390 0041"],
    },
    {
      branch: "Coker/Alafia",
      address: "KM 3 Badagry Expressway, Wema Bank Bus Stop, Coker",
      phones: [],
    },
    {
      branch: "Ejigbo",
      address: "67A Ikotun-Egbe Road, Opp Power Line B/Stop, Ejigbo",
      phones: ["0903 603 3122"],
    },
    {
      branch: "Iba",
      address: "1 Ipaye Street, Iyana-Iba, Iba",
      phones: ["0813 967 9915"],
    },
    {
      branch: "Ikeja",
      address:
        "Essencee House, 4 Kodesho Street, after Cash'N'Carry, opp. Computer Village Flyover, Ikeja, Lagos",
      phones: ["0805 886 8149"],
    },
    {
      branch: "Ikotun",
      address: "10 Ijegun Road, Ikotun",
      phones: ["0811 889 0843"],
    },
    {
      branch: "Ikorodu",
      address:
        "37 Sagamu Road, beside Ikorodu Police Station (Old Powa Shopping Complex), Ikorodu",
      phones: ["0915 733 8891"],
    },
    {
      branch: "Ikosi-Ketu",
      address:
        "B. Sanwo-Olu International Market, Shop 14 & 15, Prince S. Olujobi Block, Ikosi-Ketu, Lagos",
      phones: ["0805 814 9866"],
    },
    {
      branch: "Iyana-Ipaja",
      address:
        "KM 168 Abeokuta Expressway / No 1 Tijani Street beside Access Bank, Iyana Ipaja Bus Stop, Iyana Ipaja, Lagos State",
      phones: ["0818 133 8014"],
    },
    {
      branch: "Jibowu",
      address:
        "2 Jibowu St, along Ikorodu Expressway, beside Chicken Republic, Jibowu",
      phones: ["0705 889 1918"],
    },
    {
      branch: "Lekki (Admiralty)",
      address:
        "Admiralty Mall, Block 10, Plot 1 Admiralty Road (Opp. UPBEAT), Lekki Phase 1, Lagos",
      phones: ["0705 889 1916"],
    },
    {
      branch: "Lekki (Osapa)",
      address: "Shore Mall, 5 Ganiu Eletu Way, Osapa, Lekki II",
      phones: ["0905 801 1851"],
    },
    {
      branch: "Lekki (Orchid Road)",
      address:
        "Unicity Mall, Shop A10, Oba Akinloye Dr (Orchid Road), Lekki Peninsula II",
      phones: ["0915 654 2373"],
    },
    {
      branch: "Maza-Maza",
      address:
        "61 Old Ojo Rd, opp. 1st Gate Bus Stop, Badagry Expressway, Maza-Maza",
      phones: ["0905 426 9460"],
    },
    {
      branch: "Osapa-London",
      address: "Shore Mall, 6 Ganiu Eletu Way, Osapa, Lekki II",
      phones: ["0905 801 1851", "0700 012 1000"],
    },
    {
      branch: "Otto",
      address: "7 Railway Compound, Otto B/Stop, opp. Police Barracks, Otto",
      phones: [],
    },
    {
      branch: "Surulere",
      address: "44 Ogunlana Drive, Surulere",
      phones: ["0805 886 8174"],
    },
    {
      branch: "Trade Fair",
      address:
        "Shop D51-52, Akwa-Ibom Plaza, Balogun International Market, Trade Fair Complex, Lagos",
      phones: ["0705 137 2664"],
    },
  ],
  plateau: [
    {
      branch: "Jos",
      address: "Old Railway, Jos",
      phones: [],
    },
  ],
  rivers: [
    {
      branch: "Port Harcourt (Rumuomasi)",
      address:
        "PHC-Aba Expressway (at intersection with Lord Emmanuel Drive b/w Thermocool & Big Treat), Opp Air Force Base, Rumuomasi, Port-Harcourt",
      phones: ["0815 088 2225"],
    },
    {
      branch: "Port Harcourt (Ada George)",
      address:
        "9 Ada George Road (opp OPM Free School), Port Harcourt, Rivers State",
      phones: [],
    },
    {
      branch: "Choba",
      address:
        "Anwuri Pavilion (inside Heimans Filling Station, opposite iPress, near Today FM), East-West Rd/Rumuji-Mpakurche Rd, Alakahia, Port Harcourt",
      phones: ["0903 721 7071"],
    },
  ],
  taraba: [
    {
      branch: "Jalingo",
      address: "Along Mile 6, Opp. Coca-Cola Depot, Yola Road, Jalingo",
      phones: [],
    },
  ],
};

export function getGuoCenters(stateSlug: string): GuoCenter[] {
  return GUO_CENTERS[stateSlug] ?? [];
}
