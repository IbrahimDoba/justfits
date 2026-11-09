// All 36 states + FCT, keyed by the slugs checkout, shipping zones and GUO
// centers use. `cities` lets free-text lookups ("PH", "Ibadan", "Lekki")
// resolve to a state.

export interface NigerianState {
  slug: string;
  label: string;
  cities: string[];
}

export const NIGERIAN_STATES: NigerianState[] = [
  { slug: "abia", label: "Abia", cities: ["Aba", "Umuahia"] },
  { slug: "abuja", label: "Abuja (FCT)", cities: ["FCT", "Gwarinpa", "Kubwa", "Lugbe", "Wuse", "Garki", "Maitama", "Asokoro", "Utako", "Zuba", "Mararaba", "Jabi"] },
  { slug: "adamawa", label: "Adamawa", cities: ["Yola", "Mubi"] },
  { slug: "akwa-ibom", label: "Akwa Ibom", cities: ["Uyo", "Eket", "Ikot Ekpene"] },
  { slug: "anambra", label: "Anambra", cities: ["Awka", "Onitsha", "Nnewi", "Ekwulobia", "Ihiala"] },
  { slug: "bauchi", label: "Bauchi", cities: [] },
  { slug: "bayelsa", label: "Bayelsa", cities: ["Yenagoa"] },
  { slug: "benue", label: "Benue", cities: ["Makurdi", "Otukpo"] },
  { slug: "borno", label: "Borno", cities: ["Maiduguri"] },
  { slug: "cross-river", label: "Cross River", cities: ["Calabar", "Ogoja"] },
  { slug: "delta", label: "Delta", cities: ["Asaba", "Warri", "Sapele", "Ughelli"] },
  { slug: "ebonyi", label: "Ebonyi", cities: ["Abakaliki", "Afikpo"] },
  { slug: "edo", label: "Edo", cities: ["Benin", "Benin City", "Auchi", "Ekpoma"] },
  { slug: "ekiti", label: "Ekiti", cities: ["Ado Ekiti"] },
  { slug: "enugu", label: "Enugu", cities: ["Nsukka"] },
  { slug: "gombe", label: "Gombe", cities: [] },
  { slug: "imo", label: "Imo", cities: ["Owerri", "Orlu", "Okigwe"] },
  { slug: "jigawa", label: "Jigawa", cities: ["Dutse"] },
  { slug: "kaduna", label: "Kaduna", cities: ["Zaria", "Kafanchan"] },
  { slug: "kano", label: "Kano", cities: [] },
  { slug: "katsina", label: "Katsina", cities: [] },
  { slug: "kebbi", label: "Kebbi", cities: ["Birnin Kebbi"] },
  { slug: "kogi", label: "Kogi", cities: ["Lokoja", "Okene"] },
  { slug: "kwara", label: "Kwara", cities: ["Ilorin", "Offa"] },
  { slug: "lagos", label: "Lagos", cities: ["Ikeja", "Lekki", "Ajah", "Victoria Island", "VI", "Ikoyi", "Yaba", "Surulere", "Ikorodu", "Agege", "Festac", "Apapa", "Oshodi", "Ikotun", "Egbeda", "Gbagada", "Maryland", "Magodo", "Ojo", "Alaba", "Badagry", "Epe", "Sangotedo", "Chevron", "Ketu", "Ogba"] },
  { slug: "nasarawa", label: "Nasarawa", cities: ["Lafia", "Keffi"] },
  { slug: "niger", label: "Niger", cities: ["Minna", "Suleja", "Bida"] },
  { slug: "ogun", label: "Ogun", cities: ["Abeokuta", "Ijebu Ode", "Sagamu", "Ota", "Mowe", "Ibafo", "Sango"] },
  { slug: "ondo", label: "Ondo", cities: ["Akure", "Owo"] },
  { slug: "osun", label: "Osun", cities: ["Osogbo", "Ile Ife", "Ife", "Ilesa"] },
  { slug: "oyo", label: "Oyo", cities: ["Ibadan", "Ogbomoso"] },
  { slug: "plateau", label: "Plateau", cities: ["Jos"] },
  { slug: "rivers", label: "Rivers", cities: ["Port Harcourt", "PH", "Choba", "Bonny"] },
  { slug: "sokoto", label: "Sokoto", cities: [] },
  { slug: "taraba", label: "Taraba", cities: ["Jalingo"] },
  { slug: "yobe", label: "Yobe", cities: ["Damaturu"] },
  { slug: "zamfara", label: "Zamfara", cities: ["Gusau"] },
];
