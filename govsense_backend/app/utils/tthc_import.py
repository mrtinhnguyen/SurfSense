"""
Excel/CSV import parser for TTHC (Thủ tục hành chính) data.
"""

import csv
import io
import logging

logger = logging.getLogger(__name__)

# Map Vietnamese column headers to model field names
COLUMN_MAPPING: dict[str, str] = {
    # Vietnamese headers
    "tên thủ tục": "name",
    "tên thủ tục hành chính": "name",
    "ten thu tuc": "name",
    "ten thu tuc hanh chinh": "name",
    "mã thủ tục": "code",
    "ma thu tuc": "code",
    "mã": "code",
    "thời hạn giải quyết": "deadline",
    "thoi han giai quyet": "deadline",
    "thời hạn": "deadline",
    "địa điểm thực hiện": "location",
    "dia diem thuc hien": "location",
    "nơi tiếp nhận": "location",
    "cách thức thực hiện": "method",
    "cach thuc thuc hien": "method",
    "căn cứ pháp lý": "legal_basis",
    "can cu phap ly": "legal_basis",
    "lệ phí": "fee",
    "le phi": "fee",
    "phí": "fee",
    "kết quả": "result",
    "kết quả thực hiện": "result",
    "ket qua": "result",
    "đối tượng thực hiện": "subjects",
    "doi tuong thuc hien": "subjects",
    "đối tượng": "subjects",
    "cơ quan thực hiện": "implementing_agency",
    "co quan thuc hien": "implementing_agency",
    "cơ quan": "implementing_agency",
    # English headers
    "name": "name",
    "code": "code",
    "deadline": "deadline",
    "location": "location",
    "method": "method",
    "legal_basis": "legal_basis",
    "legal basis": "legal_basis",
    "fee": "fee",
    "result": "result",
    "subjects": "subjects",
    "implementing_agency": "implementing_agency",
    "implementing agency": "implementing_agency",
    "agency": "implementing_agency",
}


def _normalize_header(header: str) -> str:
    """Normalize column header for matching."""
    return header.strip().lower()


def _map_headers(headers: list[str]) -> dict[int, str]:
    """
    Map column indexes to field names based on header matching.

    Returns:
        Dict mapping column index → field name.
    """
    mapping: dict[int, str] = {}
    for idx, header in enumerate(headers):
        normalized = _normalize_header(header)
        if normalized in COLUMN_MAPPING:
            mapping[idx] = COLUMN_MAPPING[normalized]
    return mapping


def _row_to_dict(row: list[str], header_mapping: dict[int, str]) -> dict[str, str] | None:
    """Convert a row to a dict using header mapping. Returns None if no name field."""
    result: dict[str, str] = {}
    for idx, field_name in header_mapping.items():
        if idx < len(row):
            value = str(row[idx]).strip()
            if value:
                result[field_name] = value

    # Name is required
    if "name" not in result or not result["name"]:
        return None

    return result


def parse_excel(file_bytes: bytes) -> list[dict[str, str]]:
    """
    Parse an Excel (.xlsx) file into a list of TTHC field dicts.

    Args:
        file_bytes: Raw bytes of the Excel file.

    Returns:
        List of dicts with mapped field names.
    """
    try:
        import openpyxl
    except ImportError:
        raise ImportError("openpyxl is required for Excel import. Install with: pip install openpyxl")

    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True)
    ws = wb.active
    if ws is None:
        return []

    rows = list(ws.iter_rows(values_only=True))
    if len(rows) < 2:
        return []

    # First row is header
    headers = [str(cell or "") for cell in rows[0]]
    header_mapping = _map_headers(headers)

    if not header_mapping:
        logger.warning(f"No matching headers found. Headers: {headers}")
        return []

    results: list[dict[str, str]] = []
    for row in rows[1:]:
        row_values = [str(cell or "") for cell in row]
        parsed = _row_to_dict(row_values, header_mapping)
        if parsed:
            results.append(parsed)

    wb.close()
    return results


def parse_csv(file_bytes: bytes) -> list[dict[str, str]]:
    """
    Parse a CSV file into a list of TTHC field dicts.

    Args:
        file_bytes: Raw bytes of the CSV file.

    Returns:
        List of dicts with mapped field names.
    """
    # Try different encodings
    text = None
    for encoding in ["utf-8-sig", "utf-8", "cp1252", "latin-1"]:
        try:
            text = file_bytes.decode(encoding)
            break
        except UnicodeDecodeError:
            continue

    if text is None:
        raise ValueError("Unable to decode CSV file with supported encodings")

    reader = csv.reader(io.StringIO(text))
    rows = list(reader)

    if len(rows) < 2:
        return []

    header_mapping = _map_headers(rows[0])

    if not header_mapping:
        logger.warning(f"No matching headers found. Headers: {rows[0]}")
        return []

    results: list[dict[str, str]] = []
    for row in rows[1:]:
        parsed = _row_to_dict(row, header_mapping)
        if parsed:
            results.append(parsed)

    return results
