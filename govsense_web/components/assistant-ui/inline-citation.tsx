"use client";

import type { FC } from "react";
import { useState } from "react";
import { SourceDetailPanel } from "@/components/new-chat/source-detail-panel";

interface InlineCitationProps {
	chunkId: number;
	citationNumber: number;
	isDocsChunk?: boolean;
	isTthcChunk?: boolean;
}

/**
 * Inline citation component for the new chat.
 * Renders a clickable numbered badge that opens the SourceDetailPanel with document chunk details.
 * Supports regular knowledge base chunks, GovSense documentation chunks, and TTHC chunks.
 */
export const InlineCitation: FC<InlineCitationProps> = ({
	chunkId,
	citationNumber,
	isDocsChunk = false,
	isTthcChunk = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const sourceType = isDocsChunk ? "GOVSENSE_DOCS" : isTthcChunk ? "TTHC" : "";
	const title = isDocsChunk
		? "Tài liệu GovSense"
		: isTthcChunk
			? "Thủ tục hành chính"
			: "Source";

	return (
		<SourceDetailPanel
			open={isOpen}
			onOpenChange={setIsOpen}
			chunkId={chunkId}
			sourceType={sourceType}
			title={title}
			description=""
			url=""
			isDocsChunk={isDocsChunk}
			isTthcChunk={isTthcChunk}
		>
			<span
				onClick={() => setIsOpen(true)}
				onKeyDown={(e) => e.key === "Enter" && setIsOpen(true)}
				className="text-[10px] font-bold bg-primary/80 hover:bg-primary text-primary-foreground rounded-full min-w-4 h-4 px-1 inline-flex items-center justify-center align-super cursor-pointer transition-colors ml-0.5"
				title={`Xem nguồn tham khảo #${citationNumber}`}
				role="button"
				tabIndex={0}
			>
				{citationNumber}
			</span>
		</SourceDetailPanel>
	);
};
