import { count } from "drizzle-orm";

import { db } from "@/db";
import { students } from "@/db/schema";

// Same fictional dummy dataset as backend/seed.py — 24 students,
// DOBs spanning 1998–2008, eight courses, enrollments 2021–2026.
const DUMMY_STUDENTS = [
  { studentId: "STU-0001", name: "Aarav Mehta", dob: "2004-03-12", email: "aarav.mehta1@example.com", phone: "+91-9812345601", course: "Computer Science", address: "14 MG Road, Bengaluru", enrollmentDate: "2023-08-01" },
  { studentId: "STU-0002", name: "Diya Sharma", dob: "2005-11-02", email: "diya.sharma2@example.com", phone: "+91-9812345602", course: "Data Science", address: "88 FC Road, Pune", enrollmentDate: "2024-01-15" },
  { studentId: "STU-0003", name: "Kabir Iyer", dob: "2003-07-21", email: "kabir.iyer3@example.com", phone: "+91-9812345603", course: "Mechanical Engineering", address: "32 Anna Salai, Chennai", enrollmentDate: "2022-06-10" },
  { studentId: "STU-0004", name: "Meera Khan", dob: "2006-01-30", email: "meera.khan4@example.com", phone: "+91-9812345604", course: "Psychology", address: "7 Park Street, Delhi", enrollmentDate: "2024-08-19" },
  { studentId: "STU-0005", name: "Rohan Patel", dob: "2002-09-14", email: "rohan.patel5@example.com", phone: "+91-9812345605", course: "Business Administration", address: "105 Ring Road, Mumbai", enrollmentDate: "2021-07-05" },
  { studentId: "STU-0006", name: "Ananya Nair", dob: "2007-04-05", email: "ananya.nair6@example.com", phone: "+91-9812345606", course: "Design", address: "21 Jubilee Hills, Hyderabad", enrollmentDate: "2025-02-11" },
  { studentId: "STU-0007", name: "Vivaan Singh", dob: "2004-12-19", email: "vivaan.singh7@example.com", phone: "+91-9812345607", course: "Computer Science", address: "56 HSR Layout, Bengaluru", enrollmentDate: "2023-08-01" },
  { studentId: "STU-0008", name: "Isha Das", dob: "2005-06-27", email: "isha.das8@example.com", phone: "+91-9812345608", course: "Biotechnology", address: "9 Koregaon Park, Pune", enrollmentDate: "2024-01-22" },
  { studentId: "STU-0009", name: "Arjun Kulkarni", dob: "2001-10-08", email: "arjun.kulkarni9@example.com", phone: "+91-9812345609", course: "Mathematics", address: "63 Adyar, Chennai", enrollmentDate: "2021-01-18" },
  { studentId: "STU-0010", name: "Sana Reddy", dob: "2006-08-23", email: "sana.reddy10@example.com", phone: "+91-9812345610", course: "Data Science", address: "40 Banjara Hills, Hyderabad", enrollmentDate: "2025-07-07" },
  { studentId: "STU-0011", name: "Aditya Verma", dob: "2003-02-16", email: "aditya.verma11@example.com", phone: "+91-9812345611", course: "Mechanical Engineering", address: "18 Civil Lines, Delhi", enrollmentDate: "2022-08-29" },
  { studentId: "STU-0012", name: "Navya Gupta", dob: "2008-05-09", email: "navya.gupta12@example.com", phone: "+91-9812345612", course: "Psychology", address: "112 Indiranagar, Bengaluru", enrollmentDate: "2026-01-12" },
  { studentId: "STU-0013", name: "Karthik Mehta", dob: "2000-11-25", email: "karthik.mehta13@example.com", phone: "+91-9812345613", course: "Business Administration", address: "73 Marine Drive, Mumbai", enrollmentDate: "2021-06-03" },
  { studentId: "STU-0014", name: "Zara Sharma", dob: "2007-09-01", email: "zara.sharma14@example.com", phone: "+91-9812345614", course: "Design", address: "25 Aundh, Pune", enrollmentDate: "2025-08-25" },
  { studentId: "STU-0015", name: "Dev Iyer", dob: "2004-04-17", email: "dev.iyer15@example.com", phone: "+91-9812345615", course: "Mathematics", address: "3 Besant Nagar, Chennai", enrollmentDate: "2023-01-09" },
  { studentId: "STU-0016", name: "Priya Khan", dob: "2005-02-28", email: "priya.khan16@example.com", phone: "+91-9812345616", course: "Computer Science", address: "47 Whitefield, Bengaluru", enrollmentDate: "2024-07-15" },
  { studentId: "STU-0017", name: "Rahul Patel", dob: "2002-12-06", email: "rahul.patel17@example.com", phone: "+91-9812345617", course: "Data Science", address: "91 Satellite, Mumbai", enrollmentDate: "2022-01-31" },
  { studentId: "STU-0018", name: "Tara Nair", dob: "2006-10-20", email: "tara.nair18@example.com", phone: "+91-9812345618", course: "Biotechnology", address: "66 Kondapur, Hyderabad", enrollmentDate: "2025-01-27" },
  { studentId: "STU-0019", name: "Nikhil Singh", dob: "2003-08-11", email: "nikhil.singh19@example.com", phone: "+91-9812345619", course: "Mechanical Engineering", address: "29 Lajpat Nagar, Delhi", enrollmentDate: "2023-06-05" },
  { studentId: "STU-0020", name: "Aisha Das", dob: "2007-03-03", email: "aisha.das20@example.com", phone: "+91-9812345620", course: "Psychology", address: "52 Viman Nagar, Pune", enrollmentDate: "2025-09-02" },
  { studentId: "STU-0021", name: "Varun Kulkarni", dob: "2001-05-29", email: "varun.kulkarni21@example.com", phone: "+91-9812345621", course: "Business Administration", address: "16 Powai, Mumbai", enrollmentDate: "2021-11-08" },
  { studentId: "STU-0022", name: "Kavya Reddy", dob: "2005-07-07", email: "kavya.reddy22@example.com", phone: "+91-9812345622", course: "Mathematics", address: "84 Malleshwaram, Bengaluru", enrollmentDate: "2024-02-19" },
  { studentId: "STU-0023", name: "Imran Verma", dob: "2004-01-23", email: "imran.verma23@example.com", phone: "+91-9812345623", course: "Computer Science", address: "37 Velachery, Chennai", enrollmentDate: "2023-02-27" },
  { studentId: "STU-0024", name: "Riya Gupta", dob: "2006-12-15", email: "riya.gupta24@example.com", phone: "+91-9812345624", course: "Data Science", address: "10 Gachibowli, Hyderabad", enrollmentDate: "2026-01-05" },
];

export async function ensureSeeded(): Promise<void> {
  const [row] = await db.select({ value: count() }).from(students);
  if ((row?.value ?? 0) > 0) return;
  await db.insert(students).values(DUMMY_STUDENTS).onConflictDoNothing();
}
