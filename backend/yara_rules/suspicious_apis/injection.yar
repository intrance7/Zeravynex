rule Process_Injection_Primitives {
    meta:
        description = "Detects WinAPI imports commonly used together for process injection or hollow process attacks"
        author = "Zeravynex Security Team"
        severity = "HIGH"
        category = "Process Injection"
    strings:
        $valloc = "VirtualAllocEx" ascii
        $wmem = "WriteProcessMemory" ascii
        $crem = "CreateRemoteThread" ascii
        $ntthread = "NtCreateThreadEx" ascii
        $apc = "QueueUserAPC" ascii
    condition:
        ($valloc and $wmem and ($crem or $ntthread or $apc))
}

rule Anti_Debugging_Primitives {
    meta:
        description = "Detects combination of anti-debugging and process inspection APIs"
        author = "Zeravynex Security Team"
        severity = "MEDIUM"
        category = "Anti-Analysis"
    strings:
        $dbg1 = "IsDebuggerPresent" ascii
        $dbg2 = "CheckRemoteDebuggerPresent" ascii
        $dbg3 = "NtQueryInformationProcess" ascii
    condition:
        2 of ($dbg*)
}
