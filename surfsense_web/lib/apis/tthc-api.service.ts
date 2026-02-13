import type {
	TthcCreateRequest,
	TthcImportResult,
	TthcPaginatedResponse,
	TthcProcedure,
	TthcProcedureWithChunks,
	TthcUpdateRequest,
} from "@/contracts/types/tthc.types";
import {
	tthcImportResult,
	tthcPaginatedResponse,
	tthcProcedure,
	tthcProcedureWithChunks,
} from "@/contracts/types/tthc.types";
import { baseApiService } from "./base-api.service";

class TthcApiService {
	/**
	 * List TTHC procedures with pagination and optional filters
	 */
	list = async (
		searchSpaceId: number,
		params?: { page?: number; page_size?: number; name?: string; code?: string },
	): Promise<TthcPaginatedResponse> => {
		const query = new URLSearchParams();
		if (params?.page !== undefined) query.set("page", String(params.page));
		if (params?.page_size !== undefined) query.set("page_size", String(params.page_size));
		if (params?.name) query.set("name", params.name);
		if (params?.code) query.set("code", params.code);

		const qs = query.toString();
		const url = `/tthc/${searchSpaceId}${qs ? `?${qs}` : ""}`;
		return baseApiService.get<TthcPaginatedResponse>(url, tthcPaginatedResponse);
	};

	/**
	 * Get a single TTHC procedure with chunks
	 */
	getById = async (
		searchSpaceId: number,
		tthcId: number,
	): Promise<TthcProcedureWithChunks> => {
		return baseApiService.get<TthcProcedureWithChunks>(
			`/tthc/${searchSpaceId}/${tthcId}`,
			tthcProcedureWithChunks,
		);
	};

	/**
	 * Create a new TTHC procedure
	 */
	create = async (
		searchSpaceId: number,
		data: TthcCreateRequest,
	): Promise<TthcProcedure> => {
		return baseApiService.post<TthcProcedure>(`/tthc/${searchSpaceId}`, tthcProcedure, {
			body: data,
		});
	};

	/**
	 * Update an existing TTHC procedure
	 */
	update = async (
		searchSpaceId: number,
		tthcId: number,
		data: TthcUpdateRequest,
	): Promise<TthcProcedure> => {
		return baseApiService.put<TthcProcedure>(
			`/tthc/${searchSpaceId}/${tthcId}`,
			tthcProcedure,
			{ body: data },
		);
	};

	/**
	 * Delete a TTHC procedure
	 */
	delete = async (searchSpaceId: number, tthcId: number): Promise<void> => {
		await baseApiService.delete(`/tthc/${searchSpaceId}/${tthcId}`);
	};

	/**
	 * Import TTHC procedures from an Excel/CSV file
	 */
	import = async (
		searchSpaceId: number,
		file: File,
	): Promise<TthcImportResult> => {
		const formData = new FormData();
		formData.append("file", file);
		return baseApiService.postFormData<TthcImportResult>(
			`/tthc/${searchSpaceId}/import`,
			tthcImportResult,
			{ body: formData },
		);
	};

	/**
	 * Get TTHC procedure by chunk ID (for citation resolution)
	 */
	getByChunkId = async (
		searchSpaceId: number,
		chunkId: number,
	): Promise<TthcProcedure> => {
		return baseApiService.get<TthcProcedure>(
			`/tthc/${searchSpaceId}/by-chunk/${chunkId}`,
			tthcProcedure,
		);
	};

	/**
	 * Get TTHC procedure by chunk ID (global, no search_space_id needed)
	 * Used for resolving [citation:tthc-XXX] citations
	 */
	getByChunkIdGlobal = async (chunkId: number): Promise<TthcProcedureWithChunks> => {
		return baseApiService.get<TthcProcedureWithChunks>(
			`/tthc/by-chunk/${chunkId}`,
			tthcProcedureWithChunks,
		);
	};
}

export const tthcApiService = new TthcApiService();
