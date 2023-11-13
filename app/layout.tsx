import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html lang="en" className='h-full'>
				<body className={`${inter.className} antialiased min-h-full`}>{children}</body>
			</html>
		</ClerkProvider>
	);
}
