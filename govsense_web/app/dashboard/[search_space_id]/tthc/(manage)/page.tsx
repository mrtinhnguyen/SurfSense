"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	FileText,
	Plus,
	Upload,
	Search,
	Pencil,
	Trash2,
	Eye,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TthcCreateRequest, TthcProcedure, TthcUpdateRequest } from "@/contracts/types/tthc.types";
import { tthcApiService } from "@/lib/apis/tthc-api.service";

function useDebounced<T>(value: T, delay = 300) {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return debounced;
}

export default function TthcManagePage() {
	const params = useParams();
	const searchSpaceId = Number(params.search_space_id);
	const queryClient = useQueryClient();

	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounced(search);
	const [page, setPage] = useState(0);
	const pageSize = 20;

	// Dialogs state
	const [formOpen, setFormOpen] = useState(false);
	const [editingProcedure, setEditingProcedure] = useState<TthcProcedure | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);
	const [detailProcedure, setDetailProcedure] = useState<TthcProcedure | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [importOpen, setImportOpen] = useState(false);

	// Form state
	const [formData, setFormData] = useState<TthcCreateRequest>({
		name: "",
		code: null,
		deadline: null,
		location: null,
		method: null,
		legal_basis: null,
		form_attachments: null,
		fee: null,
		result: null,
		subjects: null,
		implementing_agency: null,
	});

	const cacheKey = ["tthc", searchSpaceId, page, pageSize, debouncedSearch];

	const { data, isLoading } = useQuery({
		queryKey: cacheKey,
		queryFn: () =>
			tthcApiService.list(searchSpaceId, {
				page,
				page_size: pageSize,
				name: debouncedSearch || undefined,
			}),
		enabled: !!searchSpaceId,
	});

	const createMutation = useMutation({
		mutationFn: (data: TthcCreateRequest) => tthcApiService.create(searchSpaceId, data),
		onSuccess: () => {
			toast.success("Đã tạo thủ tục hành chính");
			queryClient.invalidateQueries({ queryKey: ["tthc", searchSpaceId] });
			setFormOpen(false);
			resetForm();
		},
		onError: (err: Error) => toast.error(err.message || "Tạo thất bại"),
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: TthcUpdateRequest }) =>
			tthcApiService.update(searchSpaceId, id, data),
		onSuccess: () => {
			toast.success("Đã cập nhật thủ tục hành chính");
			queryClient.invalidateQueries({ queryKey: ["tthc", searchSpaceId] });
			setFormOpen(false);
			setEditingProcedure(null);
			resetForm();
		},
		onError: (err: Error) => toast.error(err.message || "Cập nhật thất bại"),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => tthcApiService.delete(searchSpaceId, id),
		onSuccess: () => {
			toast.success("Đã xóa thủ tục hành chính");
			queryClient.invalidateQueries({ queryKey: ["tthc", searchSpaceId] });
			setDeleteConfirmOpen(false);
			setDeletingId(null);
		},
		onError: (err: Error) => toast.error(err.message || "Xóa thất bại"),
	});

	const importMutation = useMutation({
		mutationFn: (file: File) => tthcApiService.import(searchSpaceId, file),
		onSuccess: (result) => {
			toast.success(
				`Import hoàn tất: ${result.created} tạo mới, ${result.skipped} bỏ qua` +
					(result.errors.length > 0 ? `, ${result.errors.length} lỗi` : ""),
			);
			queryClient.invalidateQueries({ queryKey: ["tthc", searchSpaceId] });
			setImportOpen(false);
		},
		onError: (err: Error) => toast.error(err.message || "Import thất bại"),
	});

	const resetForm = useCallback(() => {
		setFormData({
			name: "",
			code: null,
			deadline: null,
			location: null,
			method: null,
			legal_basis: null,
			form_attachments: null,
			fee: null,
			result: null,
			subjects: null,
			implementing_agency: null,
		});
	}, []);

	const openCreate = useCallback(() => {
		resetForm();
		setEditingProcedure(null);
		setFormOpen(true);
	}, [resetForm]);

	const openEdit = useCallback((proc: TthcProcedure) => {
		setEditingProcedure(proc);
		setFormData({
			name: proc.name,
			code: proc.code ?? null,
			deadline: proc.deadline ?? null,
			location: proc.location ?? null,
			method: proc.method ?? null,
			legal_basis: proc.legal_basis ?? null,
			form_attachments: proc.form_attachments ?? null,
			fee: proc.fee ?? null,
			result: proc.result ?? null,
			subjects: proc.subjects ?? null,
			implementing_agency: proc.implementing_agency ?? null,
		});
		setFormOpen(true);
	}, []);

	const openDetail = useCallback((proc: TthcProcedure) => {
		setDetailProcedure(proc);
		setDetailOpen(true);
	}, []);

	const handleFormSubmit = useCallback(() => {
		if (!formData.name.trim()) {
			toast.error("Tên thủ tục không được để trống");
			return;
		}
		if (editingProcedure) {
			updateMutation.mutate({ id: editingProcedure.id, data: formData });
		} else {
			createMutation.mutate(formData);
		}
	}, [formData, editingProcedure, createMutation, updateMutation]);

	const handleImportFile = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			importMutation.mutate(file);
		},
		[importMutation],
	);

	const updateField = useCallback(
		(field: keyof TthcCreateRequest, value: string) => {
			setFormData((prev) => ({ ...prev, [field]: value || null }));
		},
		[],
	);

	const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

	return (
		<div className="flex flex-col gap-4 p-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					<h1 className="text-xl font-semibold">Thủ tục hành chính</h1>
					{data && (
						<span className="text-sm text-muted-foreground">({data.total})</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
						<Upload className="mr-1 h-4 w-4" />
						Nhập từ file
					</Button>
					<Button size="sm" onClick={openCreate}>
						<Plus className="mr-1 h-4 w-4" />
						Thêm TTHC
					</Button>
				</div>
			</div>

			{/* Search */}
			<div className="relative max-w-sm">
				<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Tìm kiếm theo tên..."
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(0);
					}}
					className="pl-8"
				/>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[40%]">Tên thủ tục</TableHead>
							<TableHead>Mã</TableHead>
							<TableHead>Thời hạn</TableHead>
							<TableHead>Cơ quan</TableHead>
							<TableHead className="w-[100px]">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
									Đang tải...
								</TableCell>
							</TableRow>
						) : !data?.items.length ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
									{search
										? "Không tìm thấy thủ tục phù hợp"
										: "Chưa có thủ tục hành chính nào"}
								</TableCell>
							</TableRow>
						) : (
							data.items.map((proc) => (
								<TableRow key={proc.id}>
									<TableCell className="font-medium">{proc.name}</TableCell>
									<TableCell className="text-muted-foreground">
										{proc.code || "—"}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{proc.deadline || "—"}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{proc.implementing_agency || "—"}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => openDetail(proc)}
												title="Xem chi tiết"
											>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => openEdit(proc)}
												title="Sửa"
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive"
												onClick={() => {
													setDeletingId(proc.id);
													setDeleteConfirmOpen(true);
												}}
												title="Xóa"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">
						Trang {page + 1} / {totalPages}
					</span>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={page === 0}
							onClick={() => setPage((p) => p - 1)}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={page >= totalPages - 1}
							onClick={() => setPage((p) => p + 1)}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Create/Edit Form Dialog */}
			<Dialog open={formOpen} onOpenChange={setFormOpen}>
				<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingProcedure ? "Sửa thủ tục hành chính" : "Thêm thủ tục hành chính"}
						</DialogTitle>
						<DialogDescription>
							Nhập thông tin thủ tục hành chính. Trường có dấu * là bắt buộc.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Tên thủ tục *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => updateField("name", e.target.value)}
								placeholder="Tên thủ tục hành chính"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="code">Mã thủ tục</Label>
								<Input
									id="code"
									value={formData.code || ""}
									onChange={(e) => updateField("code", e.target.value)}
									placeholder="VD: 001-TG"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="fee">Lệ phí</Label>
								<Input
									id="fee"
									value={formData.fee || ""}
									onChange={(e) => updateField("fee", e.target.value)}
									placeholder="VD: Không thu phí"
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="deadline">Thời hạn giải quyết</Label>
							<Input
								id="deadline"
								value={formData.deadline || ""}
								onChange={(e) => updateField("deadline", e.target.value)}
								placeholder="VD: 05 ngày làm việc"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="location">Địa điểm thực hiện</Label>
							<Input
								id="location"
								value={formData.location || ""}
								onChange={(e) => updateField("location", e.target.value)}
								placeholder="Nơi tiếp nhận hồ sơ"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="method">Cách thức thực hiện</Label>
							<Textarea
								id="method"
								value={formData.method || ""}
								onChange={(e) => updateField("method", e.target.value)}
								placeholder="Mô tả cách thức thực hiện"
								rows={2}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="subjects">Đối tượng thực hiện</Label>
								<Input
									id="subjects"
									value={formData.subjects || ""}
									onChange={(e) => updateField("subjects", e.target.value)}
									placeholder="VD: Tổ chức, cá nhân"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="implementing_agency">Cơ quan thực hiện</Label>
								<Input
									id="implementing_agency"
									value={formData.implementing_agency || ""}
									onChange={(e) => updateField("implementing_agency", e.target.value)}
									placeholder="VD: Sở Nội vụ"
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="result">Kết quả thực hiện</Label>
							<Input
								id="result"
								value={formData.result || ""}
								onChange={(e) => updateField("result", e.target.value)}
								placeholder="VD: Giấy chứng nhận"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="legal_basis">Căn cứ pháp lý</Label>
							<Textarea
								id="legal_basis"
								value={formData.legal_basis || ""}
								onChange={(e) => updateField("legal_basis", e.target.value)}
								placeholder="Các văn bản pháp luật liên quan"
								rows={3}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setFormOpen(false)}>
							Hủy
						</Button>
						<Button
							onClick={handleFormSubmit}
							disabled={createMutation.isPending || updateMutation.isPending}
						>
							{createMutation.isPending || updateMutation.isPending
								? "Đang xử lý..."
								: editingProcedure
									? "Cập nhật"
									: "Tạo mới"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Detail Dialog */}
			<Dialog open={detailOpen} onOpenChange={setDetailOpen}>
				<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{detailProcedure?.name}</DialogTitle>
						{detailProcedure?.code && (
							<DialogDescription>Mã: {detailProcedure.code}</DialogDescription>
						)}
					</DialogHeader>
					{detailProcedure && (
						<div className="grid gap-3 py-4 text-sm">
							{detailProcedure.implementing_agency && (
								<DetailRow label="Cơ quan thực hiện" value={detailProcedure.implementing_agency} />
							)}
							{detailProcedure.subjects && (
								<DetailRow label="Đối tượng" value={detailProcedure.subjects} />
							)}
							{detailProcedure.deadline && (
								<DetailRow label="Thời hạn giải quyết" value={detailProcedure.deadline} />
							)}
							{detailProcedure.location && (
								<DetailRow label="Địa điểm" value={detailProcedure.location} />
							)}
							{detailProcedure.method && (
								<DetailRow label="Cách thức thực hiện" value={detailProcedure.method} />
							)}
							{detailProcedure.fee && (
								<DetailRow label="Lệ phí" value={detailProcedure.fee} />
							)}
							{detailProcedure.result && (
								<DetailRow label="Kết quả" value={detailProcedure.result} />
							)}
							{detailProcedure.legal_basis && (
								<DetailRow label="Căn cứ pháp lý" value={detailProcedure.legal_basis} />
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation */}
			<AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa thủ tục hành chính này? Hành động không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deletingId && deleteMutation.mutate(deletingId)}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Import Dialog */}
			<Dialog open={importOpen} onOpenChange={setImportOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Nhập thủ tục hành chính từ file</DialogTitle>
						<DialogDescription>
							Chọn file Excel (.xlsx) hoặc CSV (.csv) chứa danh mục thủ tục hành chính.
							Header cần bao gồm: Tên thủ tục, Mã thủ tục, Thời hạn giải quyết, v.v.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Input
							type="file"
							accept=".xlsx,.csv"
							onChange={handleImportFile}
							disabled={importMutation.isPending}
						/>
						{importMutation.isPending && (
							<p className="mt-2 text-sm text-muted-foreground">Đang xử lý import...</p>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<span className="font-medium text-muted-foreground">{label}:</span>
			<p className="mt-0.5 whitespace-pre-wrap">{value}</p>
		</div>
	);
}
