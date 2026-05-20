import type { Metadata } from 'next';
import './globals.css';


export const metadata: Metadata = {
  title: 'Food Rescue Connect | AI-Driven Real-Time Logistics',
  description: 'Bridging the gap between food donors, volunteers, and NGOs to minimize food waste and support communities with real-time AI-driven routing and coordination.',
};

import AiCopilot from '../components/AiCopilot';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <AiCopilot />
      </body>
    </html>
  );
}
