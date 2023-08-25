/* eslint-disable @next/next/no-head-element */
import "./globals.css";
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className='light'>
			<head>
				<title>Lyricfy</title>
				<meta name="description" content="Elegantly display and capture a song's lyrics" />
				<link rel="icon" href="/favicon.ico" />
			</head>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
