import jsPDF from 'jspdf';

export interface MemberCertificateData {
  id: string;
  fullName: string;
  emailAddress: string;
  mobileNumber: string;
  dateOfBirth?: string;
  companyName: string;
  designation?: string;
  district?: string;
  businessType?: string;
  gstNumber?: string;
  officeAddress?: string;
  pincode?: string;
  photoUrl?: string;
  applicationType?: string;
  status?: string;
  submissionDate?: string;
  validUntil?: string;
}

// Helper to safely load an image from URL or Data URL with fallback
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Helper to draw rounded rectangle in Canvas
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Generates an ultra-high resolution HTML5 Canvas of the APSIWA Certificate & ID Card
 */
export async function renderCertificateCanvas(data: MemberCertificateData): Promise<HTMLCanvasElement> {
  const width = 1240;
  const height = 1754;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // Preload logo and member photo
  const [logoImg, photoImg] = await Promise.all([
    loadImage('/logo.png'),
    data.photoUrl ? loadImage(data.photoUrl) : Promise.resolve(null)
  ]);

  // 1. Base Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Decorative Outer Borders
  ctx.strokeStyle = '#003477';
  ctx.lineWidth = 8;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  ctx.strokeStyle = '#ffbe3b';
  ctx.lineWidth = 3;
  ctx.strokeRect(38, 38, width - 76, height - 76);

  // 2. Official Header Letterhead
  const topY = 65;

  // Logo
  if (logoImg) {
    ctx.drawImage(logoImg, 60, topY, 84, 84);
  } else {
    // Fallback Logo Box
    ctx.fillStyle = '#003477';
    roundRect(ctx, 60, topY, 84, 84, 12);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('APSIWA', 102, topY + 50);
  }

  // Header Govt Badge
  ctx.fillStyle = '#ffbe3b';
  roundRect(ctx, 160, topY, 320, 22, 4);
  ctx.fill();
  ctx.fillStyle = '#00285e';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('GOVT. RECOGNIZED STATE SOLAR WELFARE BODY', 170, topY + 15);

  // Main Association Title
  ctx.fillStyle = '#003477';
  ctx.font = 'bold 23px Arial, sans-serif';
  ctx.fillText('ANDHRA PRADESH SOLAR INTEGRATORS WELFARE ASSOCIATION', 160, topY + 48);

  // Subtitle
  ctx.fillStyle = '#475569';
  ctx.font = '600 13px Arial, sans-serif';
  ctx.fillText('State Secretariat: Visakhapatnam • CPDCL / EPDCL Regulatory Liaison Body • www.apsiwa.in', 160, topY + 70);

  // Top Right Accreditation Badge
  ctx.fillStyle = '#f0fdf4';
  roundRect(ctx, 1010, topY + 5, 170, 65, 10);
  ctx.fill();
  ctx.strokeStyle = '#006e2e';
  ctx.lineWidth = 2;
  roundRect(ctx, 1010, topY + 5, 170, 65, 10);
  ctx.stroke();

  ctx.fillStyle = '#006e2e';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ACCREDITATION', 1095, topY + 28);
  ctx.fillStyle = '#003477';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('LIFE MEMBER', 1095, topY + 52);

  // Top Divider Line
  ctx.strokeStyle = '#003477';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, topY + 100);
  ctx.lineTo(1180, topY + 100);
  ctx.stroke();

  // 3. Meta Reference Bar (y: 185 to 260)
  const metaY = 185;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, 60, metaY, 1120, 72, 12);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 60, metaY, 1120, 72, 12);
  ctx.stroke();

  // Meta Column 1: Membership Number
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('MEMBERSHIP NUMBER', 85, metaY + 26);
  ctx.fillStyle = '#003477';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(data.id || 'APSIWA-MEMBER', 85, metaY + 53);

  // Meta Column 2: Admission Status
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('ADMISSION STATUS', 620, metaY + 26);

  ctx.fillStyle = '#dcfce7';
  roundRect(ctx, 520, metaY + 34, 200, 26, 13);
  ctx.fill();
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 1;
  roundRect(ctx, 520, metaY + 34, 200, 26, 13);
  ctx.stroke();
  ctx.fillStyle = '#006e2e';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText('• APPROVED & ACTIVE', 620, metaY + 51);

  // Meta Column 3: Validity Period
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('VALIDITY PERIOD', 1155, metaY + 26);
  ctx.fillStyle = '#006e2e';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(data.validUntil || '2026 - 2031', 1155, metaY + 53);

  // 4. Formal Certificate Declaration
  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  ctx.font = '500 13.5px Arial, sans-serif';
  const declY = 285;
  ctx.fillText(
    'This official certificate confirms that the applicant enterprise and authorized representative detailed below are verified and',
    60,
    declY
  );
  ctx.fillText(
    'accredited as an active institutional member of the Andhra Pradesh Solar Integrators Welfare Association (APSIWA).',
    60,
    declY + 20
  );

  // 5. Two-Column Breakdown Boxes (y: 330 to 760)
  const boxY = 330;
  const boxH = 410;
  const boxW = 545;

  // --- Left Box: Representative Profile ---
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, 60, boxY, boxW, boxH, 14);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 60, boxY, boxW, boxH, 14);
  ctx.stroke();

  // Box 1 Header
  ctx.fillStyle = '#003477';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText('1. REPRESENTATIVE PROFILE', 80, boxY + 32);

  ctx.fillStyle = '#006e2e';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('VERIFIED', 60 + boxW - 20, boxY + 32);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, boxY + 45);
  ctx.lineTo(60 + boxW - 20, boxY + 45);
  ctx.stroke();

  // Box 1 Fields
  const renderRow = (label: string, value: string, rowY: number, startX: number, isRightCol = false) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '600 13px Arial, sans-serif';
    ctx.fillText(label, startX, rowY);

    ctx.fillStyle = isRightCol ? '#003477' : '#0f172a';
    ctx.font = 'bold 13.5px Arial, sans-serif';
    ctx.fillText(value || 'N/A', startX + 130, rowY);
  };

  let rowY = boxY + 80;
  renderRow('Full Name:', data.fullName, rowY, 80);
  rowY += 45;
  renderRow('Designation:', data.designation || 'Authorized Representative', rowY, 80);
  rowY += 45;
  renderRow('Date of Birth:', data.dateOfBirth || 'N/A', rowY, 80);
  rowY += 45;
  renderRow('Mobile No:', data.mobileNumber, rowY, 80);
  rowY += 45;
  renderRow('Email ID:', data.emailAddress, rowY, 80, true);
  rowY += 45;
  renderRow('Member Type:', data.applicationType || 'New Member', rowY, 80);
  rowY += 45;
  renderRow('Accreditation:', 'Full State Accreditation', rowY, 80);

  // --- Right Box: Enterprise Credentials ---
  const box2X = 635;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, box2X, boxY, boxW, boxH, 14);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  roundRect(ctx, box2X, boxY, boxW, boxH, 14);
  ctx.stroke();

  // Box 2 Header
  ctx.textAlign = 'left';
  ctx.fillStyle = '#003477';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText('2. ENTERPRISE CREDENTIALS', box2X + 20, boxY + 32);

  ctx.fillStyle = '#003477';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('STATE TIER-1', box2X + boxW - 20, boxY + 32);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(box2X + 20, boxY + 45);
  ctx.lineTo(box2X + boxW - 20, boxY + 45);
  ctx.stroke();

  // Box 2 Fields
  rowY = boxY + 80;
  renderRow('Firm Name:', data.companyName, rowY, box2X + 20, true);
  rowY += 45;
  renderRow('Business Type:', data.businessType || 'Solar EPC Enterprise', rowY, box2X + 20);
  rowY += 45;
  renderRow('District / State:', `${data.district || 'Visakhapatnam'}, AP`, rowY, box2X + 20);
  rowY += 45;
  renderRow('GSTIN:', data.gstNumber || 'N/A', rowY, box2X + 20);
  rowY += 45;
  const fullAddr = `${data.officeAddress || 'Andhra Pradesh'}${data.pincode ? ' - ' + data.pincode : ''}`;
  renderRow('Office Address:', fullAddr.length > 32 ? fullAddr.slice(0, 32) + '...' : fullAddr, rowY, box2X + 20);
  rowY += 45;
  renderRow('Sector Scope:', 'Rooftop & Ground Mount Solar', rowY, box2X + 20);
  rowY += 45;
  renderRow('Status:', 'Institutional Member', rowY, box2X + 20);

  // 6. Secretariat Seal & Verification Footnote (y: 770 to 860)
  const sealY = 765;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, sealY);
  ctx.lineTo(1180, sealY);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText('Issued by: APSIWA Secretariat, Visakhapatnam', 60, sealY + 25);
  ctx.fillText(`Admission Date: ${data.submissionDate || '2026'} | Registry ID: ${data.id}`, 60, sealY + 45);

  // Official Seal Badge
  ctx.fillStyle = '#f0fdf4';
  roundRect(ctx, 1020, sealY + 10, 160, 52, 8);
  ctx.fill();
  ctx.strokeStyle = '#003477';
  ctx.lineWidth = 2;
  roundRect(ctx, 1020, sealY + 10, 160, 52, 8);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#006e2e';
  ctx.font = 'bold 9px Arial, sans-serif';
  ctx.fillText('OFFICIAL SEAL', 1100, sealY + 28);
  ctx.fillStyle = '#003477';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText('APSIWA 2026', 1100, sealY + 48);

  // 7. Scissor Cut Line (y: 855 to 895)
  const cutY = 855;
  ctx.fillStyle = '#f1f5f9';
  roundRect(ctx, 60, cutY, 1120, 36, 6);
  ctx.fill();

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(60, cutY, 1120, 36);
  ctx.setLineDash([]); // Reset dash

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✂ - - - - - - - - - - Cut Along Dotted Line To Detach Membership ID Card - - - - - - - - - - ✂', 620, cutY + 23);

  // 8. Bottom Detachable Wallet ID Card (y: 915 to 1690)
  const cardW = 920;
  const cardH = 430;
  const cardX = (width - cardW) / 2;
  const cardY = 920;

  // Card Outer Shadow / Border
  ctx.save();
  roundRect(ctx, cardX, cardY, cardW, cardH, 20);
  ctx.clip();

  // Card Background Gradient
  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  cardGrad.addColorStop(0, '#001438');
  cardGrad.addColorStop(0.5, '#00285e');
  cardGrad.addColorStop(1, '#003477');
  ctx.fillStyle = cardGrad;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Card Header Strip
  ctx.fillStyle = '#00193d';
  ctx.fillRect(cardX, cardY, cardW, 65);

  ctx.strokeStyle = '#ffbe3b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX, cardY + 65);
  ctx.lineTo(cardX + cardW, cardY + 65);
  ctx.stroke();

  // Card Header Logo
  if (logoImg) {
    ctx.drawImage(logoImg, cardX + 20, cardY + 12, 42, 42);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 19px Arial, sans-serif';
  ctx.fillText('APSIWA', cardX + 75, cardY + 32);

  ctx.fillStyle = '#8ef9a0';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.fillText('Andhra Pradesh Solar Integrators Welfare Association', cardX + 75, cardY + 50);

  // Header Right Badge
  ctx.fillStyle = '#ffbe3b';
  roundRect(ctx, cardX + cardW - 190, cardY + 18, 170, 28, 6);
  ctx.fill();
  ctx.fillStyle = '#00285e';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MEMBER ID CARD (FRONT)', cardX + cardW - 105, cardY + 36);

  // Member Photo (Left side of card)
  const photoBoxX = cardX + 35;
  const photoBoxY = cardY + 90;
  const photoBoxW = 140;
  const photoBoxH = 175;

  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, photoBoxX, photoBoxY, photoBoxW, photoBoxH, 10);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  roundRect(ctx, photoBoxX, photoBoxY, photoBoxW, photoBoxH, 10);
  ctx.stroke();

  if (photoImg) {
    ctx.save();
    roundRect(ctx, photoBoxX, photoBoxY, photoBoxW, photoBoxH, 10);
    ctx.clip();
    ctx.drawImage(photoImg, photoBoxX, photoBoxY, photoBoxW, photoBoxH);
    ctx.restore();
  } else {
    // Initial letter avatar
    ctx.fillStyle = '#003477';
    roundRect(ctx, photoBoxX, photoBoxY, photoBoxW, photoBoxH, 10);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((data.fullName || 'A').charAt(0).toUpperCase(), photoBoxX + photoBoxW / 2, photoBoxY + photoBoxH / 2 + 15);
  }

  // Verified Badge under Photo
  ctx.fillStyle = '#00193d';
  roundRect(ctx, photoBoxX, photoBoxY + photoBoxH + 10, photoBoxW, 24, 6);
  ctx.fill();
  ctx.fillStyle = '#8ef9a0';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('• VERIFIED MEMBER', photoBoxX + photoBoxW / 2, photoBoxY + photoBoxH + 26);

  // Member Info (Middle of card)
  const infoX = cardX + 210;
  const infoY = cardY + 105;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText(data.fullName.toUpperCase(), infoX, infoY + 15);

  ctx.fillStyle = '#ffbe3b';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText(`${data.designation || 'Authorized Representative'} • ${data.companyName}`, infoX, infoY + 42);

  // Info Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(infoX, infoY + 58);
  ctx.lineTo(cardX + cardW - 180, infoY + 58);
  ctx.stroke();

  // Grid details in ID Card
  const gridY = infoY + 80;

  // ID NUMBER
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.fillText('ID NUMBER:', infoX, gridY);
  ctx.fillStyle = '#ffbe3b';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(data.id, infoX, gridY + 22);

  // DOB
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.fillText('DOB:', infoX + 220, gridY);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText(data.dateOfBirth || 'N/A', infoX + 220, gridY + 22);

  // DISTRICT
  const gridRow2Y = gridY + 50;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.fillText('DISTRICT:', infoX, gridRow2Y);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText(data.district || 'Visakhapatnam', infoX, gridRow2Y + 22);

  // VALID TILL
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.fillText('VALID TILL:', infoX + 220, gridRow2Y);
  ctx.fillStyle = '#8ef9a0';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(data.validUntil || '2026 - 2031', infoX + 220, gridRow2Y + 22);

  // Gold Seal on Right of card
  const sealRightX = cardX + cardW - 95;
  const sealRightY = cardY + 185;

  ctx.fillStyle = '#ffbe3b';
  ctx.beginPath();
  ctx.arc(sealRightX, sealRightY, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#00285e';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('APSIWA', sealRightX, sealRightY - 5);
  ctx.fillText('SEAL', sealRightX, sealRightY + 15);

  // Card Footer Bar
  ctx.fillStyle = '#00122e';
  ctx.fillRect(cardX, cardY + cardH - 38, cardW, 38);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '11px Arial, sans-serif';
  ctx.fillText('Govt. Recognized State Solar Association • Andhra Pradesh', cardX + 25, cardY + cardH - 14);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#8ef9a0';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('Authorized Bearer Credential', cardX + cardW - 25, cardY + cardH - 14);

  ctx.restore();

  // Card Golden Outer Border
  ctx.strokeStyle = '#ffbe3b';
  ctx.lineWidth = 4;
  roundRect(ctx, cardX, cardY, cardW, cardH, 20);
  ctx.stroke();

  return canvas;
}

/**
 * 1-Click Direct PDF Download (Generates and downloads file immediately)
 */
export async function downloadCertificatePDFDirect(data: MemberCertificateData): Promise<void> {
  const canvas = await renderCertificateCanvas(data);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
  pdf.save(`APSIWA-Certificate-${data.id}.pdf`);
}

/**
 * 1-Click Direct PNG Image Download (Generates and downloads file immediately)
 */
export async function downloadCertificatePNGDirect(data: MemberCertificateData): Promise<void> {
  const canvas = await renderCertificateCanvas(data);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `APSIWA-Membership-${data.id}.png`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
          resolve();
        }, 300);
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `APSIWA-Membership-${data.id}.png`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      }, 300);
    }, 'image/png');
  });
}
