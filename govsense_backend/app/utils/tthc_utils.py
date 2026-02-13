"""
Utility functions for TTHC (Thủ tục hành chính) content building and chunking.
"""

import hashlib

from app.config import config
from app.db import TthcChunk


def build_tthc_content(
    name: str,
    code: str | None = None,
    deadline: str | None = None,
    location: str | None = None,
    method: str | None = None,
    legal_basis: str | None = None,
    fee: str | None = None,
    result: str | None = None,
    subjects: str | None = None,
    implementing_agency: str | None = None,
) -> str:
    """
    Build combined text content from structured TTHC fields for embedding.

    Returns:
        Combined text suitable for chunking and vector search.
    """
    parts = [f"Tên thủ tục hành chính: {name}"]

    if code:
        parts.append(f"Mã thủ tục: {code}")
    if implementing_agency:
        parts.append(f"Cơ quan thực hiện: {implementing_agency}")
    if subjects:
        parts.append(f"Đối tượng thực hiện: {subjects}")
    if deadline:
        parts.append(f"Thời hạn giải quyết: {deadline}")
    if location:
        parts.append(f"Địa điểm thực hiện: {location}")
    if method:
        parts.append(f"Cách thức thực hiện: {method}")
    if fee:
        parts.append(f"Lệ phí: {fee}")
    if result:
        parts.append(f"Kết quả thực hiện: {result}")
    if legal_basis:
        parts.append(f"Căn cứ pháp lý: {legal_basis}")

    return "\n".join(parts)


def generate_tthc_content_hash(content: str) -> str:
    """Generate SHA-256 hash for TTHC content deduplication."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def create_tthc_chunks(content: str) -> list[TthcChunk]:
    """
    Create chunks from TTHC content with embeddings.

    Uses the configured chunker and embedding model instances.

    Args:
        content: Combined text content to chunk.

    Returns:
        List of TthcChunk objects with embeddings.
    """
    return [
        TthcChunk(
            content=chunk.text,
            embedding=config.embedding_model_instance.embed(chunk.text),
        )
        for chunk in config.chunker_instance.chunk(content)
    ]
