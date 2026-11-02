import app from '../app.json';

const webOrigin=typeof document!=='undefined'?document.location.origin:undefined;

export const APP_CONFIG = {
  appName: 'Asystent Remontu',
  version: app.expo.version,
  buildNumber: app.expo.ios.buildNumber,
  supportEmail: webOrigin ? null : 'jakatora68@gmail.com',
  websiteUrl: `${webOrigin??'https://asystent-remontu-web-production.up.railway.app'}`,
  supportUrl: `${webOrigin??'https://asystent-remontu-web-production.up.railway.app'}/pomoc`,
  privacyUrl: `${webOrigin??'https://asystent-remontu-web-production.up.railway.app'}/polityka-prywatnosci`,
  termsUrl: `${webOrigin??'https://asystent-remontu-web-production.up.railway.app'}/regulamin`,
  marketingUrl: `${webOrigin??'https://asystent-remontu-web-production.up.railway.app'}`,
  copyright: 'Copyright \u00A9 2026 Asystent Remontu',
  ownerName: 'Asystent Remontu',
} as const;
