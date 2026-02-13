"""
TTHC (Thủ tục hành chính) CRUD + import routes.
"""

import logging
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import (
    Permission,
    TthcChunk,
    TthcProcedure,
    User,
    get_async_session,
)
from app.schemas.tthc import (
    TthcImportResult,
    TthcPaginatedResponse,
    TthcProcedureCreate,
    TthcProcedureRead,
    TthcProcedureUpdate,
    TthcProcedureWithChunksRead,
)
from app.users import current_active_user
from app.utils.rbac import check_permission
from app.utils.tthc_utils import (
    build_tthc_content,
    create_tthc_chunks,
    generate_tthc_content_hash,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tthc", tags=["TTHC"])


def _build_content_from_procedure(data: TthcProcedureCreate | TthcProcedureUpdate) -> str:
    """Build combined content from procedure data fields."""
    return build_tthc_content(
        name=getattr(data, "name", "") or "",
        code=data.code,
        deadline=data.deadline,
        location=data.location,
        method=data.method,
        legal_basis=data.legal_basis,
        fee=data.fee,
        result=data.result,
        subjects=data.subjects,
        implementing_agency=data.implementing_agency,
    )


@router.get("/by-chunk/{chunk_id}", response_model=TthcProcedureWithChunksRead)
async def get_tthc_by_chunk_global(
    chunk_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Get the parent TTHC procedure for a given chunk ID (for citation resolution).

    This endpoint does NOT require search_space_id — it resolves directly from chunk.
    Permission is checked against the procedure's search_space_id.
    """
    stmt = (
        select(TthcProcedure)
        .join(TthcChunk, TthcChunk.procedure_id == TthcProcedure.id)
        .options(selectinload(TthcProcedure.chunks))
        .where(TthcChunk.id == chunk_id)
    )
    result = await session.execute(stmt)
    procedure = result.scalars().first()

    if not procedure:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy thủ tục hành chính cho chunk này",
        )

    await check_permission(
        session, user, procedure.search_space_id, Permission.TTHC_READ.value,
        "Bạn không có quyền xem thủ tục hành chính",
    )

    return TthcProcedureWithChunksRead.model_validate(procedure)


@router.get("/{search_space_id}", response_model=TthcPaginatedResponse)
async def list_tthc_procedures(
    search_space_id: int,
    page: int = Query(0, ge=0),
    page_size: int = Query(20, ge=1, le=100),
    name: str | None = Query(None),
    code: str | None = Query(None),
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """List TTHC procedures in a search space (paginated, filterable)."""
    await check_permission(
        session, user, search_space_id, Permission.TTHC_READ.value,
        "Bạn không có quyền xem thủ tục hành chính",
    )

    # Normalize filter params
    if name in ("", "undefined", "null"):
        name = None
    if code in ("", "undefined", "null"):
        code = None

    base_filter = TthcProcedure.search_space_id == search_space_id
    query = select(TthcProcedure).where(base_filter)
    count_query = select(func.count(TthcProcedure.id)).where(base_filter)

    if name:
        condition = TthcProcedure.name.ilike(f"%{name}%")
        query = query.where(condition)
        count_query = count_query.where(condition)
    if code:
        condition = TthcProcedure.code.ilike(f"%{code}%")
        query = query.where(condition)
        count_query = count_query.where(condition)

    total = (await session.execute(count_query)).scalar() or 0
    offset = page * page_size
    result = await session.execute(
        query.order_by(TthcProcedure.name).offset(offset).limit(page_size)
    )
    procedures = result.scalars().all()

    return TthcPaginatedResponse(
        items=[TthcProcedureRead.model_validate(p) for p in procedures],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{search_space_id}/{tthc_id}", response_model=TthcProcedureWithChunksRead)
async def get_tthc_procedure(
    search_space_id: int,
    tthc_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Get a single TTHC procedure with its chunks."""
    await check_permission(
        session, user, search_space_id, Permission.TTHC_READ.value,
        "Bạn không có quyền xem thủ tục hành chính",
    )

    stmt = (
        select(TthcProcedure)
        .options(selectinload(TthcProcedure.chunks))
        .where(TthcProcedure.id == tthc_id, TthcProcedure.search_space_id == search_space_id)
    )
    result = await session.execute(stmt)
    procedure = result.scalars().first()

    if not procedure:
        raise HTTPException(status_code=404, detail="Thủ tục hành chính không tìm thấy")

    return TthcProcedureWithChunksRead.model_validate(procedure)


@router.post("/{search_space_id}", response_model=TthcProcedureRead)
async def create_tthc_procedure(
    search_space_id: int,
    data: TthcProcedureCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Create a new TTHC procedure with auto-generated chunks and embeddings."""
    await check_permission(
        session, user, search_space_id, Permission.TTHC_CREATE.value,
        "Bạn không có quyền tạo thủ tục hành chính",
    )

    from app.config import config

    content = _build_content_from_procedure(data)
    content_hash = generate_tthc_content_hash(content)
    chunks = create_tthc_chunks(content)

    procedure = TthcProcedure(
        name=data.name,
        code=data.code,
        content_hash=content_hash,
        deadline=data.deadline,
        location=data.location,
        method=data.method,
        legal_basis=data.legal_basis,
        form_attachments=[att.model_dump() for att in data.form_attachments] if data.form_attachments else None,
        fee=data.fee,
        result=data.result,
        subjects=data.subjects,
        implementing_agency=data.implementing_agency,
        content=content,
        embedding=config.embedding_model_instance.embed(content),
        updated_at=datetime.now(UTC),
        search_space_id=search_space_id,
        created_by_id=user.id,
        chunks=chunks,
    )

    session.add(procedure)
    await session.commit()
    await session.refresh(procedure)

    return TthcProcedureRead.model_validate(procedure)


@router.put("/{search_space_id}/{tthc_id}", response_model=TthcProcedureRead)
async def update_tthc_procedure(
    search_space_id: int,
    tthc_id: int,
    data: TthcProcedureUpdate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Update an existing TTHC procedure. Re-generates chunks and embeddings."""
    await check_permission(
        session, user, search_space_id, Permission.TTHC_UPDATE.value,
        "Bạn không có quyền cập nhật thủ tục hành chính",
    )

    stmt = (
        select(TthcProcedure)
        .options(selectinload(TthcProcedure.chunks))
        .where(TthcProcedure.id == tthc_id, TthcProcedure.search_space_id == search_space_id)
    )
    result = await session.execute(stmt)
    procedure = result.scalars().first()

    if not procedure:
        raise HTTPException(status_code=404, detail="Thủ tục hành chính không tìm thấy")

    from app.config import config

    # Update fields that were provided
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "form_attachments" and value is not None:
            value = [att if isinstance(att, dict) else att.model_dump() for att in value]
        setattr(procedure, field, value)

    # Rebuild content and re-embed
    content = build_tthc_content(
        name=procedure.name,
        code=procedure.code,
        deadline=procedure.deadline,
        location=procedure.location,
        method=procedure.method,
        legal_basis=procedure.legal_basis,
        fee=procedure.fee,
        result=procedure.result,
        subjects=procedure.subjects,
        implementing_agency=procedure.implementing_agency,
    )
    procedure.content = content
    procedure.content_hash = generate_tthc_content_hash(content)
    procedure.embedding = config.embedding_model_instance.embed(content)
    procedure.updated_at = datetime.now(UTC)

    # Replace chunks
    procedure.chunks = create_tthc_chunks(content)

    await session.commit()
    await session.refresh(procedure)

    return TthcProcedureRead.model_validate(procedure)


@router.delete("/{search_space_id}/{tthc_id}")
async def delete_tthc_procedure(
    search_space_id: int,
    tthc_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Delete a TTHC procedure and all its chunks."""
    await check_permission(
        session, user, search_space_id, Permission.TTHC_DELETE.value,
        "Bạn không có quyền xóa thủ tục hành chính",
    )

    stmt = select(TthcProcedure).where(
        TthcProcedure.id == tthc_id, TthcProcedure.search_space_id == search_space_id
    )
    result = await session.execute(stmt)
    procedure = result.scalars().first()

    if not procedure:
        raise HTTPException(status_code=404, detail="Thủ tục hành chính không tìm thấy")

    await session.delete(procedure)
    await session.commit()

    return {"detail": "Đã xóa thủ tục hành chính thành công"}


@router.post("/{search_space_id}/import", response_model=TthcImportResult)
async def import_tthc_procedures(
    search_space_id: int,
    file: UploadFile,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """
    Import TTHC procedures from an Excel (.xlsx) or CSV file.
    Deduplicates by content_hash within the search space.
    """
    await check_permission(
        session, user, search_space_id, Permission.TTHC_CREATE.value,
        "Bạn không có quyền tạo thủ tục hành chính",
    )

    from app.config import config
    from app.utils.tthc_import import parse_csv, parse_excel

    if not file.filename:
        raise HTTPException(status_code=400, detail="Vui lòng chọn file để import")

    file_bytes = await file.read()
    filename_lower = file.filename.lower()

    if filename_lower.endswith(".xlsx"):
        rows = parse_excel(file_bytes)
    elif filename_lower.endswith(".csv"):
        rows = parse_csv(file_bytes)
    else:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file .xlsx hoặc .csv")

    if not rows:
        raise HTTPException(status_code=400, detail="File không có dữ liệu hoặc không nhận diện được header")

    # Get existing content hashes for dedup
    existing_hashes_result = await session.execute(
        select(TthcProcedure.content_hash).where(
            TthcProcedure.search_space_id == search_space_id
        )
    )
    existing_hashes = {h for h in existing_hashes_result.scalars().all()}

    result = TthcImportResult()

    for idx, row in enumerate(rows):
        try:
            content = build_tthc_content(**{k: v for k, v in row.items() if k in {
                "name", "code", "deadline", "location", "method",
                "legal_basis", "fee", "result", "subjects", "implementing_agency",
            }})
            content_hash = generate_tthc_content_hash(content)

            if content_hash in existing_hashes:
                result.skipped += 1
                continue

            chunks = create_tthc_chunks(content)

            procedure = TthcProcedure(
                name=row.get("name", ""),
                code=row.get("code"),
                content_hash=content_hash,
                deadline=row.get("deadline"),
                location=row.get("location"),
                method=row.get("method"),
                legal_basis=row.get("legal_basis"),
                fee=row.get("fee"),
                result=row.get("result"),
                subjects=row.get("subjects"),
                implementing_agency=row.get("implementing_agency"),
                content=content,
                embedding=config.embedding_model_instance.embed(content),
                updated_at=datetime.now(UTC),
                search_space_id=search_space_id,
                created_by_id=user.id,
                chunks=chunks,
            )

            session.add(procedure)
            existing_hashes.add(content_hash)
            result.created += 1

        except Exception as e:
            logger.error(f"Error importing row {idx + 1}: {e}")
            result.errors.append(f"Dòng {idx + 2}: {e!s}")

    await session.commit()

    return result


@router.get("/{search_space_id}/by-chunk/{chunk_id}", response_model=TthcProcedureRead)
async def get_tthc_by_chunk(
    search_space_id: int,
    chunk_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Get the parent TTHC procedure for a given chunk ID (for citation resolution)."""
    await check_permission(
        session, user, search_space_id, Permission.TTHC_READ.value,
        "Bạn không có quyền xem thủ tục hành chính",
    )

    stmt = (
        select(TthcProcedure)
        .join(TthcChunk, TthcChunk.procedure_id == TthcProcedure.id)
        .where(
            TthcChunk.id == chunk_id,
            TthcProcedure.search_space_id == search_space_id,
        )
    )
    result = await session.execute(stmt)
    procedure = result.scalars().first()

    if not procedure:
        raise HTTPException(status_code=404, detail="Không tìm thấy thủ tục hành chính cho chunk này")

    return TthcProcedureRead.model_validate(procedure)
