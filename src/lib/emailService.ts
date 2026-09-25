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
 * Formatted as an official A4 Certificate Sheet:
 * - 75% Personal and Business Accreditation Details Dossier
 * - Scissor Cut Detachable Guideline
 * - 25% Front-Side Membership ID Card (NO QR Codes)
 * - Direct Member Portal Download Link
 */
export function generateApprovalEmailHtml(
  app: MembershipApplication,
  settings?: WebsiteSettings
): string {
  const memberName = app.fullName || 'Member';
  const membershipId = app.id;
  const companyName = app.companyName || 'Solar EPC Integrator';
  const designation = app.designation || 'Authorized Representative';
  const district = app.district || 'Andhra Pradesh';
  const dob = app.dateOfBirth || 'N/A';
  const mobileNumber = app.mobileNumber || 'N/A';
  const emailAddress = app.emailAddress || 'N/A';
  const businessType = app.businessType || 'Solar EPC Integrator';
  const gstNumber = app.gstNumber || 'N/A';
  const officeAddress = app.officeAddress || 'Andhra Pradesh';
  const pincode = app.pincode || '';
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
  <title>APSIWA Official Membership Certificate & Identity Card</title>
</head>
<body style="margin: 0; padding: 0; background-color: #e9ecef; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b; line-height: 1.5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e9ecef; padding: 24px 10px;">
    <tr>
      <td align="center">
        <!-- Main A4 Document Sheet Container (Width 640px) -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 8px 30px rgba(0, 52, 119, 0.12); border: 1px solid #cbd5e1;">
          
          <!-- ================================================================= -->
          <!-- TOP 75%: OFFICIAL CERTIFICATE & ACCREDITATION DOSSIER -->
          <!-- ================================================================= -->
          <tr>
            <td style="padding: 24px 28px 16px 28px; background-color: #ffffff;">
              
              <!-- Letterhead Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-bottom: 2.5px solid #003477; padding-bottom: 14px; margin-bottom: 16px;">
                <tr>
                  <td valign="middle" style="width: 65px;">
                    <img src="https://www.apsiwa.in/logo.png" alt="APSIWA" width="58" height="52" style="display: block; object-fit: contain; border-radius: 6px; border: 1px solid #cbd5e1; padding: 2px; background-color: #ffffff;" />
                  </td>
                  <td valign="middle" style="padding-left: 10px;">
                    <span style="display: inline-block; background-color: #ffbe3b; color: #00285e; font-size: 8.5px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; margin-bottom: 3px;">
                      GOVT. RECOGNIZED STATE SOLAR WELFARE BODY
                    </span>
                    <h1 style="color: #003477; font-size: 17px; font-weight: 900; margin: 0 0 2px 0; text-transform: uppercase; letter-spacing: -0.2px; line-height: 1.2;">
                      Andhra Pradesh Solar Integrators Welfare Association
                    </h1>
                    <p style="color: #475569; font-size: 10px; font-weight: 600; margin: 0;">
                      State Secretariat: Visakhapatnam &bull; CPDCL / EPDCL Regulatory Liaison Body &bull; www.apsiwa.in
                    </p>
                  </td>
                  <td valign="middle" align="right" style="width: 105px;">
                    <div style="border: 2px solid #006e2e; background-color: #f0fdf4; border-radius: 8px; padding: 4px 8px; text-align: center;">
                      <span style="color: #006e2e; font-size: 7.5px; font-weight: 900; text-transform: uppercase; display: block;">ACCREDITATION</span>
                      <span style="color: #003477; font-size: 10.5px; font-weight: 900;">LIFE MEMBER</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Certificate Title & Reference Meta -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;">
                <tr>
                  <td>
                    <span style="color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 700; display: block;">MEMBERSHIP NUMBER</span>
                    <span style="color: #003477; font-size: 14px; font-family: monospace; font-weight: 900;">${membershipId}</span>
                  </td>
                  <td align="center">
                    <span style="color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 700; display: block;">ADMISSION STATUS</span>
                    <span style="color: #006e2e; font-size: 11px; font-weight: 800; background-color: #dcfce7; padding: 2px 8px; border-radius: 12px; border: 1px solid #86efac; display: inline-block;">
                      &bull; APPROVED &amp; ACTIVE
                    </span>
                  </td>
                  <td align="right">
                    <span style="color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 700; display: block;">VALIDITY PERIOD</span>
                    <span style="color: #006e2e; font-size: 12px; font-weight: 800; font-family: monospace;">${validUntil}</span>
                  </td>
                </tr>
              </table>

              <!-- Formal Greeting -->
              <p style="font-size: 13px; margin: 0 0 8px 0; color: #1e293b;">
                Dear <strong>${memberName}</strong>,
              </p>
              <p style="font-size: 11.5px; margin: 0 0 14px 0; color: #334155; line-height: 1.5;">
                This official certificate confirms that the applicant enterprise and authorized representative detailed below are verified and accredited as an active institutional member of the <strong>Andhra Pradesh Solar Integrators Welfare Association (APSIWA)</strong>.
              </p>

              <!-- Two-Column Details Box: 1. Representative & 2. Enterprise Profile -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 14px;">
                <tr>
                  <!-- Column 1: Personal Profile -->
                  <td width="48%" valign="top" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                      <tr>
                        <td>
                          <h3 style="margin: 0; font-size: 11px; font-weight: 900; color: #003477; text-transform: uppercase; letter-spacing: 0.5px;">
                            1. Representative Profile
                          </h3>
                        </td>
                        <td align="right">
                          <span style="color: #006e2e; font-size: 8.5px; font-weight: 900;">VERIFIED</span>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 11px;">
                      <tr>
                        <td style="padding: 2.5px 0; color: #64748b; width: 85px;">Full Name:</td>
                        <td style="padding: 2.5px 0; color: #0f172a; font-weight: 800;">${memberName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 2.5px 0; color: #64748b;">Designation:</td>
                        <td style="padding: 2.5px 0; color: #0f172a; font-weight: 700;">${designation}</td>
                      </tr>
                      <tr>
                        <td style="padding: 2.5px 0; color: #64748b;">Date of Birth:</td>
                        <td style="padding: 2.5px 0; color: #0f172a; font-weight: 700; font-family: monospace;">${dob}</td>
                      </tr>
                      <tr>
                        <td style="padding: 2.5px 0; color: #64748b;">Mobile No:</td>
                        <td style="padding: 2.5px 0; color: #0f172a; font-weight: 700;">${mobileNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 2.5px 0; color: #64748b;">Email ID:</td>
                        <td style="padding: 2.5px 0; color: #003477; font-weight: 700;">${emailAddress}</td>
                      </tr>
                    </table>
                  </td>

                  <td width="4%"></td>

                  <!-- Column 2: Enterprise Credentials -->
                  <td width="48%" valign="top" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                      <tr>
                        <td>
                          <h3 style="margin: 0; font-size: 11px; font-weight: 900; color: #003477; text-transform: uppercase; letter-spacing: 0.5px;">
                            2. Enterprise Credentials
                          </h3>
                        </td>
                        <td align="right">
                          <span style="color: #003477; font-size: 8.5px; font-weight: 900;">STATE TIER-1</span>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 11px;">
                      <tr>
                        <td style="padding: 2.5px 0; color: #64748b; width: 85px;">Firm Name:</td>
                        <td style="padding: 2.5px 0; color: #003477; font-weight: 800;">${companyName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 2.5px 0; color: #64748b;">Business Type:</td>
                        <td style="padding: 2.5px 0; color: #0f172a; font-weight: 700;">${businessType}</td>
                      </tr>
                      <tr>
                        <td style="padding: 2.5px 0; color: #64748b;">District / State:</td>
                        <td style="padding: 2.5px 0; color: #0f172a; font-weight: 700;">${district}, AP</td>
                      </tr>
                      <tr>
                        <td style="padding: 2.5px 0; color: #64748b;">GSTIN:</td>
                        <td style="padding: 2.5px 0; color: #0f172a; font-weight: 700; font-family: monospace;">${gstNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 2.5px 0; color: #64748b;">Office Address:</td>
                        <td style="padding: 2.5px 0; color: #0f172a; font-weight: 600;">${officeAddress} ${pincode ? `- ${pincode}` : ''}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Secretariat Seal & Verification Signatures -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding-top: 8px; margin-bottom: 12px; border-top: 1px solid #e2e8f0;">
                <tr>
                  <td valign="middle">
                    <p style="font-size: 10px; color: #64748b; margin: 0; line-height: 1.4;">
                      Issued by: <strong>APSIWA Secretariat, Visakhapatnam</strong><br />
                      Admission Date: <strong>${paymentDate}</strong> | ID: <strong style="font-family: monospace; color: #003477;">${membershipId}</strong>
                    </p>
                  </td>
                  <td align="right" valign="middle">
                    <div style="display: inline-block; text-align: center; border: 1.5px solid #003477; padding: 4px 12px; border-radius: 6px; background-color: #f0fdf4;">
                      <span style="color: #006e2e; font-size: 8.5px; font-weight: 900; text-transform: uppercase; display: block;">OFFICIAL SEAL</span>
                      <span style="color: #003477; font-size: 11px; font-weight: 900;">APSIWA 2026</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Download Button Link -->
              <div style="text-align: center; margin-top: 10px; margin-bottom: 6px;">
                <a href="${origin}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #003477; color: #ffffff; text-decoration: none; font-size: 12.5px; font-weight: 800; padding: 10px 24px; border-radius: 6px; border: 1px solid #00285e;">
                  [ Download Official Membership Card &amp; Certificate from www.apsiwa.in ]
                </a>
              </div>

            </td>
          </tr>

          <!-- ================================================================= -->
          <!-- SCISSOR CUT LINE (DELIMITER BETWEEN 75% SHEET & 25% CARD) -->
          <!-- ================================================================= -->
          <tr>
            <td style="padding: 6px 20px; background-color: #f1f5f9; text-align: center; border-top: 2px dashed #94a3b8; border-bottom: 2px dashed #94a3b8;">
              <span style="font-size: 11px; font-weight: 800; color: #475569; letter-spacing: 0.5px; text-transform: uppercase;">
                &#9986; - - - - - - - - Cut Along Dotted Line To Detach Membership ID Card - - - - - - - - &#9986;
              </span>
            </td>
          </tr>

          <!-- ================================================================= -->
          <!-- BOTTOM 25%: WALLET-SIZED FRONT MEMBERSHIP ID CARD (NO QR CODE) -->
          <!-- ================================================================= -->
          <tr>
            <td style="padding: 20px 24px 24px 24px; background-color: #f8fafc;" align="center">
              
              <!-- Front Card Container (Wallet Aspect Ratio, Crisp Blue Border) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background: linear-gradient(135deg, #001d4a 0%, #003477 65%, #00285e 100%); border-radius: 12px; overflow: hidden; border: 2.5px solid #ffbe3b; box-shadow: 0 4px 16px rgba(0, 52, 119, 0.25); color: #ffffff;">
                
                <!-- Card Header -->
                <tr>
                  <td style="background-color: #002255; padding: 10px 14px; border-bottom: 2px solid #ffbe3b;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td valign="middle" style="width: 32px;">
                          <img src="https://www.apsiwa.in/logo.png" alt="APSIWA" width="28" height="24" style="display: block; object-fit: contain; background-color: #ffffff; border-radius: 3px; padding: 1px;" />
                        </td>
                        <td valign="middle" style="padding-left: 8px;">
                          <span style="font-size: 13px; font-weight: 900; color: #ffffff; letter-spacing: 0.3px; display: block; line-height: 1;">
                            APSIWA
                          </span>
                          <span style="font-size: 7.5px; color: #8ef9a0; font-weight: 800; display: block; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2; margin-top: 2px;">
                            Andhra Pradesh Solar Integrators Welfare Association
                          </span>
                        </td>
                        <td align="right" valign="middle">
                          <span style="background-color: #ffbe3b; color: #00285e; font-size: 8px; font-weight: 900; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                            MEMBER ID CARD (FRONT)
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Card Body -->
                <tr>
                  <td style="padding: 12px 14px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <!-- Photo Box -->
                        <td width="64" valign="middle" align="center">
                          ${
                            app.photoUrl
                              ? `<img src="${app.photoUrl}" alt="${memberName}" width="60" height="74" style="border-radius: 6px; object-fit: cover; border: 2px solid #ffffff; display: block;" />`
                              : `<div style="width: 60px; height: 74px; background-color: #ffffff; border-radius: 6px; color: #003477; font-size: 24px; font-weight: 900; text-align: center; line-height: 74px; border: 2px solid #ffbe3b;">${memberName.charAt(0)}</div>`
                          }
                          <span style="display: block; font-size: 7.5px; font-weight: 900; color: #8ef9a0; margin-top: 3px; text-transform: uppercase;">
                            &bull; VERIFIED
                          </span>
                        </td>

                        <!-- Card Credentials Details (NO QR CODE) -->
                        <td style="padding-left: 14px;" valign="middle">
                          <h3 style="font-size: 13.5px; font-weight: 900; color: #ffffff; margin: 0 0 1px 0; text-transform: uppercase;">
                            ${memberName}
                          </h3>
                          <p style="font-size: 10px; color: #ffbe3b; font-weight: 800; margin: 0 0 4px 0;">
                            ${designation} &bull; ${companyName}
                          </p>

                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 9.5px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 4px;">
                            <tr>
                              <td style="color: #cbd5e1; padding: 1.5px 0;">ID NUMBER:</td>
                              <td style="color: #ffbe3b; font-weight: 900; font-family: monospace;">${membershipId}</td>
                              <td style="color: #cbd5e1; padding: 1.5px 0;">DOB:</td>
                              <td style="color: #ffffff; font-weight: 800; font-family: monospace;">${dob}</td>
                            </tr>
                            <tr>
                              <td style="color: #cbd5e1; padding: 1.5px 0;">DISTRICT:</td>
                              <td style="color: #ffffff; font-weight: 800;">${district}</td>
                              <td style="color: #cbd5e1; padding: 1.5px 0;">VALID TILL:</td>
                              <td style="color: #8ef9a0; font-weight: 900; font-family: monospace;">${validUntil}</td>
                            </tr>
                          </table>
                        </td>

                        <!-- Official Gold Crest / Emblem -->
                        <td width="55" valign="middle" align="center">
                          <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #ffbe3b 0%, #fab220 100%); border: 2px solid #ffffff; text-align: center; color: #00285e; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                            <span style="font-size: 6.5px; font-weight: 900; display: block; padding-top: 9px; line-height: 1.1;">
                              APSIWA<br />SEAL
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Card Footer Strip -->
                <tr>
                  <td style="background-color: #00193d; padding: 4px 14px; border-top: 1px solid rgba(255,255,255,0.15);">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 8px; color: #94a3b8;">
                      <tr>
                        <td>Govt. Recognized State Solar Association &bull; Andhra Pradesh</td>
                        <td align="right" style="color: #8ef9a0; font-weight: 700;">Authorized Bearer Credential</td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Footer Contact Disclaimer -->
          <tr>
            <td style="background-color: #0f172a; padding: 14px 20px; text-align: center; color: #94a3b8; font-size: 10.5px;">
              <p style="margin: 0 0 3px 0; color: #cbd5e1; font-weight: 600;">
                Andhra Pradesh Solar Integrators Welfare Association (APSIWA)
              </p>
              <p style="margin: 0;">
                For queries or updates, email us at <a href="mailto:${secEmail}" style="color: #ffbe3b; text-decoration: none; font-weight: 700;">${secEmail}</a> &bull; Portal: <a href="${origin}" style="color: #8ef9a0; text-decoration: none; font-weight: 700;">www.apsiwa.in</a>
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
 * Generates clean plain text email for email clients that do not render HTML
 */
export function generateApprovalEmailPlainText(
  app: MembershipApplication,
  settings?: WebsiteSettings
): string {
  const memberName = app.fullName || 'Member';
  const membershipId = app.id;
  const companyName = app.companyName || 'Solar EPC Integrator';
  const designation = app.designation || 'Authorized Representative';
  const district = app.district || 'Andhra Pradesh';
  const dob = app.dateOfBirth || 'N/A';
  const mobileNumber = app.mobileNumber || 'N/A';
  const emailAddress = app.emailAddress || 'N/A';
  const businessType = app.businessType || 'Solar EPC Integrator';
  const gstNumber = app.gstNumber || 'N/A';
  const officeAddress = app.officeAddress || 'Andhra Pradesh';
  const paymentDate = formatDate(app.paymentDate);
  const validUntil = app.validUntil || calculateValidityDate(app.paymentDate || new Date().toISOString());
  const secEmail = settings?.secretariatEmail || 'apsiwa2018@gmail.com';

  return `
ANDHRA PRADESH SOLAR INTEGRATORS WELFARE ASSOCIATION (APSIWA)
Official Membership Accreditation & Identity Card Confirmation
--------------------------------------------------------------------------------

Dear ${memberName},

We are pleased to confirm that your institutional membership accreditation with the Andhra Pradesh Solar Integrators Welfare Association (APSIWA) has been officially verified and registered.

================================================================================
MEMBERSHIP DOSSIER
================================================================================
- Membership ID: ${membershipId}
- Admission Status: APPROVED & ACTIVE
- Admission Date: ${paymentDate}
- Validity Period: Valid until ${validUntil}

1. REPRESENTATIVE PROFILE
- Full Name: ${memberName}
- Designation: ${designation}
- Date of Birth: ${dob}
- Mobile Number: ${mobileNumber}
- Email: ${emailAddress}

2. BUSINESS CREDENTIALS
- Firm Name: ${companyName}
- Business Type: ${businessType}
- District: ${district}, AP
- GSTIN: ${gstNumber}
- Office Address: ${officeAddress}

================================================================================
DOWNLOAD YOUR OFFICIAL A4 CERTIFICATE & WALLET ID CARD
================================================================================
You can view, print, or download your official high-resolution A4 Certificate & Detachable Smart ID Card anytime at:
https://www.apsiwa.in

State Secretariat: Visakhapatnam, Andhra Pradesh
Secretariat Email: ${secEmail}
Official Portal: https://www.apsiwa.in
--------------------------------------------------------------------------------
`.trim();
}

/**
 * Generates direct 1-Click Gmail Web Compose URL
 */
export function generateGmailWebLink(
  app: MembershipApplication,
  settings?: WebsiteSettings
): string {
  const recipient = encodeURIComponent(app.emailAddress || '');
  const subject = encodeURIComponent(`Official APSIWA Membership Certificate & Identity Card - ${app.fullName} (${app.id})`);
  const body = encodeURIComponent(generateApprovalEmailPlainText(app, settings));
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
}

/**
 * Generates direct 1-Click mailto: URL for default system mail client
 */
export function generateMailtoLink(
  app: MembershipApplication,
  settings?: WebsiteSettings
): string {
  const recipient = encodeURIComponent(app.emailAddress || '');
  const subject = encodeURIComponent(`Official APSIWA Membership Certificate & Identity Card - ${app.fullName} (${app.id})`);
  const body = encodeURIComponent(generateApprovalEmailPlainText(app, settings));
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

/**
 * Sends the Official Membership Approval Confirmation Email to the member via Resend.
 * 
 * Supports:
 * 1. Resend REST API (Direct HTTPS invocation / Vite & Cloud proxy)
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
  const emailText = generateApprovalEmailPlainText(app, settings);
  const emailSubject = `Official Membership Approval Confirmation - ${app.fullName} (${app.id})`;

  // Determine Resend API Key from settings or environment
  const resendApiKey =
    settings?.resendApiKey?.trim() ||
    (import.meta.env.VITE_RESEND_API_KEY as string | undefined)?.trim() ||
    '';

  let fromAddress =
    settings?.resendFromEmail?.trim() ||
    (import.meta.env.VITE_RESEND_FROM_EMAIL as string | undefined)?.trim() ||
    'APSIWA Secretariat <onboarding@resend.dev>';

  // Normalize sender: Resend rejects external domains like @gmail.com without verified domain
  if (fromAddress.includes('@gmail.com') || fromAddress.includes('@yahoo.com') || fromAddress.includes('@outlook.com') || !fromAddress.includes('@')) {
    fromAddress = 'APSIWA Secretariat <onboarding@resend.dev>';
  }

  // 1. Try internal /api/send-email serverless function endpoint first
  try {
    const srvRes = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
        from: fromAddress,
        apiKey: resendApiKey,
      }),
    });

    const contentType = srvRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const srvData = await srvRes.json();
      if (srvRes.ok && (srvData?.id || srvData?.data?.id)) {
        return {
          success: true,
          messageId: srvData.id || srvData?.data?.id,
          simulated: false,
        };
      } else if (srvData?.error || srvData?.message) {
        const errMsg = srvData?.error || srvData?.message;
        // Check for test restriction
        if (errMsg.toLowerCase().includes('testing emails') || errMsg.toLowerCase().includes('verify a domain')) {
          return {
            success: false,
            error: `Resend Test Mode: Free API keys can only deliver to your verified Resend account email. Use the 1-Click Gmail button below to send directly to ${recipientEmail}.`,
          };
        }
      }
    }
  } catch {
    // Continue to next fallback strategy
  }

  // 2. Try Supabase Edge Function if Supabase is configured
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

      if (!error && (data?.id || data?.data?.id)) {
        return {
          success: true,
          messageId: data.id || data?.data?.id,
          simulated: false,
        };
      }
    } catch (err) {
      console.warn('Supabase Edge function invocation note:', err);
    }
  }

  // 3. Resend REST API invocation via Vite proxy & direct gateways
  if (resendApiKey) {
    const endpoints = [
      '/api/resend/emails',
      'https://api.resend.com/emails',
      'https://corsproxy.io/?url=' + encodeURIComponent('https://api.resend.com/emails')
    ];

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
            text: emailText,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          continue;
        }

        let resData: any = {};
        try {
          resData = await response.json();
        } catch {}

        // If custom from address failed, retry with onboarding@resend.dev
        if (!response.ok && fromAddress !== 'APSIWA Secretariat <onboarding@resend.dev>') {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'APSIWA Secretariat <onboarding@resend.dev>',
              to: [recipientEmail],
              subject: emailSubject,
              html: emailHtml,
              text: emailText,
            }),
          });
          try {
            resData = await response.json();
          } catch {}
        }

        if (response.ok && (resData?.id || resData?.data?.id)) {
          const msgId = resData.id || resData.data?.id;
          return {
            success: true,
            messageId: msgId,
            simulated: false,
          };
        } else if (resData?.message || resData?.error) {
          const rawErr = resData?.message || resData?.error || response.statusText;
          if (rawErr.toLowerCase().includes('testing emails') || rawErr.toLowerCase().includes('verify a domain')) {
            return {
              success: false,
              error: `Resend Notice: Testing API key can only send to your account email. Use the 1-Click Gmail button below to send to ${recipientEmail}.`,
            };
          }
          return {
            success: false,
            error: `Resend API: ${rawErr}`,
          };
        }
      } catch {
        // Try next fallback endpoint
      }
    }
  }

  return {
    success: false,
    error: 'Email delivery via Resend API could not complete. Use the 1-Click Gmail Web button below to dispatch immediately.',
  };
}
