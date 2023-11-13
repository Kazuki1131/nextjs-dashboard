import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { ClerkProvider } from '@clerk/nextjs';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: {
		template: '%s｜Acme Dashboard',
		default: 'Acme Dashboard',
	},
	description: 'Next.js App Routerで構築されたダッシュボードです',
	metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html lang="en" className="h-full">
				<body className={`${inter.className} antialiased min-h-full`}>
					{children}
				</body>
			</html>
		</ClerkProvider>
	);
}
