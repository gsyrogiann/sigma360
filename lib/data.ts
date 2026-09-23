export type Store = {
  id: string;
  name: string;
  city: string;
  address: string;
  score: number;
  delta: number;
  sales: number;
  openTasks: number;
  overdue: number;
  lastVisit: string;
  staff: number;
};

export type Task = {
  id: number;
  title: string;
  store: string;
  category: string;
  due: string;
  owner: string;
  priority: "Χαμηλή" | "Μεσαία" | "Υψηλή";
  status: "Ανοιχτή" | "Σε εξέλιξη" | "Ολοκληρωμένη" | "Καθυστερημένη";
};

export const stores: Store[] = [
  { id: "nea-ionia", name: "Νέα Ιωνία", city: "Αθήνα", address: "Λ. Ηρακλείου 210, Αθήνα", score: 91, delta: 4, sales: 104, openTasks: 1, overdue: 0, lastVisit: "12/09/2026", staff: 6 },
  { id: "glyfada", name: "Γλυφάδα", city: "Αθήνα", address: "Μεταξά 42, Γλυφάδα", score: 95, delta: 2, sales: 108, openTasks: 0, overdue: 0, lastVisit: "15/09/2026", staff: 6 },
  { id: "peristeri", name: "Περιστέρι", city: "Αθήνα", address: "Εθν. Αντιστάσεως 74, Περιστέρι", score: 88, delta: 1, sales: 98, openTasks: 2, overdue: 0, lastVisit: "08/09/2026", staff: 6 },
  { id: "chalandri", name: "Χαλάνδρι", city: "Αθήνα", address: "Αγ. Παρασκευής 31, Χαλάνδρι", score: 82, delta: -3, sales: 90, openTasks: 3, overdue: 1, lastVisit: "11/09/2026", staff: 4 },
  { id: "kifisia", name: "Κηφισιά", city: "Αθήνα", address: "Κολοκοτρώνη 9, Κηφισιά", score: 79, delta: -2, sales: 94, openTasks: 4, overdue: 2, lastVisit: "09/09/2026", staff: 5 },
  { id: "ag-markou", name: "Αγ. Μάρκου", city: "Αθήνα", address: "Αγ. Μάρκου 12, Αθήνα", score: 68, delta: -7, sales: 82, openTasks: 5, overdue: 3, lastVisit: "10/09/2026", staff: 5 },
];

export const initialTasks: Task[] = [
  { id: 1, title: "Τοποθέτηση νέων καρτελών τιμών", store: "Αγ. Μάρκου", category: "Τιμές / Σήμανση", due: "10/09/2026", owner: "Μαρία Παπαδοπούλου", priority: "Υψηλή", status: "Καθυστερημένη" },
  { id: 2, title: "Τακτοποίηση βιτρίνας", store: "Νέα Ιωνία", category: "Βιτρίνα / Merchandising", due: "12/09/2026", owner: "Ελένη Κ.", priority: "Μεσαία", status: "Σε εξέλιξη" },
  { id: 3, title: "Καθαριότητα αποθήκης", store: "Γλυφάδα", category: "Καθαριότητα", due: "14/09/2026", owner: "Γιάννης Κ.", priority: "Μεσαία", status: "Ανοιχτή" },
  { id: 4, title: "Έλεγχος προϊόντων (ελλείψεις)", store: "Πειραιάς", category: "Προϊόντα", due: "15/09/2026", owner: "Κώστας Μ.", priority: "Χαμηλή", status: "Ανοιχτή" },
  { id: 5, title: "Επικοινωνία με τεχνικό (κλιματισμός)", store: "Χαλάνδρι", category: "Τεχνικά θέματα", due: "08/09/2026", owner: "Δημήτρης Π.", priority: "Χαμηλή", status: "Ολοκληρωμένη" },
];

export const staff = [
  { name: "Μαρία", role: "Υπεύθυνη", hours: 40, avatar: "ΜΠ" },
  { name: "Γιάννης", role: "Πωλητής", hours: 40, avatar: "ΓΚ" },
  { name: "Ελένη", role: "Πωλήτρια", hours: 32, avatar: "ΕΚ" },
  { name: "Κώστας", role: "Πωλητής", hours: 40, avatar: "ΚΜ" },
  { name: "Σοφία", role: "Πωλήτρια", hours: 24, avatar: "ΣΛ" },
  { name: "Δημήτρης", role: "Αποθήκη", hours: 40, avatar: "ΔΠ" },
];

export const schedule = [
  ["Π 08-14","Π 08-14","Π 08-14","Π 08-14","Π 08-14","Π 08-14","Π 08-14"],
  ["Α 14-21","Α 14-21","Ρ","Α 14-21","Α 14-21","Α 14-21","Α 14-21"],
  ["Π 08-14","Ρ","Π 08-14","Π 08-14","Π 08-14","ΑΔ","Ρ"],
  ["Α 14-21","Α 14-21","Α 14-21","Α 14-21","Α 14-21","Α 14-21","Α 14-21"],
  ["Π 08-14","Π 08-14","Ρ","Π 08-14","Π 08-14","Ρ","Ρ"],
  ["Α 14-21","Α 14-21","Α 14-21","Π 08-14","Α 14-21","Π 08-14","Α 14-21"],
];
