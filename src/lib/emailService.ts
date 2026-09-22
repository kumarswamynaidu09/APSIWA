import { MembershipApplication, WebsiteSettings } from '../types';
import { calculateValidityDate, isSupabaseConfigured, supabase } from './supabase';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string | null;
  simulated?: boolean;
}

/**
 * Formats date into readable standard format DD-MMM-YYYY
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Generates official AP SIWA Membership Approval Confirmation HTML Email
 * matching the exact wording and structure requested by the Secretariat.
 */
export function generateApprovalEmailHtml(
  app: MembershipApplication,
  settings?: WebsiteSettings
): string {
  const memberName = app.fullName || 'Member';
  const membershipId = app.id;
  const membershipType = app.applicationType || 'New Member';
  const paymentDate = formatDate(app.paymentDate);
  const validUntil = app.validUntil || calculateValidityDate(app.paymentDate || new Date().toISOString());
  const origin = 'https://www.apsiwa.in';
  const secEmail = settings?.secretariatEmail || 'apsiwa2018@gmail.com';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AP SIWA Membership Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f6f9; padding: 28px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 52, 119, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Official Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #001d4a 0%, #003477 65%, #024aa3 100%); padding: 28px 24px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; background-color: #ffbe3b; color: #00285e; font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 8px;">
                      OFFICIAL CONFIRMATION
                    </span>
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.3px;">
                      AP SIWA
                    </h1>
                    <p style="color: #8ef9a0; font-size: 12px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      Andhra Pradesh Solar Integrators Welfare Association
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <p style="font-size: 15px; margin: 0 0 16px 0; color: #1e293b;">
                Dear <strong>${memberName}</strong>,
              </p>
              
              <p style="font-size: 14px; margin: 0 0 14px 0; color: #334155;">
                Greetings from <strong>AP SIWA</strong>.
              </p>
              
              <p style="font-size: 14px; margin: 0 0 14px 0; color: #334155;">
                We are pleased to inform you that your membership application has been successfully approved.
              </p>
              
              <p style="font-size: 14px; margin: 0 0 24px 0; color: #334155;">
                We warmly welcome you to the <strong>AP SIWA</strong> membership community and thank you for choosing to be associated with us.
              </p>

              <!-- Membership Details Card Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; color: #003477; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                  Membership Details
                </h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px;">
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; width: 140px;">Member Name:</td>
                    <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">${memberName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Membership ID:</td>
                    <td style="padding: 4px 0; color: #003477; font-weight: 800; font-family: monospace;">${membershipId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Membership Type:</td>
                    <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${membershipType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Date of Payment:</td>
                    <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${paymentDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Valid Until:</td>
                    <td style="padding: 4px 0; color: #006e2e; font-weight: 800;">${validUntil}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 14px; margin: 0 0 18px 0; color: #334155;">
                Your Digital Smart Membership Card is now available through the AP SIWA Member Portal.
              </p>

              <!-- DIGITAL MEMBERSHIP CARD GRAPHIC PREVIEW -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background: linear-gradient(140deg, #001d4a 0%, #003477 65%, #00285e 100%); border-radius: 14px; padding: 20px; color: #ffffff; border: 2px solid #ffbe3b; box-shadow: 0 6px 20px rgba(0, 29, 74, 0.25);">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td valign="middle">
                          <span style="background-color: #ffbe3b; color: #00285e; font-size: 8.5px; font-weight: 900; padding: 2px 7px; border-radius: 8px; text-transform: uppercase;">
                            AP STATE SOLAR WELFARE ASSOC.
                          </span>
                          <h4 style="font-size: 14px; font-weight: 800; color: #ffffff; margin: 3px 0 0 0;">
                            Your Digital Membership Card
                          </h4>
                        </td>
                        <td align="right" valign="top">
                          <span style="font-size: 9.5px; color: #8ef9a0; font-weight: 800; border: 1px solid #8ef9a0; padding: 2px 6px; border-radius: 6px;">
                            ● ACTIVE
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 14px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="56" valign="top">
                                ${
                                  app.photoUrl
                                    ? `<img src="${app.photoUrl}" alt="${memberName}" width="54" height="66" style="border-radius: 6px; object-fit: cover; border: 2px solid #ffffff; display: block;" />`
                                    : `<div style="width: 54px; height: 66px; background-color: #ffffff; border-radius: 6px; color: #003477; font-size: 22px; font-weight: 800; text-align: center; line-height: 66px;">${memberName.charAt(0)}</div>`
                                }
                              </td>
                              <td style="padding-left: 12px;" valign="top">
                                <h3 style="font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 2px 0;">
                                  ${memberName}
                                </h3>
                                <p style="font-size: 11.5px; color: #ffbe3b; font-weight: 700; margin: 0 0 3px 0;">
                                  ${app.companyName || 'Solar EPC Integrator'}
                                </p>
                                <p style="font-size: 10.5px; color: #d0d7e5; margin: 0 0 2px 0;">
                                  District: <strong>${app.district || 'Andhra Pradesh'}</strong>
                                </p>
                                <p style="font-size: 10.5px; color: #d0d7e5; margin: 0;">
                                  DOB: <strong>${app.dateOfBirth || 'N/A'}</strong>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.15); margin-top: 12px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td>
                                <span style="font-size: 8.5px; color: #a4b3cc; text-transform: uppercase; display: block;">MEMBERSHIP NUMBER</span>
                                <span style="font-size: 13px; font-family: monospace; font-weight: 800; color: #ffbe3b;">${membershipId}</span>
                              </td>
                              <td align="right">
                                <span style="font-size: 8.5px; color: #a4b3cc; text-transform: uppercase; display: block;">VALIDITY</span>
                                <span style="font-size: 12px; font-family: monospace; font-weight: 700; color: #8ef9a0;">${validUntil}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13.5px; margin: 0 0 20px 0; color: #475569; line-height: 1.6;">
                You can access and download your high-resolution membership card from the member portal using your <strong>Membership ID</strong> and the <strong>last four digits of your registered mobile number</strong>.
              </p>

              <!-- DOWNLOAD BUTTON -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${origin}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #003477 0%, #024aa3 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 52, 119, 0.25);">
                      [ Download Membership Card ]
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; margin: 0 0 16px 0; color: #475569; line-height: 1.5;">
                Please keep your membership credentials secure and use your membership ID for all future communication with <strong>AP SIWA</strong>.
              </p>

              <p style="font-size: 13px; margin: 0 0 16px 0; color: #475569; line-height: 1.5;">
                If you have any questions regarding your membership, membership card, or account, please contact the AP SIWA Secretariat at:<br />
                Email: <a href="mailto:${secEmail}" style="color: #003477; font-weight: 700; text-decoration: none;">${secEmail}</a>
              </p>

              <p style="font-size: 13.5px; margin: 0 0 24px 0; color: #334155; line-height: 1.5;">
                We look forward to your active participation and continued association with AP SIWA.
              </p>

              <!-- Sign-off Block -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-bottom: 18px;">
                <p style="font-size: 13.5px; margin: 0 0 3px 0; color: #1e293b;">
                  Warm regards,
                </p>
                <p style="font-size: 14px; font-weight: 800; color: #003477; margin: 0 0 2px 0;">
                  AP SIWA Secretariat
                </p>
                <p style="font-size: 13px; font-weight: 700; color: #475569; margin: 0 0 4px 0;">
                  AP SIWA
                </p>
                <p style="font-size: 12.5px; margin: 0; color: #64748b;">
                  Email: <a href="mailto:${secEmail}" style="color: #003477; text-decoration: none; font-weight: 600;">${secEmail}</a>
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer Disclaimer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.4;">
                This is an automated membership confirmation email. Please retain this email for your records.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Sends the Official Membership Approval Confirmation Email to the member via Resend.
 * 
 * Supports:
 * 1. Resend REST API (Direct HTTPS invocation) using API Key from Settings or VITE_RESEND_API_KEY
 * 2. Supabase Edge Function `send-approval-email` if configured
 * 3. Fallback simulation with full logging and rich feedback when running locally
 */
export async function sendApprovalConfirmationEmail(
  app: MembershipApplication,
  settings?: WebsiteSettings
): Promise<SendEmailResult> {
  const recipientEmail = app.emailAddress?.trim();
  if (!recipientEmail) {
    return {
      success: false,
      error: 'Member has no registered email address.'
    };
  }

  const validUntil = app.validUntil || calculateValidityDate(app.paymentDate || new Date().toISOString());
  const emailHtml = generateApprovalEmailHtml(app, settings);
  const emailSubject = `Official Membership Approval Confirmation - ${app.fullName} (${app.id})`;

  // Determine Resend API Key from settings or environment
  const resendApiKey =
    settings?.resendApiKey?.trim() ||
    (import.meta.env.VITE_RESEND_API_KEY as string | undefined)?.trim() ||
    '';

  const fromAddress =
    settings?.resendFromEmail?.trim() ||
    (import.meta.env.VITE_RESEND_FROM_EMAIL as string | undefined)?.trim() ||
    'AP SIWA Secretariat <onboarding@resend.dev>';

  // 1. Try Supabase Edge Function if Supabase is configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke('send-approval-email', {
        body: {
          to: recipientEmail,
          subject: emailSubject,
          html: emailHtml,
          application: app,
          validUntil,
        },
      });

      if (!error && data?.id) {
        return {
          success: true,
          messageId: data.id,
          simulated: false,
        };
      }
    } catch (err) {
      console.warn('Supabase Edge function invocation fallback to Resend API:', err);
    }
  }

  // 2. Resend REST API invocation (uses proxy /api/resend/emails to avoid browser CORS errors)
  if (resendApiKey) {
    const endpoints = ['/api/resend/emails', 'https://api.resend.com/emails'];

    for (const endpoint of endpoints) {
      try {
        let response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [recipientEmail],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        let resData: any = {};
        try {
          resData = await response.json();
        } catch {
          // Non-JSON response
        }

        // If custom domain is not verified yet in Resend, auto-retry with onboarding@resend.dev
        if (!response.ok && fromAddress !== 'AP SIWA Secretariat <onboarding@resend.dev>') {
          console.warn('Custom from address failed, retrying with onboarding@resend.dev fallback...', resData);
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'AP SIWA Secretariat <onboarding@resend.dev>',
              to: [recipientEmail],
              subject: emailSubject,
              html: emailHtml,
            }),
          });
          try {
            resData = await response.json();
          } catch {}
        }

        if (response.ok && resData?.id) {
          return {
            success: true,
            messageId: resData.id,
            simulated: false,
          };
        } else if (response.status !== 404) {
          const errorMsg = resData?.message || resData?.error || response.statusText || 'Delivery rejected';
          return {
            success: false,
            error: `Resend: ${errorMsg}`,
          };
        }
      } catch (err: any) {
        // Continue to next endpoint if this one fails (e.g. proxy in prod or direct in dev)
        console.warn(`Attempt on ${endpoint} failed:`, err.message);
      }
    }
  }

  // 3. Fallback Simulation (Development mode / API Key not yet entered)
  console.info(
    `[Resend Email Notice] Could not reach Resend directly from browser due to CORS.\n` +
    `Ensure the dev server is running or Supabase Edge function is deployed.`
  );

  return {
    success: false,
    error: 'Browser CORS restriction. Please restart "npm run dev" to enable the proxy or deploy the Supabase Edge function.',
  };
}
