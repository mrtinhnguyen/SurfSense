"""
Schemas for GovSense documentation.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class GovSenseDocsChunkRead(BaseModel):
    """Schema for a GovSense docs chunk."""

    id: int
    content: str

    model_config = ConfigDict(from_attributes=True)


class GovSenseDocsDocumentRead(BaseModel):
    """Schema for a GovSense docs document (without chunks)."""

    id: int
    title: str
    source: str
    content: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class GovSenseDocsDocumentWithChunksRead(BaseModel):
    """Schema for a GovSense docs document with its chunks."""

    id: int
    title: str
    source: str
    content: str
    chunks: list[GovSenseDocsChunkRead]

    model_config = ConfigDict(from_attributes=True)
