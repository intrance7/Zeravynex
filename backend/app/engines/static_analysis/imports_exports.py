from typing import Dict, List, Any, Union, Set
from pathlib import Path
import pefile

# Dictionary of Win32 API functions categorized by security significance
SUSPICIOUS_API_CATEGORIES: Dict[str, Set[str]] = {
    "Process Injection & Execution": {
        "VirtualAllocEx", "WriteProcessMemory", "CreateRemoteThread", "NtCreateThreadEx",
        "RtlCreateUserThread", "QueueUserAPC", "SetThreadContext", "ResumeThread",
        "OpenProcess", "Process32First", "Process32Next", "Process32FirstW", "Process32NextW",
        "WinExec", "ShellExecuteA", "ShellExecuteW", "CreateProcessA", "CreateProcessW"
    },
    "Memory Manipulation": {
        "VirtualAlloc", "VirtualProtect", "VirtualProtectEx", "RtlMoveMemory", "ZwMapViewOfSection"
    },
    "Network & C2 Activity": {
        "URLDownloadToFileA", "URLDownloadToFileW", "InternetOpenA", "InternetOpenW",
        "InternetConnectA", "InternetConnectW", "HttpOpenRequestA", "HttpSendRequestA",
        "WSAStartup", "socket", "connect", "send", "recv", "WinHttpOpen", "WinHttpConnect"
    },
    "Registry & Persistence": {
        "RegSetValueExA", "RegSetValueExW", "RegCreateKeyExA", "RegCreateKeyExW",
        "RegOpenKeyExA", "RegOpenKeyExW", "CreateServiceA", "CreateServiceW",
        "StartServiceA", "StartServiceW", "OpenSCManagerA", "OpenSCManagerW"
    },
    "Anti-Analysis & Evasion": {
        "IsDebuggerPresent", "CheckRemoteDebuggerPresent", "NtQueryInformationProcess",
        "OutputDebugStringA", "FindWindowA", "FindWindowW", "GetTickCount", "Sleep",
        "QueryPerformanceCounter"
    },
    "Input Monitoring & Crypto": {
        "SetWindowsHookExA", "SetWindowsHookExW", "GetAsyncKeyState", "GetForegroundWindow",
        "CryptEncrypt", "CryptDecrypt", "CryptAcquireContextA", "CryptGenRandom"
    }
}


class ImportsExportsAnalyzer:
    """Parses PE Import Address Table (IAT) and Export Table, categorizing security indicators."""

    @classmethod
    def analyze_imports_exports(cls, file_path: Union[str, Path]) -> Dict[str, Any]:
        path = Path(file_path)
        imports_by_dll: Dict[str, List[str]] = {}
        exports: List[str] = []
        suspicious_apis_found: List[Dict[str, str]] = []
        total_imported_functions = 0

        try:
            pe = pefile.PE(path, fast_load=False)
        except Exception:
            return {
                "imports": {},
                "exports": [],
                "total_imported_functions": 0,
                "total_exported_functions": 0,
                "suspicious_apis": []
            }

        # Analyze Imports
        if hasattr(pe, "DIRECTORY_ENTRY_IMPORT"):
            for entry in pe.DIRECTORY_ENTRY_IMPORT:
                dll_name = entry.dll.decode("utf-8", errors="ignore").lower() if entry.dll else "unknown.dll"
                func_list: List[str] = []
                
                for imp in entry.imports:
                    if imp.name:
                        func_name = imp.name.decode("utf-8", errors="ignore")
                    else:
                        func_name = f"Ordinal_{imp.ordinal}"
                        
                    func_list.append(func_name)
                    total_imported_functions += 1

                    # Check against suspicious API categories
                    for category, api_set in SUSPICIOUS_API_CATEGORIES.items():
                        if func_name in api_set:
                            suspicious_apis_found.append({
                                "api": func_name,
                                "dll": dll_name,
                                "category": category
                            })

                imports_by_dll[dll_name] = func_list

        # Analyze Exports
        if hasattr(pe, "DIRECTORY_ENTRY_EXPORT"):
            for exp in pe.DIRECTORY_ENTRY_EXPORT.symbols:
                if exp.name:
                    exp_name = exp.name.decode("utf-8", errors="ignore")
                    exports.append(exp_name)
                elif exp.ordinal is not None:
                    exports.append(f"Ordinal_{exp.ordinal}")

        pe.close()

        return {
            "imports": imports_by_dll,
            "exports": exports,
            "total_imported_functions": total_imported_functions,
            "total_exported_functions": len(exports),
            "suspicious_apis": suspicious_apis_found
        }
