"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Info, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { searchSpacesApiService } from "@/lib/apis/search-spaces-api.service";
import { authenticatedFetch } from "@/lib/auth-utils";
import { cacheKeys } from "@/lib/query-client/cache-keys";

interface PromptConfigManagerProps {
	searchSpaceId: number;
}

export function PromptConfigManager({ searchSpaceId }: PromptConfigManagerProps) {
	const {
		data: searchSpace,
		isLoading: loading,
		refetch: fetchSearchSpace,
	} = useQuery({
		queryKey: cacheKeys.searchSpaces.detail(searchSpaceId.toString()),
		queryFn: () => searchSpacesApiService.getSearchSpace({ id: searchSpaceId }),
		enabled: !!searchSpaceId,
	});

	const [customInstructions, setCustomInstructions] = useState("");
	const [saving, setSaving] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	// Initialize state from fetched search space
	useEffect(() => {
		if (searchSpace) {
			setCustomInstructions(searchSpace.qna_custom_instructions || "");
			setHasChanges(false);
		}
	}, [searchSpace]);

	// Track changes
	useEffect(() => {
		if (searchSpace) {
			const currentCustom = searchSpace.qna_custom_instructions || "";
			const changed = currentCustom !== customInstructions;
			setHasChanges(changed);
		}
	}, [searchSpace, customInstructions]);

	const handleSave = async () => {
		try {
			setSaving(true);

			const payload = {
				qna_custom_instructions: customInstructions.trim() || "",
			};

			const response = await authenticatedFetch(
				`${process.env.NEXT_PUBLIC_FASTAPI_BACKEND_URL}/api/v1/searchspaces/${searchSpaceId}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				}
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.detail || "Lỗi khi lưu hướng dẫn hệ thống");
			}

			toast.success("Hướng dẫn hệ thống đã được lưu thành công");
			setHasChanges(false);
			await fetchSearchSpace();
		} catch (error: any) {
			console.error("Error saving system instructions:", error);
			toast.error(error.message || "Lỗi khi lưu hướng dẫn hệ thống");
		} finally {
			setSaving(false);
		}
	};

	const handleReset = () => {
		if (searchSpace) {
			setCustomInstructions(searchSpace.qna_custom_instructions || "");
			setHasChanges(false);
		}
	};

	if (loading) {
		return (
			<div className="space-y-4 md:space-y-6">
				<Card>
					<CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-2 md:pb-3">
						<Skeleton className="h-5 md:h-6 w-36 md:w-48" />
						<Skeleton className="h-3 md:h-4 w-full max-w-md mt-2" />
					</CardHeader>
					<CardContent className="space-y-3 md:space-y-4 px-3 md:px-6 pb-3 md:pb-6">
						<Skeleton className="h-16 md:h-20 w-full" />
						<Skeleton className="h-24 md:h-32 w-full" />
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-4 md:space-y-6">
			{/* Work in Progress Notice */}
			<Alert
				variant="default"
				className="bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 py-3 md:py-4"
			>
				<AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-amber-600 dark:text-amber-500 shrink-0" />
				<AlertDescription className="text-amber-800 dark:text-amber-300 text-xs md:text-sm">
					  <span className="font-semibold">Đang phát triển:</span> Chức năng này hiện đang trong quá trình xây dựng và chưa được kết nối với hệ thống backend. Các hướng dẫn của bạn sẽ được lưu lại nhưng chưa ảnh hưởng đến hành vi của AI cho đến khi tính năng được hoàn thiện đầy đủ.
				</AlertDescription>
			</Alert>

			<Alert className="py-3 md:py-4">
				<Info className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
				<AlertDescription className="text-xs md:text-sm">
					Hướng dẫn hệ thống áp dụng cho tất cả các tương tác AI trong không gian tìm kiếm này. Chúng định hướng cách
					AI phản hồi, giọng điệu, các lĩnh vực tập trung và mẫu hành vi.
				</AlertDescription>
			</Alert>

			{/* System Instructions Card */}
			<Card>
				<CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-2 md:pb-3">
					<CardTitle className="text-base md:text-lg">Tùy chỉnh hướng dẫn hệ thống</CardTitle>
					<CardDescription className="text-xs md:text-sm">
						Thiết lập hướng dẫn phản hồi cho AI. Các hướng dẫn sẽ áp dụng cho toàn bộ kết quả trong không gian tìm kiếm này.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3 md:space-y-4 px-3 md:px-6 pb-3 md:pb-6">
					<div className="space-y-1.5 md:space-y-2">
						<Label
							htmlFor="custom-instructions-settings"
							className="text-sm md:text-base font-medium"
						>
							Hướng dẫn của bạn
						</Label>
						<Textarea
							id="custom-instructions-settings"
							placeholder="E.g., Always provide practical examples, be concise, focus on technical details, use simple language, respond in a specific format..."
							value={customInstructions}
							onChange={(e) => setCustomInstructions(e.target.value)}
							rows={10}
							className="resize-none font-mono text-xs md:text-sm"
						/>
						<div className="flex items-center justify-between">
							<p className="text-[10px] md:text-xs text-muted-foreground">
								{customInstructions.length} ký tự
							</p>
							{customInstructions.length > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setCustomInstructions("")}
									className="h-auto py-0.5 md:py-1 px-1.5 md:px-2 text-[10px] md:text-xs"
								>
									Xóa
								</Button>
							)}
						</div>
					</div>

					{customInstructions.trim().length === 0 && (
						<Alert className="py-2 md:py-3">
							<Info className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
							<AlertDescription className="text-xs md:text-sm">
								Chưa có hướng dẫn hệ thống nào được thiết lập. AI sẽ sử dụng hành vi mặc định.
							</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>

			{/* Action Buttons */}
			<div className="flex items-center justify-between pt-3 md:pt-4 gap-2">
				<Button
					variant="outline"
					onClick={handleReset}
					disabled={!hasChanges || saving}
					className="flex items-center gap-2 text-xs md:text-sm h-9 md:h-10"
				>
					<RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
					Hủy thay đổi
				</Button>
				<Button
					onClick={handleSave}
					disabled={!hasChanges || saving}
					className="flex items-center gap-2 text-xs md:text-sm h-9 md:h-10"
				>
					<Save className="h-3.5 w-3.5 md:h-4 md:w-4" />
					{saving ? "Đang lưu..." : "Lưu hướng dẫn"}
				</Button>
			</div>

			{hasChanges && (
				<Alert
					variant="default"
					className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 py-3 md:py-4"
				>
					<Info className="h-3 w-3 md:h-4 md:w-4 text-blue-600 dark:text-blue-500 shrink-0" />
					<AlertDescription className="text-blue-800 dark:text-blue-300 text-xs md:text-sm">
						Bạn có thay đổi chưa được lưu. Nhấn "Lưu hướng dẫn" để áp dụng các thay đổi.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
