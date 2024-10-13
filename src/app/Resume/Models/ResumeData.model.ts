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
  Programming_Languages: Skill[];
  Languages: Skill[];
}

export interface Skill {
  Name: string;
  Value: number;
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
