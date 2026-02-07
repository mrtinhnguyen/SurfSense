import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Điều khoản Dịch vụ | GovSense",
	description: "Điều khoản Dịch vụ cho ứng dụng GovSense",
};

export default function TermsOfService() {
	return (
		<div className="container max-w-4xl mx-auto py-12 px-4">
			<h1 className="text-4xl font-bold mb-8">Điều khoản Dịch vụ</h1>

			<div className="prose dark:prose-invert max-w-none">
				<p className="text-lg mb-6">Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}</p>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">1. Giới thiệu</h2>
					<p>
						Chào mừng bạn đến với GovSense. Các Điều khoản Dịch vụ này quy định việc truy cập và sử
						dụng trang web và dịch vụ của GovSense. Bằng cách truy cập hoặc sử dụng dịch vụ của
						chúng tôi, bạn đồng ý bị ràng buộc bởi các Điều khoản này.
					</p>
					<p className="mt-4">
						Vui lòng đọc kỹ các Điều khoản này trước khi sử dụng Dịch vụ của chúng tôi. Bằng cách sử
						dụng Dịch vụ, bạn đồng ý rằng các Điều khoản này sẽ chi phối mối quan hệ của bạn với
						chúng tôi. Nếu bạn không đồng ý với các Điều khoản này, vui lòng không sử dụng Dịch vụ.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">2. Sử dụng Dịch vụ</h2>
					<p>
						Bạn phải tuân thủ mọi chính sách được cung cấp trong Dịch vụ. Bạn chỉ có thể sử dụng
						Dịch vụ của chúng tôi theo quy định của pháp luật. Chúng tôi có thể tạm ngừng hoặc ngừng
						cung cấp Dịch vụ cho bạn nếu bạn không tuân thủ các điều khoản hoặc chính sách của chúng
						tôi hoặc nếu chúng tôi đang điều tra hành vi bị nghi ngờ là sai trái.
					</p>
					<p className="mt-4">
						Việc sử dụng Dịch vụ của chúng tôi không mang lại cho bạn quyền sở hữu bất kỳ quyền sở
						hữu trí tuệ nào đối với Dịch vụ hoặc nội dung bạn truy cập. Bạn không được sử dụng nội
						dung từ Dịch vụ của chúng tôi trừ khi được chủ sở hữu cho phép hoặc được pháp luật cho
						phép.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">3. Tài khoản của bạn</h2>
					<p>
						Để sử dụng một số dịch vụ của chúng tôi, bạn có thể cần tạo tài khoản. Bạn chịu trách
						nhiệm bảo mật mật khẩu mà bạn sử dụng để truy cập dịch vụ và cho mọi hoạt động hoặc hành
						động dưới mật khẩu của bạn.
					</p>
					<p className="mt-4">
						Bạn phải cung cấp thông tin chính xác và đầy đủ khi tạo tài khoản. Bạn đồng ý cập nhật
						thông tin của mình để giữ cho thông tin đó chính xác và đầy đủ. Bạn chịu trách nhiệm duy
						trì tính bảo mật của tài khoản và mật khẩu, bao gồm cả việc hạn chế quyền truy cập vào
						máy tính và/hoặc tài khoản của bạn.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">4. Quyền riêng tư và Bảo vệ Bản quyền</h2>
					<p>
						Chính sách bảo mật của chúng tôi giải thích cách chúng tôi xử lý dữ liệu cá nhân của bạn
						và bảo vệ quyền riêng tư của bạn khi bạn sử dụng Dịch vụ của chúng tôi. Bằng cách sử
						dụng Dịch vụ, bạn đồng ý rằng GovSense có thể sử dụng dữ liệu đó theo chính sách bảo mật
						của chúng tôi.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">5. Giấy phép và Sở hữu Trí tuệ</h2>
					<p>
						GovSense cấp cho bạn giấy phép cá nhân, toàn cầu, miễn phí bản quyền, không thể chuyển
						nhượng và không độc quyền để sử dụng phần mềm được cung cấp cho bạn như một phần của
						Dịch vụ. Giấy phép này chỉ nhằm mục đích cho phép bạn sử dụng và hưởng lợi ích của Dịch
						vụ do GovSense cung cấp, theo cách được các điều khoản này cho phép.
					</p>
					<p className="mt-4">
						Tất cả nội dung có trong hoặc được cung cấp thông qua Dịch vụ của chúng tôi—chẳng hạn
						như văn bản, đồ họa, logo, biểu tượng nút, hình ảnh, clip âm thanh, tải xuống kỹ thuật
						số, biên soạn dữ liệu và phần mềm—là tài sản của GovSense hoặc các nhà cung cấp nội dung
						của GovSense và được bảo vệ bởi luật bản quyền quốc tế, thương hiệu và các luật sở hữu
						trí tuệ khác.
					</p>
				</section>
			</div>
		</div>
	);
}
