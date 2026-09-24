import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

async function generate() {
  const upiUri = 'upi://pay?pa=andhrapradeshsolarintegratorswelfareassociation@idbi&pn=Andhra%20Pradesh%20Solar%20Integrators%20Welfare%20Association&cu=INR';
  
  // High resolution PNG QR code
  const outPath = path.resolve(process.cwd(), 'public/payment-qr.png');
  await QRCode.toFile(outPath, upiUri, {
    errorCorrectionLevel: 'H',
    width: 600,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  console.log('Generated payment-qr.png at:', outPath);
}

generate().catch(console.error);
