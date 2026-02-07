import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Chính sách Bảo mật | GovSense",
	description: "Chính sách Bảo mật cho ứng dụng GovSense",
};

export default function PrivacyPolicy() {
	return (
		<div className="container max-w-4xl mx-auto py-12 px-4">
			<h1 className="text-4xl font-bold mb-8">Chính sách Bảo mật</h1>

			<div className="prose dark:prose-invert max-w-none">
				<p className="text-lg mb-6">Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}</p>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">1. Giới thiệu</h2>
					<p>
						Chào mừng bạn đến với GovSense. Chúng tôi tôn trọng quyền riêng tư của bạn và cam kết
						bảo vệ dữ liệu cá nhân của bạn. Chính sách bảo mật này sẽ thông báo cho bạn về cách
						chúng tôi quản lý dữ liệu cá nhân của bạn khi bạn truy cập trang web của chúng tôi và
						cho bạn biết về quyền riêng tư của bạn và cách pháp luật bảo vệ bạn.
					</p>
					<p className="mt-4">
						Bằng cách sử dụng dịch vụ của chúng tôi, bạn xác nhận rằng bạn đã đọc và hiểu Chính sách
						Bảo mật này. Chúng tôi có quyền sửa đổi chính sách này bất kỳ lúc nào, và các sửa đổi đó
						sẽ có hiệu lực ngay lập tức khi đăng chính sách đã sửa đổi trên trang web này.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">2. Dữ liệu Chúng tôi Thu thập</h2>
					<p>
						Chúng tôi có thể thu thập, sử dụng, lưu trữ và chuyển giao các loại dữ liệu cá nhân khác
						nhau về bạn mà chúng tôi đã nhóm lại như sau:
					</p>
					<ul className="list-disc pl-6 my-4 space-y-2">
						<li>
							<strong>Dữ liệu Định danh</strong> bao gồm tên, họ, tên người dùng hoặc định danh
							tương tự.
						</li>
						<li>
							<strong>Dữ liệu Liên hệ</strong> bao gồm địa chỉ email và số điện thoại.
						</li>
						<li>
							<strong>Dữ liệu Kỹ thuật</strong> bao gồm địa chỉ giao thức internet (IP), dữ liệu
							đăng nhập của bạn, loại và phiên bản trình duyệt, cài đặt múi giờ và vị trí, loại và
							phiên bản plug-in trình duyệt, hệ điều hành và nền tảng, và các công nghệ khác trên
							các thiết bị bạn sử dụng để truy cập trang web này.
						</li>
						<li>
							<strong>Dữ liệu Sử dụng</strong> bao gồm thông tin về cách bạn sử dụng trang web và
							dịch vụ của chúng tôi.
						</li>
						<li>
							<strong>Dữ liệu GovSense</strong> bao gồm thông tin về các phiên làm việc, tùy chọn
							và cài đặt.
						</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">3. Cách Chúng tôi Sử dụng Dữ liệu của Bạn</h2>
					<p>
						Chúng tôi sẽ chỉ sử dụng dữ liệu cá nhân của bạn khi pháp luật cho phép. Thông thường
						nhất, chúng tôi sẽ sử dụng dữ liệu cá nhân của bạn trong các trường hợp sau:
					</p>
					<ul className="list-disc pl-6 my-4 space-y-2">
						<li>
							Khi chúng tôi cần thực hiện hợp đồng mà chúng tôi sắp ký kết hoặc đã ký kết với bạn.
						</li>
						<li>
							Khi cần thiết cho lợi ích hợp pháp của chúng tôi (hoặc của bên thứ ba) và lợi ích và
							quyền cơ bản của bạn không ghi đè lên những lợi ích đó.
						</li>
						<li>Khi chúng tôi cần tuân thủ nghĩa vụ pháp lý.</li>
						<li>
							Để cung cấp và duy trì dịch vụ của chúng tôi, bao gồm theo dõi việc sử dụng dịch vụ
							của chúng tôi.
						</li>
						<li>
							Để cải thiện dịch vụ, sản phẩm, tiếp thị và trải nghiệm khách hàng của chúng tôi.
						</li>
						<li>Để liên lạc với bạn về các bản cập nhật, cảnh báo bảo mật và tin nhắn hỗ trợ.</li>
					</ul>
				</section>
			</div>
		</div>
	);
}
