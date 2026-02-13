"""
Schemas for TTHC (Thủ tục hành chính) management.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TthcFormAttachment(BaseModel):
    """Schema for a TTHC form attachment."""

    name: str
    url: str | None = None


class TthcChunkRead(BaseModel):
    """Schema for a TTHC chunk."""

    id: int
    content: str

    model_config = ConfigDict(from_attributes=True)


class TthcProcedureCreate(BaseModel):
    """Schema for creating a TTHC procedure."""

    name: str = Field(..., min_length=1, max_length=500)
    code: str | None = Field(None, max_length=100)
    deadline: str | None = Field(None, max_length=500)
    location: str | None = Field(None, max_length=500)
    method: str | None = None
    legal_basis: str | None = None
    form_attachments: list[TthcFormAttachment] | None = None
    fee: str | None = Field(None, max_length=500)
    result: str | None = Field(None, max_length=500)
    subjects: str | None = Field(None, max_length=500)
    implementing_agency: str | None = Field(None, max_length=500)


class TthcProcedureUpdate(BaseModel):
    """Schema for updating a TTHC procedure. All fields optional."""

    name: str | None = Field(None, min_length=1, max_length=500)
    code: str | None = Field(None, max_length=100)
    deadline: str | None = Field(None, max_length=500)
    location: str | None = Field(None, max_length=500)
    method: str | None = None
    legal_basis: str | None = None
    form_attachments: list[TthcFormAttachment] | None = None
    fee: str | None = Field(None, max_length=500)
    result: str | None = Field(None, max_length=500)
    subjects: str | None = Field(None, max_length=500)
    implementing_agency: str | None = Field(None, max_length=500)


class TthcProcedureRead(BaseModel):
    """Schema for reading a TTHC procedure (without chunks)."""

    id: int
    name: str
    code: str | None = None
    deadline: str | None = None
    location: str | None = None
    method: str | None = None
    legal_basis: str | None = None
    form_attachments: list[TthcFormAttachment] | None = None
    fee: str | None = None
    result: str | None = None
    subjects: str | None = None
    implementing_agency: str | None = None
    search_space_id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class TthcProcedureWithChunksRead(TthcProcedureRead):
    """Schema for reading a TTHC procedure with its chunks."""

    chunks: list[TthcChunkRead] = []
    content: str | None = None


class TthcPaginatedResponse(BaseModel):
    """Paginated response for TTHC procedures."""

    items: list[TthcProcedureRead]
    total: int
    page: int
    page_size: int


class TthcImportResult(BaseModel):
    """Result of a TTHC bulk import operation."""

    created: int = 0
    updated: int = 0
    skipped: int = 0
    errors: list[str] = []
