import datetime
from typing import Dict, Any, Union, Optional
from pathlib import Path
import pefile


class PEParser:
    """Parses Portable Executable (PE) headers, architecture, entry point, and compilation metadata."""

    @staticmethod
    def is_pe_file(file_path: Union[str, Path]) -> bool:
        """Check if file has valid PE magic bytes ('MZ')."""
        try:
            with open(file_path, "rb") as f:
                header = f.read(2)
                return header == b"MZ"
        except Exception:
            return False

    @classmethod
    def parse_header(cls, file_path: Union[str, Path]) -> Dict[str, Any]:
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"File not found: {file_path}")

        if not cls.is_pe_file(path):
            return {
                "is_pe": False,
                "error": "Not a valid Portable Executable (missing MZ magic bytes)"
            }

        try:
            pe = pefile.PE(path, fast_load=True)
            
            # Parse Architecture / Machine
            machine_code = pe.FILE_HEADER.Machine
            machine_name = pefile.MACHINE_TYPE.get(machine_code, f"UNKNOWN (0x{machine_code:04x})")
            if isinstance(machine_name, bytes):
                machine_name = machine_name.decode("utf-8", errors="ignore")
            # Simplify machine representation
            if "AMD64" in machine_name or "64" in machine_name:
                arch = "x64 (64-bit)"
            elif "I386" in machine_name or "386" in machine_name:
                arch = "x86 (32-bit)"
            elif "ARM" in machine_name:
                arch = "ARM"
            else:
                arch = machine_name

            # Subsystem
            subsystem_code = getattr(pe.OPTIONAL_HEADER, "Subsystem", 0)
            subsystem_name = pefile.SUBSYSTEM_TYPE.get(subsystem_code, f"UNKNOWN ({subsystem_code})")
            if isinstance(subsystem_name, bytes):
                subsystem_name = subsystem_name.decode("utf-8", errors="ignore")

            # Timestamp
            timestamp = pe.FILE_HEADER.TimeDateStamp
            try:
                compile_time = datetime.datetime.fromtimestamp(timestamp, datetime.timezone.utc).isoformat()
            except Exception:
                compile_time = f"Invalid timestamp ({timestamp})"

            # Characteristics flags
            characteristics = pe.FILE_HEADER.Characteristics
            is_dll = bool(characteristics & pefile.IMAGE_CHARACTERISTICS["IMAGE_FILE_DLL"])
            is_executable = bool(characteristics & pefile.IMAGE_CHARACTERISTICS["IMAGE_FILE_EXECUTABLE_IMAGE"])

            # Optional Header Details
            opt_header = pe.OPTIONAL_HEADER
            entry_point = getattr(opt_header, "AddressOfEntryPoint", 0)
            image_base = getattr(opt_header, "ImageBase", 0)
            size_of_image = getattr(opt_header, "SizeOfImage", 0)
            checksum = getattr(opt_header, "CheckSum", 0)
            dll_characteristics = getattr(opt_header, "DllCharacteristics", 0)

            # Security mitigation flags (ASLR, DEP, SafeSEH, etc.)
            aslr = bool(dll_characteristics & 0x0040)
            dep_nx = bool(dll_characteristics & 0x0100)
            no_seh = bool(dll_characteristics & 0x0400)
            cfg = bool(dll_characteristics & 0x4000)

            # Check for Digital Signature / Authenticode
            has_signature = False
            try:
                sec_dir_idx = pefile.DIRECTORY_ENTRY.get('IMAGE_DIRECTORY_ENTRY_SECURITY', 4)
                if len(pe.OPTIONAL_HEADER.DATA_DIRECTORY) > sec_dir_idx:
                    sec_dir = pe.OPTIONAL_HEADER.DATA_DIRECTORY[sec_dir_idx]
                    if sec_dir.Size > 0:
                        has_signature = True
            except Exception:
                pass

            result = {
                "is_pe": True,
                "architecture": arch,
                "subsystem": subsystem_name,
                "file_type": "DLL" if is_dll else ("Executable" if is_executable else "PE File"),
                "compile_timestamp": compile_time,
                "raw_timestamp": timestamp,
                "entry_point": f"0x{entry_point:08X}",
                "image_base": f"0x{image_base:08X}",
                "size_of_image": size_of_image,
                "checksum": f"0x{checksum:08X}",
                "number_of_sections": pe.FILE_HEADER.NumberOfSections,
                "security_features": {
                    "aslr": aslr,
                    "dep_nx": dep_nx,
                    "no_seh": no_seh,
                    "cfg": cfg,
                    "has_signature": has_signature
                }
            }
            pe.close()
            return result

        except pefile.PEFormatError as e:
            return {
                "is_pe": False,
                "error": f"Invalid PE Format: {str(e)}"
            }
        except Exception as e:
            return {
                "is_pe": False,
                "error": f"PE Parsing failed: {str(e)}"
            }
