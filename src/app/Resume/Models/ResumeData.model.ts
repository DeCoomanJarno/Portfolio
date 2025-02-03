export interface ResumeData {
  Title: string;
  Contact: Contact;
  Profile: string;
  Skills: Skills;
  Education: Education[];
  Experience: Experience[];
  References: Reference[];
}

export interface Contact {
  Address: string;
  LinkedIn_Preview: string;
  Driverlicense: string;
}

export interface Skills {
  ProgrammingLanguages: Skill[];
  Languages: LanguageSkill[];
}

export interface Skill {
  Name: string;
  Experience: SkillExperience;
}

export interface SkillExperience {
  School: string;
  Work: string;
  Hobby: string;
}

export interface LanguageSkill {
  Name: string;
  Proficiency: string;
}

export interface Education {
  Degree: string;
  School: string;
  Location: string;
  Year: string;
  Description: string;
}

export interface Experience {
  Title: string;
  Company: string;
  Location: string;
  Dates: string;
  Description: string;
}

export interface Reference {
  Name: string;
  Title: string;
  Phone: string;
  Email: string;
}
