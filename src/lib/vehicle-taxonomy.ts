export const VEHICLE_BRANDS = [
  "Audi",
  "BMW",
  "Chevrolet",
  "Citroen",
  "Dacia",
  "Fiat",
  "Ford",
  "Honda",
  "Hyundai",
  "Kia",
  "Lexus",
  "Mazda",
  "Mercedes-Benz",
  "Mitsubishi",
  "Nissan",
  "Opel",
  "Peugeot",
  "Porsche",
  "Renault",
  "Seat",
  "Skoda",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
] as const;

export const VEHICLE_FUEL_VALUES = [
  { value: "petrol", label: "Benzina" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electricitate" },
  { value: "lpg", label: "Gaz / Benzina" },
] as const;

export const VEHICLE_TRANSMISSION_VALUES = [
  { value: "manual", label: "Manuala" },
  { value: "automatic", label: "Automata" },
] as const;
