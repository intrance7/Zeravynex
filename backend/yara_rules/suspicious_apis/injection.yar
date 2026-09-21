rule Process_Injection_Primitives {
    meta:
        author = "Zeravynex Security Team"
        description = "Detects WinAPI imports commonly used together for process injection"
        reference = "https://attack.mitre.org/techniques/T1055/"
        mitre_attack_id = "T1055"
        category = "Process Injection"
        severity = "HIGH"
        namespace = "suspicious_apis"
        tags = "injection"
    strings:
        $api1 = "VirtualAllocEx" ascii wide nocase
        $api2 = "WriteProcessMemory" ascii wide nocase
        $api3 = "CreateRemoteThread" ascii wide nocase
    condition:
        all of them
}
