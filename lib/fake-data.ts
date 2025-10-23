export interface Article {
  id: string
  title: string
  excerpt: string
  category: "Parcours inspirants" | "Entrepreneuriat" | "Intégration" | "Événements"
  author: string
  date: string
  image: string
  content: string
}

export interface AlumniMember {
  id: string
  name: string
  photo: string
  formation: string
  university: string
  promotion: string
  currentPosition: string
  company: string
  sector: string
  city: string
  bio: string
  email: string
}

export interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  type: "CDI" | "CDD" | "Stage" | "Freelance"
  sector: string
  description: string
  requirements: string[]
  postedDate: string
  salary?: string
  remote: boolean
}

export interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  type: "Conférence" | "Networking" | "Formation" | "Workshop"
  description: string
  image: string
  attendees: number
}

export const articles: Article[] = [
  {
    id: "1",
    title: "De Paris à Conakry : Le parcours inspirant de Fatoumata Diallo",
    excerpt:
      "Diplômée de Sciences Po Paris, Fatoumata a fondé une startup EdTech qui révolutionne l'éducation en Guinée.",
    category: "Parcours inspirants",
    author: "Fatoumata Diallo",
    date: "15 Mars 2024",
    image: "/african-woman-professional-entrepreneur.jpg",
    content: "Après avoir obtenu son master en politiques publiques à Sciences Po Paris...",
  },
  {
    id: "2",
    title: "Entrepreneuriat : Lancer sa startup tech en Guinée",
    excerpt: "Les clés du succès pour développer une entreprise technologique innovante dans le contexte guinéen.",
    category: "Entrepreneuriat",
    author: "Mamadou Sylla",
    date: "10 Mars 2024",
    image: "/startup-office-technology-africa.jpg",
    content: "L'écosystème entrepreneurial guinéen connaît une croissance remarquable...",
  },
  {
    id: "3",
    title: "Retour au pays : Comment réussir sa réintégration professionnelle",
    excerpt: "Conseils pratiques pour les alumni qui souhaitent rentrer en Guinée après leurs études en France.",
    category: "Intégration",
    author: "Aissatou Bah",
    date: "5 Mars 2024",
    image: "/professional-woman-office-guinea.jpg",
    content: "Le retour en Guinée après plusieurs années d'études en France peut sembler intimidant...",
  },
  {
    id: "4",
    title: "Forum Alumni 2024 : Un événement à ne pas manquer",
    excerpt: "Le grand rassemblement annuel des alumni France-Guinée aura lieu le 20 avril à Conakry.",
    category: "Événements",
    author: "Équipe France Alumni",
    date: "1 Mars 2024",
    image: "/conference-event-networking-africa.jpg",
    content: "Nous sommes ravis d'annoncer la tenue du Forum Alumni 2024...",
  },
  {
    id: "5",
    title: "Innovation sociale : Des alumni au service du développement",
    excerpt: "Portrait de trois alumni qui ont créé des projets à impact social en Guinée.",
    category: "Entrepreneuriat",
    author: "Ibrahim Camara",
    date: "25 Février 2024",
    image: "/social-innovation-community-africa.jpg",
    content: "L'innovation sociale est au cœur des préoccupations de nombreux alumni...",
  },
  {
    id: "6",
    title: "Témoignage : Mon expérience à HEC Paris",
    excerpt: "Abdoulaye partage son parcours académique et les opportunités offertes par son diplôme.",
    category: "Parcours inspirants",
    author: "Abdoulaye Condé",
    date: "20 Février 2024",
    image: "/student-campus-france-university.jpg",
    content: "Intégrer HEC Paris était un rêve que je n'osais pas imaginer...",
  },
  {
    id: "7",
    title: "Salon des Stages 2025 : Coaching et Recrutement",
    excerpt: "Deux jours pour connecter étudiants et entreprises à Conakry avec nos Alumni.",
    category: "Événements",
    author: "Équipe France Alumni",
    date: "18 Mars 2024",
    image: "/social-innovation-community-africa.jpg",
    content: "Un rendez-vous inédit qui rassemble Alumni, étudiants et entreprises pour créer des opportunités concrètes...",
  },
]

export const alumniMembers: AlumniMember[] = [
  {
    id: "1",
    name: "Fatoumata Diallo",
    photo: "/african-woman-professional-portrait.png",
    formation: "Master en Politiques Publiques",
    university: "Sciences Po Paris",
    promotion: "2020",
    currentPosition: "CEO & Fondatrice",
    company: "EduTech Guinée",
    sector: "Éducation & Technologie",
    city: "Conakry",
    bio: "Passionnée par l'éducation et l'innovation, j'ai fondé EduTech Guinée pour démocratiser l'accès à une éducation de qualité.",
    email: "f.diallo@edutech-guinee.com",
  },
  {
    id: "2",
    name: "Mamadou Sylla",
    photo: "/african-man-professional-portrait-suit.jpg",
    formation: "MBA",
    university: "HEC Paris",
    promotion: "2019",
    currentPosition: "Directeur Général",
    company: "Guinée Digital Solutions",
    sector: "Technologie",
    city: "Conakry",
    bio: "Expert en transformation digitale avec 10 ans d'expérience dans le secteur tech.",
    email: "m.sylla@gds.gn",
  },
  {
    id: "3",
    name: "Aissatou Bah",
    photo: "/african-woman-professional-portrait-business.jpg",
    formation: "Master en Finance",
    university: "Université Paris-Dauphine",
    promotion: "2021",
    currentPosition: "Directrice Financière",
    company: "Banque Atlantique Guinée",
    sector: "Finance & Banque",
    city: "Conakry",
    bio: "Spécialiste en finance d'entreprise et gestion des risques.",
    email: "a.bah@ba-guinee.com",
  },
  {
    id: "4",
    name: "Ibrahim Camara",
    photo: "/african-man-professional-portrait-casual.jpg",
    formation: "Doctorat en Médecine",
    university: "Université de Bordeaux",
    promotion: "2018",
    currentPosition: "Chirurgien",
    company: "Hôpital National Donka",
    sector: "Santé",
    city: "Conakry",
    bio: "Chirurgien spécialisé en chirurgie cardiovasculaire, engagé pour améliorer le système de santé guinéen.",
    email: "i.camara@donka.gn",
  },
  {
    id: "5",
    name: "Abdoulaye Condé",
    photo: "/african-man-professional-portrait-young.jpg",
    formation: "Master en Marketing",
    university: "ESSEC Business School",
    promotion: "2022",
    currentPosition: "Responsable Marketing",
    company: "Orange Guinée",
    sector: "Télécommunications",
    city: "Conakry",
    bio: "Passionné par le marketing digital et l'innovation dans les télécoms.",
    email: "a.conde@orange-guinee.com",
  },
  {
    id: "6",
    name: "Mariama Touré",
    photo: "/african-woman-professional-portrait-smile.jpg",
    formation: "Master en Droit International",
    university: "Université Paris 1 Panthéon-Sorbonne",
    promotion: "2020",
    currentPosition: "Avocate",
    company: "Cabinet Touré & Associés",
    sector: "Droit & Justice",
    city: "Conakry",
    bio: "Avocate spécialisée en droit des affaires et droit international.",
    email: "m.toure@cabinet-toure.gn",
  },
  {
    id: "7",
    name: "Ousmane Barry",
    photo: "/african-man-professional-portrait-glasses.jpg",
    formation: "Ingénieur en Informatique",
    university: "École Polytechnique",
    promotion: "2019",
    currentPosition: "CTO",
    company: "PayTech Africa",
    sector: "FinTech",
    city: "Conakry",
    bio: "Ingénieur passionné par les solutions de paiement mobile en Afrique.",
    email: "o.barry@paytech-africa.com",
  },
  {
    id: "8",
    name: "Kadiatou Sow",
    photo: "/african-woman-professional-portrait-confident.jpg",
    formation: "Master en Architecture",
    university: "École Nationale Supérieure d'Architecture Paris-Belleville",
    promotion: "2021",
    currentPosition: "Architecte",
    company: "Sow Architecture & Design",
    sector: "Architecture & Urbanisme",
    city: "Conakry",
    bio: "Architecte engagée pour un urbanisme durable et adapté au contexte africain.",
    email: "k.sow@sow-architecture.gn",
  },
]

export const teamMembers = [
  {
    name: "Dr. Amadou Diallo",
    role: "Président",
    bio: "Docteur en économie, ancien étudiant de l'Université Paris-Sorbonne",
    image: "/african-man-professional-portrait-senior.jpg",
  },
  {
    name: "Mariama Keita",
    role: "Vice-Présidente",
    bio: "MBA HEC Paris, experte en développement international",
    image: "/african-woman-professional-portrait-executive.jpg",
  },
  {
    name: "Ibrahima Sow",
    role: "Secrétaire Général",
    bio: "Ingénieur diplômé de Centrale Paris, spécialiste en gestion de projets",
    image: "/placeholder.svg?height=200&width=200",
  },
]

export const partners = [
  { name: "Ambassade de France en Guinée et en Sierra Leone", logo: "/partenaires/ambassade.png" },
  { name: "Institut français de Guinée", logo: "/partenaires/ifg.png" },
  { name: "Campus France", logo: "/partenaires/campusfrance.png" },
  { name: "Association des Jeunes Guinéens de France", logo: "/partenaires/ajgf.jpg" },
  { name: "Salon de l'Emploi et de l'Entrepreneuriat des Guinéens de France", logo: "/partenaires/seegf.png" },
]

export const jobPostings: JobPosting[] = [
  {
    id: "1",
    title: "Développeur Full Stack Senior",
    company: "Guinée Digital Solutions",
    location: "Conakry",
    type: "CDI",
    sector: "Technologie",
    description:
      "Nous recherchons un développeur full stack expérimenté pour rejoindre notre équipe technique et contribuer au développement de solutions digitales innovantes.",
    requirements: [
      "5+ ans d'expérience en développement web",
      "Maîtrise de React, Node.js, et PostgreSQL",
      "Expérience avec les architectures cloud (AWS/Azure)",
      "Excellentes compétences en communication",
    ],
    postedDate: "Il y a 2 jours",
    salary: "Selon expérience",
    remote: true,
  },
  {
    id: "2",
    title: "Responsable Marketing Digital",
    company: "Orange Guinée",
    location: "Conakry",
    type: "CDI",
    sector: "Télécommunications",
    description:
      "Orange Guinée recherche un responsable marketing digital pour piloter la stratégie digitale et développer la présence en ligne de la marque.",
    requirements: [
      "3+ ans d'expérience en marketing digital",
      "Maîtrise des réseaux sociaux et SEO/SEM",
      "Compétences analytiques et créatives",
      "Diplôme en marketing ou communication",
    ],
    postedDate: "Il y a 5 jours",
    salary: "À négocier",
    remote: false,
  },
  {
    id: "3",
    title: "Consultant en Finance d'Entreprise",
    company: "Banque Atlantique Guinée",
    location: "Conakry",
    type: "CDI",
    sector: "Finance & Banque",
    description:
      "Rejoignez notre équipe de conseil financier pour accompagner nos clients entreprises dans leurs projets de développement et de financement.",
    requirements: [
      "Master en Finance ou équivalent",
      "2+ ans d'expérience en conseil financier",
      "Excellente maîtrise d'Excel et des outils financiers",
      "Capacité d'analyse et de synthèse",
    ],
    postedDate: "Il y a 1 semaine",
    salary: "Compétitif",
    remote: false,
  },
  {
    id: "4",
    title: "Ingénieur DevOps",
    company: "PayTech Africa",
    location: "Conakry",
    type: "CDI",
    sector: "FinTech",
    description:
      "Nous cherchons un ingénieur DevOps pour optimiser notre infrastructure cloud et automatiser nos processus de déploiement.",
    requirements: [
      "3+ ans d'expérience en DevOps",
      "Maîtrise de Docker, Kubernetes, CI/CD",
      "Expérience avec AWS ou GCP",
      "Compétences en scripting (Python, Bash)",
    ],
    postedDate: "Il y a 3 jours",
    salary: "Selon profil",
    remote: true,
  },
  {
    id: "5",
    title: "Architecte Urbaniste",
    company: "Sow Architecture & Design",
    location: "Conakry",
    type: "CDD",
    sector: "Architecture & Urbanisme",
    description: "Participez à des projets d'urbanisme durable et de développement territorial en Guinée.",
    requirements: [
      "Diplôme d'architecte reconnu",
      "Expérience en urbanisme et aménagement",
      "Maîtrise des logiciels CAO/DAO",
      "Sensibilité au développement durable",
    ],
    postedDate: "Il y a 1 semaine",
    remote: false,
  },
  {
    id: "6",
    title: "Stage en Communication",
    company: "Institut Français de Guinée",
    location: "Conakry",
    type: "Stage",
    sector: "Culture & Communication",
    description:
      "Stage de 6 mois pour assister l'équipe communication dans l'organisation d'événements culturels et la gestion des réseaux sociaux.",
    requirements: [
      "Étudiant en communication ou marketing",
      "Maîtrise des réseaux sociaux",
      "Créativité et sens de l'organisation",
      "Français et anglais courants",
    ],
    postedDate: "Il y a 4 jours",
    salary: "Indemnité de stage",
    remote: false,
  },
]
