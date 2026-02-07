import { Sliders, Users, Workflow } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function FeaturesCards() {
	return (
		<section className="py-2 md:py-8 dark:bg-transparent">
			<div className="@container mx-auto max-w-7xl">
				<div className="text-center">
					<h2 className="text-balance text-4xl font-semibold lg:text-5xl">
						Hệ thống Trợ lý AI Chuyên biệt
					</h2>
					<p className="mt-4">
						Công cụ hỗ trợ đắc lực cho cán bộ, công chức trong công tác tham mưu, tổng hợp và xử lý văn bản.
					</p>
				</div>
				<div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
					<Card className="group shadow-black-950/5">
						<CardHeader className="pb-3">
							<CardDecorator>
								<Workflow className="size-6" aria-hidden />
							</CardDecorator>

							<h3 className="mt-6 font-medium">Quy trình Khép kín</h3>
						</CardHeader>

						<CardContent>
							<p className="text-sm">
								Tự động hóa việc tổng hợp, phân tích văn bản và hồ sơ công việc. Giảm thiểu thao tác thủ công, nâng cao độ chính xác.
							</p>
						</CardContent>
					</Card>

					<Card className="group shadow-black-950/5">
						<CardHeader className="pb-3">
							<CardDecorator>
								<Users className="size-6" aria-hidden />
							</CardDecorator>

							<h3 className="mt-6 font-medium">Phối hợp Liên thông</h3>
						</CardHeader>

						<CardContent>
							<p className="text-sm">
								Kết nối thông suốt giữa các phòng ban, đơn vị. Chia sẻ dữ liệu an toàn và cộng tác xử lý công việc theo thời gian thực.
							</p>
						</CardContent>
					</Card>

					<Card className="group shadow-black-950/5">
						<CardHeader className="pb-3">
							<CardDecorator>
								<Sliders className="size-6" aria-hidden />
							</CardDecorator>

							<h3 className="mt-6 font-medium">An toàn & Bảo mật</h3>
						</CardHeader>

						<CardContent>
							<p className="text-sm">
								Triển khai linh hoạt trên hạ tầng riêng (On-premise) hoặc đám mây riêng (Private Cloud), tuân thủ các tiêu chuẩn bảo mật nhà nước.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
	<div
		aria-hidden
		className="relative mx-auto size-36 mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
	>
		<div className="absolute inset-0 [--border:black] dark:[--border:white] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[24px_24px] opacity-10" />
		<div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l">
			{children}
		</div>
	</div>
);
