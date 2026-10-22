export const vehicles = [
  {
    id: 'V001',
    registration: 'KWA 123A',
    type: 'Toyota Hilux',
    capacity: 4,
    available: true,
  },
  {
    id: 'V002',
    registration: 'KWB 456B',
    type: 'Toyota Hiace',
    capacity: 12,
    available: true,
  },
  {
    id: 'V003',
    registration: 'KWC 789C',
    type: 'Minibus',
    capacity: 14,
    available: true,
  },
  {
    id: 'V004',
    registration: 'KWD 101D',
    type: 'Minibus',
    capacity: 10,
    available: false,
  },
  {
    id: 'V005',
    registration: 'KWE 202E',
    type: 'Motorcycle',
    capacity: 2,
    available: true,
  },
  {
    id: 'V006',
    registration: 'KWF 303F',
    type: 'Toyota Hilux',
    capacity: 4,
    available: false,
  },
]

export const drivers = [
  {
    id: 'D001',
    name: 'Peter Mwangi',
    phone: '+1 555 0201',
    email: 'peter.mwangi@trs.org',
    available: true,
  },
  {
    id: 'D002',
    name: 'Grace Auma',
    phone: '+1 555 0202',
    email: 'grace.auma@trs.org',
    available: true,
  },
  {
    id: 'D003',
    name: 'John Otieno',
    phone: '+1 555 0203',
    email: 'john.otieno@trs.org',
    available: true,
  },
  {
    id: 'D004',
    name: 'Mary Wanjiru',
    phone: '+1 555 0204',
    email: 'mary.wanjiru@trs.org',
    available: false,
  },
  {
    id: 'D005',
    name: 'Samuel Kiprotich',
    phone: '+1 555 0205',
    email: 'samuel.kiprotich@trs.org',
    available: true,
  },
]

export const transportRates = [
  { vehicle: 'Vehicles (Toyota Hilux)', rate: 'USD 1.00 – 1.20 / km' },
  { vehicle: 'Minibus', rate: 'USD 2.00 / km' },
  { vehicle: 'Motorcycle', rate: 'USD 0.65 / km' },
]

export const transportInstructions = [
  'Record exact mileage before departure and on return.',
  'Cost center approval is required before travel.',
  'Log every trip in the vehicle logbook.',
  'Provide the invoice and billing details to Transport/Administration.',
  'Return the completed transport form to Transport/Administration.',
]