import { z } from "zod";

export const tthcFormAttachment = z.object({
	name: z.string(),
	url: z.string().nullable().optional(),
});

export const tthcProcedure = z.object({
	id: z.number(),
	name: z.string(),
	code: z.string().nullable().optional(),
	deadline: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	method: z.string().nullable().optional(),
	legal_basis: z.string().nullable().optional(),
	form_attachments: z.array(tthcFormAttachment).nullable().optional(),
	fee: z.string().nullable().optional(),
	result: z.string().nullable().optional(),
	subjects: z.string().nullable().optional(),
	implementing_agency: z.string().nullable().optional(),
	search_space_id: z.number(),
	created_at: z.string().nullable().optional(),
	updated_at: z.string().nullable().optional(),
});

export const tthcProcedureWithChunks = tthcProcedure.extend({
	chunks: z.array(z.object({ id: z.number(), content: z.string() })).optional(),
	content: z.string().nullable().optional(),
});

export const tthcPaginatedResponse = z.object({
	items: z.array(tthcProcedure),
	total: z.number(),
	page: z.number(),
	page_size: z.number(),
});

export const tthcCreateRequest = z.object({
	name: z.string().min(1, "Tên thủ tục không được để trống"),
	code: z.string().nullable().optional(),
	deadline: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	method: z.string().nullable().optional(),
	legal_basis: z.string().nullable().optional(),
	form_attachments: z.array(tthcFormAttachment).nullable().optional(),
	fee: z.string().nullable().optional(),
	result: z.string().nullable().optional(),
	subjects: z.string().nullable().optional(),
	implementing_agency: z.string().nullable().optional(),
});

export const tthcUpdateRequest = tthcCreateRequest.partial();

export const tthcImportResult = z.object({
	created: z.number(),
	updated: z.number(),
	skipped: z.number(),
	errors: z.array(z.string()),
});

export type TthcFormAttachment = z.infer<typeof tthcFormAttachment>;
export type TthcProcedure = z.infer<typeof tthcProcedure>;
export type TthcProcedureWithChunks = z.infer<typeof tthcProcedureWithChunks>;
export type TthcPaginatedResponse = z.infer<typeof tthcPaginatedResponse>;
export type TthcCreateRequest = z.infer<typeof tthcCreateRequest>;
export type TthcUpdateRequest = z.infer<typeof tthcUpdateRequest>;
export type TthcImportResult = z.infer<typeof tthcImportResult>;
