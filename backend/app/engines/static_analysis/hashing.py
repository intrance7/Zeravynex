import hashlib
import math
from typing import Dict, Any, Union
from pathlib import Path


def calculate_entropy(data: bytes) -> float:
    """Calculate Shannon entropy of a byte string (range: 0.0 - 8.0)."""
    if not data:
        return 0.0
    
    length = len(data)
    counts: Dict[int, int] = {}
    for byte in data:
        counts[byte] = counts.get(byte, 0) + 1
        
    entropy = 0.0
    for count in counts.values():
        probability = count / length
        entropy -= probability * math.log2(probability)
        
    return round(entropy, 4)


class Hasher:
    """Provides cryptographic hashes, size, and entropy for files or byte content."""

    @staticmethod
    def hash_file(file_path: Union[str, Path]) -> Dict[str, Any]:
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"File not found: {file_path}")

        md5_hash = hashlib.md5()
        sha1_hash = hashlib.sha1()
        sha256_hash = hashlib.sha256()

        file_size = path.stat().st_size
        
        with open(path, "rb") as f:
            content = f.read()
            md5_hash.update(content)
            sha1_hash.update(content)
            sha256_hash.update(content)

        file_entropy = calculate_entropy(content)

        return {
            "md5": md5_hash.hexdigest().lower(),
            "sha1": sha1_hash.hexdigest().lower(),
            "sha256": sha256_hash.hexdigest().lower(),
            "size_bytes": file_size,
            "entropy": file_entropy,
        }
