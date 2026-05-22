import '../styles/globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CANVEX — Think in space',
  description: 'The whiteboard that doesn\'t get out of your way. Notes, shapes, real-time presence, and region export in one cinematic canvas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⬡</text></svg>" />
      </head>
      <body className="antialiased select-none overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
