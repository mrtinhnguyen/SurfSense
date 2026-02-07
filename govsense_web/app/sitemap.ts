import type { MetadataRoute } from "next";

// Returns a date rounded to the current hour (updates only once per hour)
function getHourlyDate(): Date {
	const now = new Date();
	now.setMinutes(0, 0, 0);
	return now;
}

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = getHourlyDate();

	return [
		{
			url: "https://www.govsense.com/",
			lastModified,
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: "https://www.govsense.com/contact",
			lastModified,
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: "https://www.govsense.com/pricing",
			lastModified,
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: "https://www.govsense.com/privacy",
			lastModified,
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: "https://www.govsense.com/terms",
			lastModified,
			changeFrequency: "daily",
			priority: 0.9,
		},
		// Documentation pages
		{
			url: "https://www.govsense.com/docs",
			lastModified,
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: "https://www.govsense.com/docs/installation",
			lastModified,
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: "https://www.govsense.com/docs/docker-installation",
			lastModified,
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: "https://www.govsense.com/docs/manual-installation",
			lastModified,
			changeFrequency: "daily",
			priority: 0.9,
		},
		// Connector documentation
		{
			url: "https://www.govsense.com/docs/connectors/airtable",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/bookstack",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/circleback",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/clickup",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/confluence",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/discord",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/elasticsearch",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/github",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/gmail",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/google-calendar",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/google-drive",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/jira",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/linear",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/luma",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/microsoft-teams",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/notion",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/slack",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: "https://www.govsense.com/docs/connectors/web-crawler",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
		// How-to documentation
		{
			url: "https://www.govsense.com/docs/how-to/electric-sql",
			lastModified,
			changeFrequency: "daily",
			priority: 0.8,
		},
	];
}
