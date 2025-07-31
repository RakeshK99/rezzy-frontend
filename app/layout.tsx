// app/layout.tsx
import '../styles/global.css';

import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Rezzy',
  description: 'AI Resume Evaluator SaaS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="pt-20 px-6">{children}</main>
      </body>
    </html>
  );
}
