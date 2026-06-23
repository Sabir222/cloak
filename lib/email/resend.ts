import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@example.com';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export async function sendAgentEmail({
  email,
  downloadToken,
  packName,
  agentCount
}: {
  email: string;
  downloadToken: string;
  packName: string;
  agentCount: number;
}) {
  const downloadUrl = `${BASE_URL}/api/download?token=${downloadToken}`;

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your ${packName} is ready to download`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 16px;">
          Your ${packName} is ready! 🎉
        </h1>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Thank you for your purchase! Your pack contains
          <strong>${agentCount} agent${agentCount > 1 ? 's' : ''}</strong>
          ready to download.
        </p>
        <div style="margin: 32px 0;">
          <a
            href="${downloadUrl}"
            style="display: inline-block; background: #f97316; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;"
          >
            Download Your Agents
          </a>
        </div>
        <p style="color: #888; font-size: 14px; line-height: 1.6;">
          The download link will give you a ZIP file containing all agent
          configuration files (.md) with installation instructions for your
          preferred AI tool (Claude Code, Cursor, Windsurf, and more).
        </p>
        <p style="color: #888; font-size: 14px;">
          If the button doesn't work, copy and paste this URL into your browser:<br>
          <a href="${downloadUrl}" style="color: #f97316;">${downloadUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #aaa; font-size: 12px;">
          This email was sent because you purchased a pack from The Agency.
        </p>
      </div>
    `
  });

  if (error) {
    console.error('Failed to send email:', error);
    throw error;
  }

  return data;
}
