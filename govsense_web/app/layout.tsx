import type { Metadata } from "next";
import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Roboto } from "next/font/google";
import { ElectricProvider } from "@/components/providers/ElectricProvider";
import { GlobalLoadingProvider } from "@/components/providers/GlobalLoadingProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ReactQueryClientProvider } from "@/lib/query-client/query-client.provider";
import { cn } from "@/lib/utils";
import { BRAND_NAME, BRAND_DESCRIPTION, BRAND_KEYWORDS, BRAND_DOMAIN, BRAND_TWITTER_CARD } from "@/lib/brand";

const roboto = Roboto({
	subsets: ["latin"],
	weight: ["400", "500", "700"],
	display: "swap",
	variable: "--font-roboto",
});

export const metadata: Metadata = {
	title: `${BRAND_NAME} – ${BRAND_DESCRIPTION}`,
	description: BRAND_DESCRIPTION,
	keywords: BRAND_KEYWORDS,
	openGraph: {
		title: `${BRAND_NAME} – ${BRAND_DESCRIPTION}`,
		description: BRAND_DESCRIPTION,
		url: BRAND_DOMAIN,
		siteName: BRAND_NAME,
		type: "website",
		images: [
			{
				url: `${BRAND_DOMAIN}/og-image.png`,
				width: 1200,
				height: 630,
				alt: `${BRAND_NAME} AI Research Assistant`,
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: `${BRAND_NAME} – ${BRAND_DESCRIPTION}`,
		description: BRAND_DESCRIPTION,
		creator: BRAND_DOMAIN,
		site: BRAND_DOMAIN,
		images: [
			{
				url: `${BRAND_DOMAIN}/og-image-twitter.png`,
				width: 1200,
				height: 630,
				alt: `${BRAND_NAME} AI Assistant Preview`,
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Using client-side i18n
	// Language can be switched dynamically through LanguageSwitcher component
	// Locale state is managed by LocaleContext and persisted in localStorage
	return (
		<html lang="vi" suppressHydrationWarning>
			<body className={cn(roboto.className, "bg-white dark:bg-black antialiased h-full w-full ")}>
				<PostHogProvider>
					<LocaleProvider>
						<I18nProvider>
							<ThemeProvider
								attribute="class"
								enableSystem
								disableTransitionOnChange
								defaultTheme="system"
							>
								<RootProvider>
									<ReactQueryClientProvider>
										<ElectricProvider>
											<GlobalLoadingProvider>{children}</GlobalLoadingProvider>
										</ElectricProvider>
									</ReactQueryClientProvider>
									<Toaster />
								</RootProvider>
							</ThemeProvider>
						</I18nProvider>
					</LocaleProvider>
				</PostHogProvider>
			</body>
		</html>
	);
}
