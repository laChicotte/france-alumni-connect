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
    subject: 'Votre inscription a bien été reçue',
    html: layout(
      'Inscription reçue',
      `
        <p style="margin:0 0 12px;">Bonjour ${name},</p>
        <p style="margin:0 0 12px;">Votre demande d'inscription sur la plateforme ${escapeHtml(appName)} a bien été reçue.</p>
        <p style="margin:0;">Votre compte est actuellement en attente de validation par l'équipe d'administration. Vous recevrez un email lorsque votre compte sera activé.</p>
      `
    ),
    text: `Bonjour ${displayName(input)}, votre demande d'inscription sur ${appName} a bien été reçue. Votre compte est en attente de validation.`,
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
