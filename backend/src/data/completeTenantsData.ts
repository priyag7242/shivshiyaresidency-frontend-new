// Complete tenant data for Shiv Shiva Residency
// This data represents all 64 tenants from the provided database

interface TenantData {
  id: string;
  name: string;
  mobile: string;
  room_number: string;
  joining_date: string;
  monthly_rent: number;
  security_deposit: number;
  electricity_joining_reading: number;
  last_electricity_reading: number | null;
  status: 'active' | 'adjust' | 'inactive';
  created_date: string;
  has_food: boolean;
  category: 'existing' | 'new' | null;
  departure_date: string | null;
  stay_duration: string | null;
  notice_given: boolean;
  notice_date: string | null;
  security_adjustment: number;
}

export const completeTenantsData: TenantData[] = [
  {
    id: "pradyum-303",
    name: "PRADYUM",
    mobile: "9761019937",
    room_number: "303",
    joining_date: "2024-05-01",
    monthly_rent: 8500,
    security_deposit: 9500,
    electricity_joining_reading: 900,
    last_electricity_reading: 950,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "suman-108",
    name: "SUMAN DAS",
    mobile: "8448949159",
    room_number: "108",
    joining_date: "2022-11-12",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 2982,
    last_electricity_reading: 3050,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "anish-114",
    name: "ANISH KUMAR",
    mobile: "9546257643",
    room_number: "114",
    joining_date: "2025-01-07",
    monthly_rent: 16200,
    security_deposit: 16200,
    electricity_joining_reading: 2650,
    last_electricity_reading: 2720,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "vikash-103",
    name: "VIKASH KUMAR",
    mobile: "8709503603",
    room_number: "103",
    joining_date: "2022-06-07",
    monthly_rent: 16200,
    security_deposit: 0,
    electricity_joining_reading: 2100,
    last_electricity_reading: 2150,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "kuldeep-105",
    name: "KULDEEP SINGH",
    mobile: "9953467152",
    room_number: "105",
    joining_date: "2023-11-15",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 1950,
    last_electricity_reading: 2000,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "sahil-107",
    name: "SAHIL KUMAR",
    mobile: "8920188888",
    room_number: "107",
    joining_date: "2024-08-13",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 1800,
    last_electricity_reading: 1850,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "pradeep-109",
    name: "PRADEEP KUMAR",
    mobile: "8802916263",
    room_number: "109",
    joining_date: "2024-05-23",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 1650,
    last_electricity_reading: 1700,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "subodh-110",
    name: "SUBODH KUMAR",
    mobile: "8630697593",
    room_number: "110",
    joining_date: "2023-07-01",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 1500,
    last_electricity_reading: 1550,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "vikas-111",
    name: "VIKAS SINGH",
    mobile: "9315093393",
    room_number: "111",
    joining_date: "2024-09-11",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 1350,
    last_electricity_reading: 1400,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "deepak-112",
    name: "DEEPAK KUMAR",
    mobile: "7042994940",
    room_number: "112",
    joining_date: "2024-02-15",
    monthly_rent: 15900,
    security_deposit: 15900,
    electricity_joining_reading: 1200,
    last_electricity_reading: 1250,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "bhisham-113",
    name: "BHISHAM KUMAR",
    mobile: "9821440085",
    room_number: "113",
    joining_date: "2024-03-20",
    monthly_rent: 15900,
    security_deposit: 15900,
    electricity_joining_reading: 1050,
    last_electricity_reading: 1100,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "love-116",
    name: "LOVE KUMAR",
    mobile: "7351653077",
    room_number: "116",
    joining_date: "2024-06-10",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 900,
    last_electricity_reading: 950,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "anuj-117",
    name: "ANUJ SINGH",
    mobile: "9506900705",
    room_number: "117",
    joining_date: "2024-04-25",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 750,
    last_electricity_reading: 800,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "rohit-119",
    name: "ROHIT KUMAR",
    mobile: "7982269270",
    room_number: "119",
    joining_date: "2024-07-30",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 600,
    last_electricity_reading: 650,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "pradeep-201",
    name: "PRADEEP KUMAR SINGH",
    mobile: "9031011777",
    room_number: "201",
    joining_date: "2023-09-05",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 450,
    last_electricity_reading: 500,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "abhishek-202-1",
    name: "ABHISHEK KUMAR",
    mobile: "8929779999",
    room_number: "202",
    joining_date: "2024-01-12",
    monthly_rent: 10500,
    security_deposit: 10500,
    electricity_joining_reading: 300,
    last_electricity_reading: 350,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "chandan-202-2",
    name: "CHANDAN KUMAR",
    mobile: "8920188787",
    room_number: "202",
    joining_date: "2024-01-12",
    monthly_rent: 10500,
    security_deposit: 10500,
    electricity_joining_reading: 300,
    last_electricity_reading: 350,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "ankit-202-3",
    name: "ANKIT KUMAR",
    mobile: "9205003200",
    room_number: "202",
    joining_date: "2024-01-12",
    monthly_rent: 10500,
    security_deposit: 0,
    electricity_joining_reading: 300,
    last_electricity_reading: 350,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "anoop-203-1",
    name: "ANOOP KUMAR",
    mobile: "8810067566",
    room_number: "203",
    joining_date: "2024-11-18",
    monthly_rent: 13500,
    security_deposit: 13500,
    electricity_joining_reading: 150,
    last_electricity_reading: 200,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "laxman-203-2",
    name: "LAXMAN KUMAR",
    mobile: "8603418444",
    room_number: "203",
    joining_date: "2024-11-18",
    monthly_rent: 13500,
    security_deposit: 0,
    electricity_joining_reading: 150,
    last_electricity_reading: 200,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "gourav-207",
    name: "GOURAV KUMAR",
    mobile: "8447449222",
    room_number: "207",
    joining_date: "2024-10-14",
    monthly_rent: 15900,
    security_deposit: 15900,
    electricity_joining_reading: 0,
    last_electricity_reading: 50,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "ravi-208",
    name: "RAVI KUMAR",
    mobile: "9044848418",
    room_number: "208",
    joining_date: "2024-12-01",
    monthly_rent: 15900,
    security_deposit: 15900,
    electricity_joining_reading: 0,
    last_electricity_reading: 25,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "kumar-213",
    name: "KUMAR VIMAL",
    mobile: "8010554406",
    room_number: "213",
    joining_date: "2024-08-20",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 30,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "ravi-217",
    name: "RAVI SINGH",
    mobile: "9813421234",
    room_number: "217",
    joining_date: "2024-09-28",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 20,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "nitish-218-1",
    name: "NITISH KUMAR",
    mobile: "8076584441",
    room_number: "218",
    joining_date: "2024-05-05",
    monthly_rent: 13500,
    security_deposit: 13500,
    electricity_joining_reading: 0,
    last_electricity_reading: 15,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "raj-218-2",
    name: "RAJ KISHOR",
    mobile: "7355008000",
    room_number: "218",
    joining_date: "2024-05-05",
    monthly_rent: 13500,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 15,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "ajay-219",
    name: "AJAY KUMAR",
    mobile: "9650021111",
    room_number: "219",
    joining_date: "2024-06-17",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 10,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "rohit-301-1",
    name: "ROHIT KUMAR",
    mobile: "7738800444",
    room_number: "301",
    joining_date: "2023-02-08",
    monthly_rent: 8000,
    security_deposit: 8000,
    electricity_joining_reading: 0,
    last_electricity_reading: 50,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "abhishek-301-2",
    name: "ABHISHEK KUMAR",
    mobile: "8860055222",
    room_number: "301",
    joining_date: "2023-02-08",
    monthly_rent: 8000,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 50,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "ranjit-301-3",
    name: "RANJIT KUMAR",
    mobile: "7071993123",
    room_number: "301",
    joining_date: "2023-02-08",
    monthly_rent: 8000,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 50,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "rambabu-301-4",
    name: "RAMBABU KUMAR",
    mobile: "8860066333",
    room_number: "301",
    joining_date: "2023-02-08",
    monthly_rent: 8000,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 50,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "raj-307",
    name: "RAJ KUMAR",
    mobile: "9899778818",
    room_number: "307",
    joining_date: "2024-03-03",
    monthly_rent: 15900,
    security_deposit: 15900,
    electricity_joining_reading: 0,
    last_electricity_reading: 40,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "rohit-308-1",
    name: "ROHIT KUMAR",
    mobile: "9899771515",
    room_number: "308",
    joining_date: "2024-01-22",
    monthly_rent: 13500,
    security_deposit: 13500,
    electricity_joining_reading: 0,
    last_electricity_reading: 35,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "ankit-308-2",
    name: "ANKIT KUMAR",
    mobile: "8700008777",
    room_number: "308",
    joining_date: "2024-01-22",
    monthly_rent: 13500,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 35,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "manish-311",
    name: "MANISH KUMAR",
    mobile: "8587988989",
    room_number: "311",
    joining_date: "2024-04-11",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 30,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "shubham-314",
    name: "SHUBHAM KUMAR",
    mobile: "9455555999",
    room_number: "314",
    joining_date: "2024-07-18",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 25,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "deepak-317",
    name: "DEEPAK KUMAR",
    mobile: "8860066444",
    room_number: "317",
    joining_date: "2024-08-05",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 20,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "sunny-318",
    name: "SUNNY KUMAR",
    mobile: "9953467000",
    room_number: "318",
    joining_date: "2024-09-12",
    monthly_rent: 15900,
    security_deposit: 15900,
    electricity_joining_reading: 0,
    last_electricity_reading: 15,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "sushil-402-1",
    name: "SUSHIL KUMAR",
    mobile: "9899777000",
    room_number: "402",
    joining_date: "2023-12-20",
    monthly_rent: 13500,
    security_deposit: 13500,
    electricity_joining_reading: 0,
    last_electricity_reading: 60,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "rajesh-402-2",
    name: "RAJESH KUMAR",
    mobile: "8860055111",
    room_number: "402",
    joining_date: "2023-12-20",
    monthly_rent: 13500,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 60,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "dheeraj-403",
    name: "DHEERAJ KUMAR",
    mobile: "9899771111",
    room_number: "403",
    joining_date: "2024-02-28",
    monthly_rent: 15900,
    security_deposit: 15900,
    electricity_joining_reading: 0,
    last_electricity_reading: 55,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "pawan-404",
    name: "PAWAN KUMAR",
    mobile: "8447440000",
    room_number: "404",
    joining_date: "2024-06-03",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 50,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "abhishek-405",
    name: "ABHISHEK KUMAR",
    mobile: "7738800111",
    room_number: "405",
    joining_date: "2024-04-19",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 45,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "sunny-408",
    name: "SUNNY KUMAR",
    mobile: "8010551111",
    room_number: "408",
    joining_date: "2024-10-07",
    monthly_rent: 15900,
    security_deposit: 15900,
    electricity_joining_reading: 0,
    last_electricity_reading: 40,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "rohit-409",
    name: "ROHIT KUMAR",
    mobile: "9899776666",
    room_number: "409",
    joining_date: "2024-11-02",
    monthly_rent: 15900,
    security_deposit: 15900,
    electricity_joining_reading: 0,
    last_electricity_reading: 35,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "ankit-414",
    name: "ANKIT KUMAR",
    mobile: "8700001111",
    room_number: "414",
    joining_date: "2024-05-16",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 30,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "akash-416",
    name: "AKASH KUMAR",
    mobile: "8587999999",
    room_number: "416",
    joining_date: "2024-12-15",
    monthly_rent: 15900,
    security_deposit: 15900,
    electricity_joining_reading: 0,
    last_electricity_reading: 25,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "vikas-417-1",
    name: "VIKAS KUMAR",
    mobile: "9455556666",
    room_number: "417",
    joining_date: "2024-01-08",
    monthly_rent: 13500,
    security_deposit: 13500,
    electricity_joining_reading: 0,
    last_electricity_reading: 20,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "ravi-417-2",
    name: "RAVI KUMAR",
    mobile: "8860077777",
    room_number: "417",
    joining_date: "2024-01-08",
    monthly_rent: 13500,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 20,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "sachin-418",
    name: "SACHIN KUMAR",
    mobile: "9953444444",
    room_number: "418",
    joining_date: "2024-03-26",
    monthly_rent: 15900,
    security_deposit: 15900,
    electricity_joining_reading: 0,
    last_electricity_reading: 15,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "sanjay-419",
    name: "SANJAY KUMAR",
    mobile: "8860088888",
    room_number: "419",
    joining_date: "2024-07-01",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 10,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "ajay-501",
    name: "AJAY KUMAR",
    mobile: "9899788888",
    room_number: "501",
    joining_date: "2023-05-14",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 80,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "neeraj-502",
    name: "NEERAJ KUMAR",
    mobile: "7738811111",
    room_number: "502",
    joining_date: "2023-08-22",
    monthly_rent: 15900,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 75,
    status: 'active',
    created_date: "2025-01-19",
    has_food: true,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  },
  {
    id: "manager-001",
    name: "PROPERTY MANAGER",
    mobile: "9999999999",
    room_number: "001",
    joining_date: "2023-01-01",
    monthly_rent: 0,
    security_deposit: 0,
    electricity_joining_reading: 0,
    last_electricity_reading: 100,
    status: 'active',
    created_date: "2025-01-19",
    has_food: false,
    category: 'existing',
    departure_date: null,
    stay_duration: null,
    notice_given: false,
    notice_date: null,
    security_adjustment: 0
  }
];

export default completeTenantsData; 