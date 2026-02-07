"""
GovSense documentation routes.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import GovSenseDocsChunk, GovSenseDocsDocument, get_session

router = APIRouter(prefix="/govsense-docs", tags=["GovSense Docs"])


class GovSenseDocsChunkRead(BaseModel):
    id: int
    content: str


class GovSenseDocsDocumentRead(BaseModel):
    id: int
    title: str
    source: str
    content: str
    created_at: float
    updated_at: float


class GovSenseDocsDocumentWithChunksRead(GovSenseDocsDocumentRead):
    chunks: list[GovSenseDocsChunkRead]


class PaginatedResponse(BaseModel):
    items: list[GovSenseDocsDocumentRead]
    total: int
    page: int
    page_size: int
    has_more: bool


@router.get("/{doc_id}", response_model=GovSenseDocsDocumentWithChunksRead)
async def get_govsense_doc(
    doc_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get a GovSense documentation page by ID with all its chunks."""
    try:
        # Fetch document with chunks
        stmt = (
            select(GovSenseDocsDocument)
            .options(selectinload(GovSenseDocsDocument.chunks))
            .where(GovSenseDocsDocument.id == doc_id)
        )
        result = await session.execute(stmt)
        document = result.scalars().first()

        if not document:
            raise HTTPException(status_code=404, detail="Documentation page not found")

        # Sort chunks by id to maintain reading order
        sorted_chunks = sorted(document.chunks, key=lambda x: x.id)

        return GovSenseDocsDocumentWithChunksRead(
            id=document.id,
            title=document.title,
            source=document.source,
            content=document.content,
            chunks=[
                GovSenseDocsChunkRead(id=c.id, content=c.content)
                for c in sorted_chunks
            ],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve GovSense documentation: {e!s}",
        ) from e


@router.get("", response_model=PaginatedResponse)
async def list_govsense_docs(
    page: int = Query(0, ge=0),
    page_size: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    """List GovSense documentation pages."""
    try:
        offset = page * page_size

        # Get total count
        count_query = select(func.count()).select_from(GovSenseDocsDocument)
        total = (await session.execute(count_query)).scalar() or 0

        # Get page items
        query = select(GovSenseDocsDocument)
        result = await session.execute(
            query.order_by(GovSenseDocsDocument.title).offset(offset).limit(page_size)
        )
        docs = result.scalars().all()

        # Convert to response format
        items = [
            GovSenseDocsDocumentRead(
                id=doc.id,
                title=doc.title,
                source=doc.source,
                content=doc.content,
                created_at=doc.created_at,
                updated_at=doc.updated_at,
            )
            for doc in docs
        ]

        has_more = (offset + len(items)) < total

        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            has_more=has_more,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list GovSense documentation: {e!s}",
        ) from e
