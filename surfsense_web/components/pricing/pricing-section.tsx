"use client";

import { Pricing } from "@/components/pricing";

const demoPlans = [
	{
		name: "CƠ BẢN",
		price: "0",
		yearlyPrice: "0",
		period: "",
		billingText: "Bao gồm 30 ngày dùng thử bản Chuyên nghiệp",
		features: [
			"Mã nguồn mở (Open Source)",
			"Tải lên và xử lý 300+ trang tài liệu",
			"Kết nối 8 nguồn dữ liệu phổ biến (Drive, Notion...)",
			"Truy cập giới hạn các mô hình ChatGPT, Claude, DeepSeek",
			"Hỗ trợ 100+ mô hình LLM khác (Gemini, Llama...)",
			"Hỗ trợ 50+ định dạng tập tin",
			"Tạo tóm tắt dạng âm thanh",
			"Tiện ích mở rộng trình duyệt hỗ trợ tra cứu nhanh",
			"Hỗ trợ qua cộng đồng",
		],
		description: "Các tính năng mạnh mẽ cho nhu cầu cá nhân",
		buttonText: "Bắt đầu ngay",
		href: "/",
		isPopular: false,
	},
	{
		name: "CHUYÊN NGHIỆP",
		price: "10",
		yearlyPrice: "10",
		period: "người dùng / tháng",
		billingText: "thanh toán hàng năm",
		features: [
			"Bao gồm tính năng gói Cơ bản",
			"Tải lên và xử lý 5,000+ trang tài liệu",
			"Kết nối 15+ nguồn dữ liệu (Slack, Airtable...)",
			"Mở rộng giới hạn truy cập ChatGPT, Claude, DeepSeek",
			"Tính năng cộng tác và thảo luận nhóm",
			"Chia sẻ khóa API (BYOK)",
			"Quản lý thành viên và phân quyền",
			"Sắp ra mắt: Quản lý thanh toán tập trung",
			"Hỗ trợ ưu tiên",
		],
		description: "Kho tri thức AI cho nhóm làm việc hiệu quả",
		buttonText: "Nâng cấp",
		href: "/contact",
		isPopular: true,
	},
	{
		name: "CƠ QUAN",
		price: "Liên hệ",
		yearlyPrice: "Liên hệ",
		period: "",
		billingText: "",
		features: [
			"Bao gồm tính năng gói Chuyên nghiệp",
			"Dung lượng lưu trữ và xử lý tài liệu không giới hạn",
			"Quản lý/Giới hạn mô hình và nhà cung cấp AI",
			"Triển khai trên hạ tầng riêng (On-premise / Private Cloud)",
			"Sắp ra mắt: Nhật ký hệ thống và tuân thủ bảo mật",
			"Sắp ra mắt: Đăng nhập một lần (SSO, OIDC, SAML)",
			"Sắp ra mắt: Phân quyền vai trò nâng cao (RBAC)",
			"Hỗ trợ cài đặt và triển khai chuyên biệt",
			"Bảo trì và cập nhật định kỳ",
			"Cam kết chất lượng dịch vụ (SLA)",
			"Kênh hỗ trợ kỹ thuật riêng",
		],
		description: "Giải pháp tùy chỉnh cho các Sở, Ban, Ngành",
		buttonText: "Liên hệ Tư vấn",
		href: "/contact",
		isPopular: false,
	},
];

function PricingBasic() {
	return (
		<Pricing plans={demoPlans} title="Bảng giá Dịch vụ GovSense" description="Lựa chọn gói dịch vụ phù hợp với nhu cầu của đơn vị." />
	);
}

export default PricingBasic;
