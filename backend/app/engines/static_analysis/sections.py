from typing import List, Dict, Any, Union
from pathlib import Path
import pefile
from .hashing import calculate_entropy


# Standard PE Section Flags
IMAGE_SCN_MEM_EXECUTE = 0x20000000
IMAGE_SCN_MEM_READ    = 0x40000000
IMAGE_SCN_MEM_WRITE   = 0x80000000

STANDARD_SECTION_NAMES = {
    ".text", ".data", ".rdata", ".idata", ".rsrc", ".reloc",
    ".pdata", ".tls", ".bss", ".edata", ".arch", ".srdata"
}


class SectionAnalyzer:
    """Analyzes PE sections for entropy, size discrepancies, permissions, and anomalies."""

    @staticmethod
    def analyze_sections(file_path: Union[str, Path]) -> List[Dict[str, Any]]:
        path = Path(file_path)
        sections_data: List[Dict[str, Any]] = []

        try:
            pe = pefile.PE(path, fast_load=False)
        except Exception:
            return sections_data

        for section in pe.sections:
            # Clean section name string
            raw_name = section.Name.decode("utf-8", errors="ignore").rstrip("\x00")
            name = raw_name if raw_name else "<unnamed>"

            # Characteristics / Permissions
            chars = section.Characteristics
            is_read = bool(chars & IMAGE_SCN_MEM_READ)
            is_write = bool(chars & IMAGE_SCN_MEM_WRITE)
            is_exec = bool(chars & IMAGE_SCN_MEM_EXECUTE)

            perms = []
            if is_read: perms.append("R")
            if is_write: perms.append("W")
            if is_exec: perms.append("X")
            perm_str = "".join(perms) if perms else "NONE"

            is_rwx = (is_read and is_write and is_exec)

            # Entropy calculation on raw section data
            sec_data = section.get_data()
            entropy = calculate_entropy(sec_data)

            # Size metrics
            raw_size = section.SizeOfRawData
            virt_size = section.Misc_VirtualSize
            virt_address = section.VirtualAddress

            # Anomalies check
            anomalies = []
            if is_rwx:
                anomalies.append("RWX_PERMISSION (Self-modifying / Injection code potential)")
            if entropy >= 7.1:
                anomalies.append("HIGH_ENTROPY (Possible packing, encryption, or compressed payload)")
            if raw_size == 0 and virt_size > 0:
                anomalies.append("ZERO_RAW_SIZE (Uninitialized data or packed code section)")
            if name.lower() not in STANDARD_SECTION_NAMES:
                anomalies.append(f"NON_STANDARD_SECTION_NAME ({name})")

            sections_data.append({
                "name": name,
                "virtual_address": f"0x{virt_address:08X}",
                "virtual_size": virt_size,
                "raw_size": raw_size,
                "entropy": entropy,
                "permissions": perm_str,
                "is_readable": is_read,
                "is_writable": is_write,
                "is_executable": is_exec,
                "is_rwx": is_rwx,
                "anomalies": anomalies
            })

        pe.close()
        return sections_data
