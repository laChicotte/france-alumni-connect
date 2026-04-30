type PersonName = {
  prenom?: string | null
  nom?: string | null
}

type RegistrationEmailInput = PersonName & {
  email: string
}

type AdminUserEmailInput = RegistrationEmailInput & {
  role: string
  password?: string
}

type StatusEmailInput = PersonName & {
  status: 'actif' | 'banni'
}

const appName = 'France Alumni Guinée'
const primaryColor = '#3558A2'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function displayName({ prenom, nom }: PersonName) {
  const fullName = `${prenom || ''} ${nom || ''}`.trim()
  return fullName || 'Bonjour'
}

function layout(title: string, content: string) {
  return `
    <div style="margin:0;padding:24px;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <div style="padding:20px 24px;background:${primaryColor};color:#ffffff;">
          <h1 style="margin:0;font-size:20px;line-height:1.3;">${escapeHtml(appName)}</h1>
        </div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 16px;font-size:20px;line-height:1.35;color:#111827;">${escapeHtml(title)}</h2>
          ${content}
        </div>
        <div style="padding:16px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
          Cet email est envoyé automatiquement par la plateforme ${escapeHtml(appName)}.
        </div>
      </div>
    </div>
  `
}

export function registrationReceivedEmail(input: RegistrationEmailInput) {
  const name = escapeHtml(displayName(input))

  return {
    subject: 'Votre demande d\'inscription a bien été reçue — France Alumni Guinée',
    html: layout(
      'Demande d\'inscription reçue',
      `
        <p style="margin:0 0 12px;">Bonjour ${name},</p>
        <p style="margin:0 0 12px;">Nous avons bien reçu votre demande d'inscription sur la plateforme <strong>${escapeHtml(appName)}</strong>. Nous vous remercions de l'intérêt que vous portez à notre réseau.</p>
        <p style="margin:0 0 12px;">Votre dossier va être examiné par notre équipe d'administration dans les meilleurs délais. Cette vérification nous permet de garantir la qualité et la fiabilité de notre communauté d'alumni.</p>
        <p style="margin:0 0 12px;">Vous recevrez prochainement un email vous informant de la décision prise concernant votre compte :</p>
        <ul style="margin:0 0 12px;padding-left:20px;">
          <li style="margin-bottom:6px;">En cas de <strong>validation</strong>, vous pourrez immédiatement vous connecter et accéder à l'ensemble des services de la plateforme.</li>
          <li style="margin-bottom:6px;">En cas de <strong>refus</strong>, vous en serez informé avec les raisons si nécessaire, et vous aurez la possibilité de nous contacter pour tout éclaircissement.</li>
        </ul>
        <p style="margin:0;">Pour toute question, n'hésitez pas à nous écrire à <a href="mailto:france.alumni@institutfrancais-guinee.fr" style="color:${primaryColor};">france.alumni@institutfrancais-guinee.fr</a>.</p>
      `
    ),
    text: `Bonjour ${displayName(input)}, nous avons bien reçu votre demande d'inscription sur ${appName}. Votre dossier va être examiné par notre équipe d'administration. Vous recevrez un email lors de la validation ou du refus de votre compte. Pour toute question : france.alumni@institutfrancais-guinee.fr`,
  }
}

export function adminRegistrationNotificationEmail(input: RegistrationEmailInput) {
  const name = escapeHtml(displayName(input))
  const email = escapeHtml(input.email)

  return {
    subject: 'Nouvelle inscription alumni à valider',
    html: layout(
      'Nouvelle inscription alumni',
      `
        <p style="margin:0 0 12px;">Une nouvelle inscription est en attente de validation.</p>
        <p style="margin:0 0 6px;"><strong>Nom :</strong> ${name}</p>
        <p style="margin:0;"><strong>Email :</strong> ${email}</p>
      `
    ),
    text: `Nouvelle inscription alumni à valider : ${displayName(input)} (${input.email}).`,
  }
}

export function adminUserCreatedEmail(input: AdminUserEmailInput) {
  const name = escapeHtml(displayName(input))
  const role = escapeHtml(input.role)

  return {
    subject: `Votre accès ${appName} a été créé`,
    html: layout(
      'Compte créé',
      `
        <p style="margin:0 0 12px;">Bonjour ${name},</p>
        <p style="margin:0 0 12px;">Un compte ${role} a été créé pour vous sur la plateforme ${escapeHtml(appName)}.</p>
        <p style="margin:0;">Vous pouvez vous connecter avec l'adresse email associée à ce message. Votre mot de passe initial doit vous être transmis séparément par l'administration.</p>
      `
    ),
    text: `Bonjour ${displayName(input)}, un compte ${input.role} a été créé pour vous sur ${appName}. Votre mot de passe initial doit vous être transmis séparément par l'administration.`,
  }
}

type ProposalEmailInput = PersonName & {
  email: string
  titre: string
}

export function articleProposalApprovedEmail(input: ProposalEmailInput) {
  const name = escapeHtml(displayName(input))
  const titre = escapeHtml(input.titre)

  return {
    subject: 'Votre article a été publié sur France Alumni Guinée',
    html: layout(
      'Votre article a été publié !',
      `
        <p style="margin:0 0 12px;">Bonjour ${name},</p>
        <p style="margin:0 0 12px;">Nous avons le plaisir de vous informer que votre article <strong>« ${titre} »</strong> a été examiné et validé par notre équipe éditoriale.</p>
        <p style="margin:0 0 12px;">Il est désormais publié et visible par l'ensemble de la communauté France Alumni Guinée. Nous vous remercions chaleureusement pour cette contribution qui enrichit notre réseau et témoigne de votre engagement.</p>
        <p style="margin:0;">N'hésitez pas à continuer à partager vos idées, expériences et réflexions avec la communauté. Votre voix compte !</p>
      `
    ),
    text: `Bonjour ${displayName(input)}, votre article « ${input.titre} » a été validé et publié sur ${appName}. Merci pour votre contribution !`,
  }
}

export function articleProposalRejectedEmail(input: ProposalEmailInput) {
  const name = escapeHtml(displayName(input))
  const titre = escapeHtml(input.titre)

  return {
    subject: 'Votre proposition d\'article n\'a pas été approuvée sur France Alumni Guinée',
    html: layout(
      'Votre article n\'a pas été approuvé',
      `
        <p style="margin:0 0 12px;">Bonjour ${name},</p>
        <p style="margin:0 0 12px;">Nous vous remercions sincèrement d'avoir pris le temps de rédiger et de soumettre votre article <strong>« ${titre} »</strong> à la plateforme France Alumni Guinée.</p>
        <p style="margin:0 0 12px;">Après examen par notre équipe éditoriale, nous ne sommes malheureusement pas en mesure de le publier en l'état. Cela peut être dû à des critères éditoriaux, à la ligne éditoriale du moment, ou à d'autres considérations internes.</p>
        <p style="margin:0 0 12px;">Nous vous encourageons vivement à retravailler votre proposition ou à en soumettre de nouvelles. Votre engagement pour la communauté est précieux et nous espérons pouvoir collaborer avec vous prochainement.</p>
        <p style="margin:0;">Pour toute question, n'hésitez pas à nous contacter à l'adresse <a href="mailto:france.alumni@institutfrancais-guinee.fr" style="color:${primaryColor};">france.alumni@institutfrancais-guinee.fr</a>.</p>
      `
    ),
    text: `Bonjour ${displayName(input)}, votre proposition d'article « ${input.titre} » n'a pas été retenue pour publication sur ${appName}. Nous vous encourageons à soumettre de nouvelles propositions.`,
  }
}

export function evenementProposalApprovedEmail(input: ProposalEmailInput) {
  const name = escapeHtml(displayName(input))
  const titre = escapeHtml(input.titre)

  return {
    subject: 'Votre événement a été publié sur France Alumni Guinée',
    html: layout(
      'Votre événement a été publié !',
      `
        <p style="margin:0 0 12px;">Bonjour ${name},</p>
        <p style="margin:0 0 12px;">Excellente nouvelle ! Votre proposition d'événement <strong>« ${titre} »</strong> a été validée par notre équipe et est désormais publiée sur la plateforme France Alumni Guinée.</p>
        <p style="margin:0 0 12px;">Les membres de la communauté peuvent dès à présent le consulter et s'y inscrire. Nous sommes ravis de soutenir vos initiatives et vous remercions pour l'énergie que vous mettez au service du réseau.</p>
        <p style="margin:0;">Nous vous souhaitons un événement riche et fructueux !</p>
      `
    ),
    text: `Bonjour ${displayName(input)}, votre événement « ${input.titre} » a été validé et publié sur ${appName}. Les membres peuvent désormais s'y inscrire !`,
  }
}

export function evenementProposalRejectedEmail(input: ProposalEmailInput) {
  const name = escapeHtml(displayName(input))
  const titre = escapeHtml(input.titre)

  return {
    subject: 'Votre proposition d\'événement n\'a pas été approuvée sur France Alumni Guinée',
    html: layout(
      'Votre proposition d\'événement n\'a pas été approuvée',
      `
        <p style="margin:0 0 12px;">Bonjour ${name},</p>
        <p style="margin:0 0 12px;">Nous vous remercions d'avoir soumis votre proposition d'événement <strong>« ${titre} »</strong> sur la plateforme France Alumni Guinée. Nous apprécions votre implication et votre souhait de contribuer à la vie de notre communauté.</p>
        <p style="margin:0 0 12px;">Après étude de votre proposition, notre équipe n'est pas en mesure de la retenir pour publication à ce stade. Nous espérons cependant que cela ne vous découragera pas et vous invitons à soumettre de nouvelles initiatives à l'avenir.</p>
        <p style="margin:0;">Pour échanger davantage sur votre projet ou obtenir des précisions, vous pouvez nous écrire à <a href="mailto:france.alumni@institutfrancais-guinee.fr" style="color:${primaryColor};">france.alumni@institutfrancais-guinee.fr</a>.</p>
      `
    ),
    text: `Bonjour ${displayName(input)}, votre proposition d'événement « ${input.titre} » n'a pas été retenue sur ${appName}. N'hésitez pas à soumettre de nouvelles initiatives.`,
  }
}

type ProposalStaffNotificationInput = {
  auteurPrenom: string | null
  auteurNom: string | null
  auteurEmail: string
  titre: string
  type: 'article' | 'evenement' | 'formation'
}

export function proposalStaffNotificationEmail(input: ProposalStaffNotificationInput) {
  const auteur = escapeHtml(`${input.auteurPrenom || ''} ${input.auteurNom || ''}`.trim() || 'Un alumni')
  const email = escapeHtml(input.auteurEmail)
  const titre = escapeHtml(input.titre)
  const typeLabel = input.type === 'article' ? 'article' : input.type === 'evenement' ? 'événement' : 'formation'
  const adminUrl = input.type === 'article' ? '/admin/articles' : input.type === 'evenement' ? '/admin/evenements' : '/admin/formations'

  return {
    subject: `Nouvelle proposition d'${typeLabel} à modérer — ${appName}`,
    html: layout(
      `Nouvelle proposition d'${typeLabel}`,
      `
        <p style="margin:0 0 12px;">Une nouvelle proposition d'${typeLabel} vient d'être soumise par un alumni et est en attente de modération.</p>
        <p style="margin:0 0 6px;"><strong>Auteur :</strong> ${auteur}</p>
        <p style="margin:0 0 6px;"><strong>Email :</strong> ${email}</p>
        <p style="margin:0 0 16px;"><strong>Titre :</strong> ${titre}</p>
        <p style="margin:0 0 12px;">Connectez-vous à l'espace d'administration pour examiner cette proposition et décider de la valider ou de la refuser.</p>
        <a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:10px 20px;background:${primaryColor};color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">
          Accéder à la modération
        </a>
      `
    ),
    text: `Nouvelle proposition d'${typeLabel} à modérer sur ${appName}. Auteur : ${input.auteurPrenom || ''} ${input.auteurNom || ''} (${input.auteurEmail}). Titre : ${input.titre}. Connectez-vous à l'administration pour modérer.`,
  }
}

export function formationProposalApprovedEmail(input: ProposalEmailInput) {
  const name = escapeHtml(displayName(input))
  const titre = escapeHtml(input.titre)

  return {
    subject: 'Votre formation a été publiée sur France Alumni Guinée',
    html: layout(
      'Votre formation a été publiée !',
      `
        <p style="margin:0 0 12px;">Bonjour ${name},</p>
        <p style="margin:0 0 12px;">Excellente nouvelle ! Votre proposition de formation <strong>« ${titre} »</strong> a été examinée et validée par notre équipe. Elle est désormais publiée sur la plateforme ${escapeHtml(appName)} et accessible à l'ensemble de la communauté.</p>
        <p style="margin:0 0 12px;">Les membres peuvent dès à présent consulter votre formation et s'y inscrire. Nous vous remercions chaleureusement pour cette initiative qui contribue au développement des compétences au sein de notre réseau.</p>
        <p style="margin:0;">Nous vous souhaitons une formation enrichissante et un bel échange avec les participants !</p>
      `
    ),
    text: `Bonjour ${displayName(input)}, votre formation « ${input.titre} » a été validée et publiée sur ${appName}. Les membres peuvent désormais s'y inscrire !`,
  }
}

export function formationProposalRejectedEmail(input: ProposalEmailInput) {
  const name = escapeHtml(displayName(input))
  const titre = escapeHtml(input.titre)

  return {
    subject: 'Votre proposition de formation — France Alumni Guinée',
    html: layout(
      'Votre proposition de formation',
      `
        <p style="margin:0 0 12px;">Bonjour ${name},</p>
        <p style="margin:0 0 12px;">Nous vous remercions d'avoir soumis votre proposition de formation <strong>« ${titre} »</strong> sur la plateforme ${escapeHtml(appName)}. Votre engagement en faveur du développement des compétences de notre communauté est vraiment précieux.</p>
        <p style="margin:0 0 12px;">Après examen attentif de votre dossier, notre équipe n'est malheureusement pas en mesure de retenir cette proposition pour publication à ce stade. Cela peut être lié au calendrier des formations, à la thématique ou à d'autres contraintes organisationnelles.</p>
        <p style="margin:0 0 12px;">Nous vous encourageons vivement à retravailler votre proposition ou à en soumettre de nouvelles. Votre contribution au réseau est importante et nous espérons pouvoir collaborer avec vous prochainement.</p>
        <p style="margin:0;">Pour toute question ou pour obtenir des précisions, n'hésitez pas à nous écrire à <a href="mailto:france.alumni@institutfrancais-guinee.fr" style="color:${primaryColor};">france.alumni@institutfrancais-guinee.fr</a>.</p>
      `
    ),
    text: `Bonjour ${displayName(input)}, votre proposition de formation « ${input.titre} » n'a pas été retenue sur ${appName}. Nous vous encourageons à soumettre de nouvelles propositions. Contact : france.alumni@institutfrancais-guinee.fr`,
  }
}

export function accountStatusChangedEmail(input: StatusEmailInput) {
  const name = escapeHtml(displayName(input))
  const isActive = input.status === 'actif'

  return {
    subject: isActive ? 'Votre compte France Alumni Guinée est activé' : 'Votre compte France Alumni Guinée a été désactivé',
    html: layout(
      isActive ? 'Compte activé' : 'Compte désactivé',
      isActive
        ? `
          <p style="margin:0 0 12px;">Bonjour ${name},</p>
          <p style="margin:0;">Votre compte ${escapeHtml(appName)} a été validé. Vous pouvez désormais vous connecter à la plateforme.</p>
        `
        : `
          <p style="margin:0 0 12px;">Bonjour ${name},</p>
          <p style="margin:0;">Votre compte ${escapeHtml(appName)} a été désactivé. Pour toute question, vous pouvez contacter l'administration.</p>
        `
    ),
    text: isActive
      ? `Bonjour ${displayName(input)}, votre compte ${appName} a été validé.`
      : `Bonjour ${displayName(input)}, votre compte ${appName} a été désactivé.`,
  }
}
