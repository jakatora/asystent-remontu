import type {PropsWithChildren} from 'react';
import {ScrollViewStyleReset} from 'expo-router/html';

// Polish is the default and currently the only published UI language.
export default function RootHtml({children}: PropsWithChildren) {
  return <html lang="pl"><head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>Asystent Remontu</title>
    <meta name="description" content="Zaplanuj materiały na remont i porównaj cenę całego koszyka z dostawą." />
    <ScrollViewStyleReset />
  </head><body>{children}</body></html>;
}
