"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import enMessages from "../messages/en.json";
import zhMessages from "../messages/zh.json";
import viMessages from "../messages/vi.json";

type Locale = "en" | "zh" | "vi";

interface LocaleContextType {
	locale: Locale;
	messages: typeof enMessages;
	setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "govsense-locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
	// Always start with 'vi' to avoid hydration mismatch
	// Then sync with localStorage after mount
	const [locale, setLocaleState] = useState<Locale>("vi");
	const [mounted, setMounted] = useState(false);

	// Get messages based on current locale
	const messages =
		locale === "zh" ? zhMessages : locale === "vi" ? viMessages : enMessages;

	// Load locale from localStorage after component mounts (client-side only)
	useEffect(() => {
		setMounted(true);
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
			if (stored === "zh" || stored === "vi") {
				setLocaleState(stored);
			}
		}
	}, []);

	// Update locale and persist to localStorage
	const setLocale = (newLocale: Locale) => {
		setLocaleState(newLocale);
		if (typeof window !== "undefined") {
			localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
			// Update HTML lang attribute
			document.documentElement.lang = newLocale;
		}
	};

	// Set HTML lang attribute when locale changes
	useEffect(() => {
		if (typeof window !== "undefined" && mounted) {
			document.documentElement.lang = locale;
		}
	}, [locale, mounted]);

	return (
		<LocaleContext.Provider value={{ locale, messages, setLocale }}>
			{children}
		</LocaleContext.Provider>
	);
}

export function useLocaleContext() {
	const context = useContext(LocaleContext);
	if (context === undefined) {
		throw new Error("useLocaleContext must be used within a LocaleProvider");
	}
	return context;
}
