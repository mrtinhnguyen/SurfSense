"""
TTHC (Thủ tục hành chính) search tool for the AI agent.

Searches the tthc_chunks table using vector similarity to find
relevant administrative procedures and return them with citation-ready chunk IDs.
"""

import json

from langchain_core.tools import tool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import config
from app.db import TthcChunk, TthcProcedure


def format_tthc_results(results: list[tuple]) -> str:
    """
    Format TTHC search results into XML structure for the LLM context.

    Uses 'tthc-' prefix on chunk IDs so the frontend can route citations
    to the TTHC endpoint (e.g., [citation:tthc-123]).
    """
    if not results:
        return "Không tìm thấy thủ tục hành chính liên quan."

    grouped: dict[int, dict] = {}
    for chunk, proc in results:
        if proc.id not in grouped:
            metadata = {
                "code": proc.code,
                "deadline": proc.deadline,
                "location": proc.location,
                "method": proc.method,
                "fee": proc.fee,
                "implementing_agency": proc.implementing_agency,
                "subjects": proc.subjects,
            }
            # Remove None values
            metadata = {k: v for k, v in metadata.items() if v}

            grouped[proc.id] = {
                "document_id": f"tthc-{proc.id}",
                "document_type": "TTHC",
                "title": proc.name,
                "url": f"tthc/{proc.id}",
                "metadata": metadata,
                "chunks": [],
            }
        grouped[proc.id]["chunks"].append(
            {
                "chunk_id": f"tthc-{chunk.id}",
                "content": chunk.content,
            }
        )

    parts: list[str] = []
    for g in grouped.values():
        metadata_json = json.dumps(g["metadata"], ensure_ascii=False)

        parts.append("<document>")
        parts.append("<document_metadata>")
        parts.append(f"  <document_id>{g['document_id']}</document_id>")
        parts.append(f"  <document_type>{g['document_type']}</document_type>")
        parts.append(f"  <title><![CDATA[{g['title']}]]></title>")
        parts.append(f"  <url><![CDATA[{g['url']}]]></url>")
        parts.append(f"  <metadata_json><![CDATA[{metadata_json}]]></metadata_json>")
        parts.append("</document_metadata>")
        parts.append("")
        parts.append("<document_content>")

        for ch in g["chunks"]:
            parts.append(
                f"  <chunk id='{ch['chunk_id']}'><![CDATA[{ch['content']}]]></chunk>"
            )

        parts.append("</document_content>")
        parts.append("</document>")
        parts.append("")

    return "\n".join(parts).strip()


async def search_tthc_async(
    query: str,
    search_space_id: int,
    db_session: AsyncSession,
    top_k: int = 10,
) -> str:
    """
    Search TTHC procedures using vector similarity on chunks.

    Filters by search_space_id to ensure proper data isolation.
    """
    query_embedding = config.embedding_model_instance.embed(query)

    stmt = (
        select(TthcChunk, TthcProcedure)
        .join(TthcProcedure, TthcChunk.procedure_id == TthcProcedure.id)
        .where(TthcProcedure.search_space_id == search_space_id)
        .order_by(TthcChunk.embedding.op("<=>")(query_embedding))
        .limit(top_k)
    )

    result = await db_session.execute(stmt)
    rows = result.all()

    return format_tthc_results(rows)


def create_search_tthc_tool(search_space_id: int, db_session: AsyncSession):
    """
    Factory function to create the search_tthc tool.
    """

    @tool
    async def search_tthc(query: str, top_k: int = 10) -> str:
        """
        Tra cứu thủ tục hành chính (TTHC) trong kho dữ liệu.

        Sử dụng công cụ này khi người dùng hỏi về:
        - Thủ tục hành chính, quy trình thực hiện
        - Thời hạn giải quyết, lệ phí
        - Hồ sơ, biểu mẫu cần thiết
        - Cơ quan tiếp nhận, địa điểm thực hiện
        - Căn cứ pháp lý, quy định liên quan

        Args:
            query: Từ khóa tra cứu về thủ tục hành chính
            top_k: Số kết quả trả về (mặc định: 10)

        Returns:
            Nội dung thủ tục hành chính kèm mã đoạn để trích dẫn
        """
        return await search_tthc_async(
            query=query,
            search_space_id=search_space_id,
            db_session=db_session,
            top_k=top_k,
        )

    return search_tthc
