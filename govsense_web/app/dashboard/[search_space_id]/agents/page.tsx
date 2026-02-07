"use client";

import { Bot, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AgentsPage({ params }: { params: { search_space_id: string } }) {
	const t = useTranslations("common");
	const router = useRouter();
	const searchSpaceId = params.search_space_id;

	return (
		<div className="flex h-full flex-col space-y-6 p-8">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Trợ lý AI</h2>
					<p className="text-muted-foreground">
						Danh sách các trợ lý ảo hỗ trợ xử lý công việc và tra cứu văn bản.
					</p>
				</div>
				<Button onClick={() => router.push(`/dashboard/${searchSpaceId}/settings`)}>
					<Settings className="mr-2 h-4 w-4" />
					Cấu hình Trợ lý
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Trợ lý Tổng hợp</CardTitle>
						<Bot className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Mặc định</div>
						<p className="text-xs text-muted-foreground">
							Hỗ trợ tra cứu và tổng hợp thông tin chung từ kho dữ liệu.
						</p>
					</CardContent>
				</Card>
				{/* Placeholder for more agents */}
				<Card className="opacity-60">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Trợ lý Pháp chế</CardTitle>
						<Bot className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Sắp ra mắt</div>
						<p className="text-xs text-muted-foreground">
							Chuyên sâu về văn bản quy phạm pháp luật.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
