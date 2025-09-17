export interface ResumeData {
  Title: string;
  Contact: Contact;
  Skills: Skills;
  Education: Education[];
  Experience: Experience[];
  References: Reference[];
}

export interface Contact {
  Address: string;
  Address_Link: string;
  LinkedIn_Preview: string;
  DriverLicense: string;
}

export interface Skills {
  ProgrammingLanguages: Skill[];
  Languages: LanguageSkill[];
}

export interface Skill {
  Name: string;
  Experience: SkillExperience; // Numeric years + formatted
}

export interface SkillExperience {
  School?: number; // years
  Work?: number;   // years
  Hobby?: number;  // years

  // Precomputed formatted strings
  FormattedSchool?: string;
  FormattedWork?: string;
  FormattedHobby?: string;
}

export interface LanguageSkill {
  Name: string;
  Proficiency: 'Native' | 'Fluent' | 'Basic';
}

export interface Education {
  Degree: string;
  School: string;
  Location: string;
  StartDate: string; // YYYY-MM
  EndDate?: string | null;
  Description: string;
  Level: string;

  // Precomputed fields
  FormattedDates?: string; // e.g., "Sep 2020 — Jun 2023"
  Duration?: string;       // e.g., "2 yrs 9 mo"
}

export interface Experience {
  Title: string;
  Badge: string;
  Company: string;
  Location: string;
  StartDate: string; // YYYY-MM
  EndDate?: string | null;
  Description: string;

  // Precomputed fields
  FormattedDates?: string;
  Duration?: string;
}

export interface Reference {
  Name: string;
  Title: string;
  Company?: string;
  Phone: string;
  Email: string;
  Relationship?: string;
}
