import app from '../app.json';

const webOrigin=typeof document!=='undefined'?document.location.origin:undefined;

export const APP_CONFIG = {
  appName: 'Asystent Remontu',
  version: app.expo.version,
  buildNumber: app.expo.ios.buildNumber,
  supportEmail: webOrigin ? null : 'kontakt@asystentremontu.pl',
  websiteUrl: `${webOrigin??'https://asystentremontu.pl'}`,
  supportUrl: `${webOrigin??'https://asystentremontu.pl'}/pomoc`,
  privacyUrl: `${webOrigin??'https://asystentremontu.pl'}/polityka-prywatnosci`,
  termsUrl: `${webOrigin??'https://asystentremontu.pl'}/regulamin`,
  marketingUrl: `${webOrigin??'https://asystentremontu.pl'}`,
  copyright: 'Copyright \u00A9 2026 Asystent Remontu',
  ownerName: 'Asystent Remontu',
} as const;
