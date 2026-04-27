import 'server-only'

import { Resend } from 'resend'

type SendEmailInput = {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

type MailDeliveryMode = 'admin' | 'real' | 'disabled'

let resendClient: Resend | null = null

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('RESEND_API_KEY manquant')
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }

  return resendClient
}

export function getEmailConfig() {
  return {
    from: process.env.RESEND_FROM || 'France Alumni Guinée <onboarding@resend.dev>',
    adminTo: process.env.EMAIL_ADMIN_TO || 'france.alumni@institutfrancais-guinee.fr',
    deliveryMode: getMailDeliveryMode(),
  }
}

function getMailDeliveryMode(): MailDeliveryMode {
  const value = (process.env.SEND_MAIL_ADMIN || 'no').trim().toLowerCase()

  if (value === 'yes') return 'admin'
  if (value === 'false' || value === 'fasle' || value === 'off' || value === '0') return 'disabled'
  return 'real'
}

function formatRecipients(to: string | string[]) {
  return Array.isArray(to) ? to.join(', ') : to
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function resolveEmailInput(input: SendEmailInput) {
  const { adminTo, deliveryMode } = getEmailConfig()

  if (deliveryMode === 'disabled') {
    return null
  }

  if (deliveryMode === 'admin') {
    const originalTo = formatRecipients(input.to)
    return {
      ...input,
      to: adminTo,
      subject: `[TEST admin] ${input.subject}`,
      html: `
        <div style="margin:0 0 16px;padding:12px;border:1px solid #f59e0b;background:#fffbeb;color:#92400e;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
          Mode test email actif : cet email aurait été envoyé à <strong>${escapeHtml(originalTo)}</strong>.
        </div>
        ${input.html}
      `,
      text: `Mode test email actif : cet email aurait été envoyé à ${originalTo}.\n\n${input.text || ''}`,
    }
  }

  return input
}

export async function sendEmail(input: SendEmailInput) {
  const { from } = getEmailConfig()
  const resolvedInput = resolveEmailInput(input)

  if (!resolvedInput) {
    return null
  }

  const { data, error } = await getResendClient().emails.send({
    from,
    to: resolvedInput.to,
    subject: resolvedInput.subject,
    html: resolvedInput.html,
    text: resolvedInput.text,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function sendEmailSafe(context: string, input: SendEmailInput) {
  const { deliveryMode } = getEmailConfig()

  if (deliveryMode === 'disabled') {
    console.info(`[email:${context}] envoi désactivé par SEND_MAIL_ADMIN=false`)
    return {
      ok: false,
      skipped: true,
      mode: deliveryMode,
      error: 'Envoi désactivé par SEND_MAIL_ADMIN=false',
    }
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn(`[email:${context}] RESEND_API_KEY manquant, email ignoré.`)
    return { ok: false, error: 'RESEND_API_KEY manquant' }
  }

  try {
    const data = await sendEmail(input)
    console.info(`[email:${context}] envoyé`, {
      id: data?.id,
      to: input.to,
      mode: deliveryMode,
      subject: input.subject,
    })
    return { ok: true, data, mode: deliveryMode }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error(`[email:${context}] ${message}`)
    return { ok: false, error: message }
  }
}
