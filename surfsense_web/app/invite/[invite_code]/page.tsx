"use client";

import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	LogIn,
	Shield,
	Sparkles,
	UserPlus,
	Users,
	XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { loginMutationAtom, registerMutationAtom } from "@/atoms/auth/auth-mutation.atoms";
import { acceptInviteMutationAtom } from "@/atoms/invites/invites-mutation.atoms";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { AcceptInviteResponse } from "@/contracts/types/invites.types";
import { invitesApiService } from "@/lib/apis/invites-api.service";
import { getBearerToken, setBearerToken, setRefreshToken } from "@/lib/auth-utils";
import {
	trackSearchSpaceInviteAccepted,
	trackSearchSpaceInviteDeclined,
	trackSearchSpaceUserAdded,
} from "@/lib/posthog/events";
import { cacheKeys } from "@/lib/query-client/cache-keys";

type AuthTab = "login" | "register";

export default function InviteAcceptPage() {
	const params = useParams();
	const router = useRouter();
	const inviteCode = params.invite_code as string;

	const { data: inviteInfo = null, isLoading: loading } = useQuery({
		queryKey: cacheKeys.invites.info(inviteCode),
		enabled: !!inviteCode,
		staleTime: 5 * 60 * 1000,
		queryFn: async () => {
			if (!inviteCode) return null;
			return invitesApiService.getInviteInfo({
				invite_code: inviteCode,
			});
		},
	});

	const { mutateAsync: acceptInviteMutation } = useAtomValue(acceptInviteMutationAtom);

	const acceptInvite = useCallback(async () => {
		if (!inviteCode) {
			toast.error("Không tìm thấy mã mời");
			return null;
		}

		try {
			const result = await acceptInviteMutation({ invite_code: inviteCode });
			return result;
		} catch (err: any) {
			toast.error(err.message || "Không thể chấp nhận lời mời");
			throw err;
		}
	}, [inviteCode, acceptInviteMutation]);

	const [accepting, setAccepting] = useState(false);
	const [accepted, setAccepted] = useState(false);
	const [acceptedData, setAcceptedData] = useState<AcceptInviteResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

	// Auth form state
	const [authTab, setAuthTab] = useState<AuthTab>("register");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [authError, setAuthError] = useState<string | null>(null);

	const [{ mutateAsync: register, isPending: isRegistering }] = useAtom(registerMutationAtom);
	const [{ mutateAsync: login, isPending: isLoggingIn }] = useAtom(loginMutationAtom);

	const isAuthPending = isRegistering || isLoggingIn;

	// Check if user is logged in
	useEffect(() => {
		if (typeof window !== "undefined") {
			const token = getBearerToken();
			setIsLoggedIn(!!token);
		}
	}, []);

	const handleAccept = async () => {
		setAccepting(true);
		setError(null);
		try {
			const result = await acceptInvite();
			if (result) {
				setAccepted(true);
				setAcceptedData(result);

				// Track invite accepted and user added events
				trackSearchSpaceInviteAccepted(
					result.search_space_id,
					result.search_space_name,
					result.role_name,
				);
				trackSearchSpaceUserAdded(
					result.search_space_id,
					result.search_space_name,
					result.role_name,
				);
			}
		} catch (err: any) {
			setError(err.message || "Không thể chấp nhận lời mời");
		} finally {
			setAccepting(false);
		}
	};

	const handleDecline = () => {
		// Track invite declined event
		trackSearchSpaceInviteDeclined(inviteInfo?.search_space_name);
		router.push("/dashboard");
	};

	const handleRegisterAndAccept = async (e: React.FormEvent) => {
		e.preventDefault();
		setAuthError(null);

		if (password !== confirmPassword) {
			setAuthError("Mật khẩu không khớp");
			return;
		}

		try {
			// Step 1: Register
			await register({
				email,
				password,
				is_active: true,
				is_superuser: false,
				is_verified: false,
			});

			// Step 2: Auto-login after registration
			const loginResult = await login({
				username: email,
				password,
			});

			if (loginResult.access_token) {
				setBearerToken(loginResult.access_token);
				if (loginResult.refresh_token) {
					setRefreshToken(loginResult.refresh_token);
				}
				setIsLoggedIn(true);

				// Step 3: Store pending invite for auto-accept
				localStorage.setItem("pending_invite_code", inviteCode);
			}
		} catch (err: any) {
			const message =
				err?.message || err?.detail || "Đăng ký thất bại. Vui lòng thử lại.";
			setAuthError(message);
		}
	};

	const handleLoginAndAccept = async (e: React.FormEvent) => {
		e.preventDefault();
		setAuthError(null);

		try {
			const loginResult = await login({
				username: email,
				password,
			});

			if (loginResult.access_token) {
				setBearerToken(loginResult.access_token);
				if (loginResult.refresh_token) {
					setRefreshToken(loginResult.refresh_token);
				}
				setIsLoggedIn(true);

				// Store pending invite for auto-accept
				localStorage.setItem("pending_invite_code", inviteCode);
			}
		} catch (err: any) {
			const message =
				err?.message || err?.detail || "Đăng nhập thất bại. Vui lòng thử lại.";
			setAuthError(message);
		}
	};

	// Check for pending invite after login
	useEffect(() => {
		if (isLoggedIn && typeof window !== "undefined") {
			const pendingInvite = localStorage.getItem("pending_invite_code");
			if (pendingInvite === inviteCode) {
				localStorage.removeItem("pending_invite_code");
				// Auto-accept the invite after redirect
				handleAccept();
			}
		}
	}, [isLoggedIn, inviteCode]);

	const renderInviteInfo = () => (
		<div className="bg-muted/50 rounded-lg p-4 space-y-3">
			<div className="flex items-center gap-3">
				<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
					<Users className="h-5 w-5 text-primary" />
				</div>
				<div>
					<p className="font-medium">{inviteInfo?.search_space_name}</p>
					<p className="text-sm text-muted-foreground">Không gian làm việc</p>
				</div>
			</div>
			{inviteInfo?.role_name && (
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
						<Shield className="h-5 w-5 text-violet-500" />
					</div>
					<div>
						<p className="font-medium">{inviteInfo.role_name}</p>
						<p className="text-sm text-muted-foreground">Vai trò dự kiến</p>
					</div>
				</div>
			)}
		</div>
	);

	const renderAuthForm = () => (
		<>
			<CardHeader className="text-center pb-4">
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: "spring", stiffness: 200, damping: 15 }}
					className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-4 ring-primary/20"
				>
					<Sparkles className="h-10 w-10 text-primary" />
				</motion.div>
				<CardTitle className="text-2xl">Lời mời tham gia!</CardTitle>
				<CardDescription>
					{authTab === "register"
						? "Tạo tài khoản để tham gia "
						: "Đăng nhập để tham gia "}
					{inviteInfo?.search_space_name || "không gian này"}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{renderInviteInfo()}

				{/* Tab switcher */}
				<div className="flex rounded-lg bg-muted p-1 gap-1">
					<button
						type="button"
						onClick={() => {
							setAuthTab("register");
							setAuthError(null);
						}}
						className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
							authTab === "register"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<UserPlus className="h-4 w-4" />
						Đăng ký
					</button>
					<button
						type="button"
						onClick={() => {
							setAuthTab("login");
							setAuthError(null);
						}}
						className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
							authTab === "login"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<LogIn className="h-4 w-4" />
						Đăng nhập
					</button>
				</div>

				{/* Auth form */}
				<form
					onSubmit={authTab === "register" ? handleRegisterAndAccept : handleLoginAndAccept}
					className="space-y-3"
				>
					<AnimatePresence>
						{authError && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm"
							>
								<AlertCircle className="h-4 w-4 shrink-0" />
								{authError}
							</motion.div>
						)}
					</AnimatePresence>

					<div>
						<input
							type="email"
							required
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isAuthPending}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50"
						/>
					</div>

					<div>
						<input
							type="password"
							required
							placeholder="Mật khẩu"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={isAuthPending}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50"
						/>
					</div>

					{authTab === "register" && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
						>
							<input
								type="password"
								required
								placeholder="Xác nhận mật khẩu"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								disabled={isAuthPending}
								className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50"
							/>
						</motion.div>
					)}

					<Button type="submit" className="w-full gap-2" disabled={isAuthPending}>
						{isAuthPending ? (
							<>
								<Spinner size="sm" />
								Đang xử lý...
							</>
						) : authTab === "register" ? (
							<>
								<UserPlus className="h-4 w-4" />
								Đăng ký & Tham gia
							</>
						) : (
							<>
								<LogIn className="h-4 w-4" />
								Đăng nhập & Tham gia
							</>
						)}
					</Button>
				</form>
			</CardContent>
		</>
	);

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
			{/* Background decoration */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />
				<div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-violet-500/10 via-transparent to-transparent rounded-full blur-3xl" />
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="w-full max-w-md relative z-10"
			>
				<Card className="border-none shadow-2xl bg-card/80 backdrop-blur-xl">
					{loading || isLoggedIn === null ? (
						<CardContent className="flex flex-col items-center justify-center py-16">
							<motion.div
								animate={{ rotate: 360 }}
								transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
							>
								<Spinner size="xl" className="text-primary" />
							</motion.div>
							<p className="mt-4 text-muted-foreground">Đang tải thông tin lời mời...</p>
						</CardContent>
					) : accepted && acceptedData ? (
						<>
							<CardHeader className="text-center pb-4">
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 200, damping: 15 }}
									className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center ring-4 ring-emerald-500/20"
								>
									<CheckCircle2 className="h-10 w-10 text-emerald-500" />
								</motion.div>
								<CardTitle className="text-2xl">Chào mừng gia nhập đơn vị!</CardTitle>
								<CardDescription>
									Đồng chí đã tham gia thành công vào {acceptedData.search_space_name}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="bg-muted/50 rounded-lg p-4 space-y-3">
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
											<Users className="h-5 w-5 text-primary" />
										</div>
										<div>
											<p className="font-medium">{acceptedData.search_space_name}</p>
											<p className="text-sm text-muted-foreground">Không gian làm việc</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
											<Shield className="h-5 w-5 text-violet-500" />
										</div>
										<div>
											<p className="font-medium">{acceptedData.role_name}</p>
											<p className="text-sm text-muted-foreground">Vai trò được phân công</p>
										</div>
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									className="w-full gap-2"
									onClick={() => router.push(`/dashboard/${acceptedData.search_space_id}`)}
								>
									Đi tới Không gian làm việc
									<ArrowRight className="h-4 w-4" />
								</Button>
							</CardFooter>
						</>
					) : !inviteInfo?.is_valid ? (
						<>
							<CardHeader className="text-center pb-4">
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 200, damping: 15 }}
									className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center ring-4 ring-destructive/20"
								>
									<XCircle className="h-10 w-10 text-destructive" />
								</motion.div>
								<CardTitle className="text-2xl">Lời mời không hợp lệ</CardTitle>
								<CardDescription>
									{inviteInfo?.message || "Liên kết lời mời này không còn hiệu lực"}
								</CardDescription>
							</CardHeader>
							<CardContent className="text-center">
								<p className="text-sm text-muted-foreground">
									Lời mời có thể đã hết hạn, đạt giới hạn số lần sử dụng hoặc đã bị thu hồi.
								</p>
							</CardContent>
							<CardFooter>
								<Button
									variant="outline"
									className="w-full"
									onClick={() => router.push("/dashboard")}
								>
									Về Trang chủ
								</Button>
							</CardFooter>
						</>
					) : !isLoggedIn ? (
						renderAuthForm()
					) : (
						<>
							<CardHeader className="text-center pb-4">
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 200, damping: 15 }}
									className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-4 ring-primary/20"
								>
									<Sparkles className="h-10 w-10 text-primary" />
								</motion.div>
								<CardTitle className="text-2xl">Lời mời tham gia!</CardTitle>
								<CardDescription>
									Chấp nhận lời mời để tham gia{" "}
									{inviteInfo?.search_space_name || "không gian này"}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{renderInviteInfo()}

								{error && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm"
									>
										<AlertCircle className="h-4 w-4 shrink-0" />
										{error}
									</motion.div>
								)}
							</CardContent>
							<CardFooter className="flex gap-2">
								<Button variant="outline" className="flex-1" onClick={handleDecline}>
									Hủy bỏ
								</Button>
								<Button className="flex-1 gap-2" onClick={handleAccept} disabled={accepting}>
									{accepting ? (
										<>
											<Spinner size="sm" />
											Đang xử lý...
										</>
									) : (
										<>
											<CheckCircle2 className="h-4 w-4" />
											Chấp nhận lời mời
										</>
									)}
								</Button>
							</CardFooter>
						</>
					)}
				</Card>

				{/* Branding */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="mt-6 text-center"
				>
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
					>
						<Image src="/icon-128.svg" alt="GovSense" width={24} height={24} className="rounded" />
						<span className="text-sm font-medium">GovSense</span>
					</Link>
				</motion.div>
			</motion.div>
		</div>
	);
}
