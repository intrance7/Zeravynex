rule UPX_Packed_Binary {
    meta:
        author = "Zeravynex Security Team"
        description = "Detects UPX packed executable binaries"
        reference = "https://attack.mitre.org/techniques/T1027/002/"
        mitre_attack_id = "T1027.002"
        severity = "MEDIUM"
        category = "Packer"
        namespace = "packers"
        tags = "packer upx"
    strings:
        $upx1 = "UPX0" ascii
        $upx2 = "UPX1" ascii
        $upx3 = "UPX!" ascii
        $upx_sig = { 55 50 58 21 }
    condition:
        2 of ($upx*) or $upx_sig
}

rule Generic_High_Entropy_Packer {
    meta:
        author = "Zeravynex Security Team"
        description = "Detects generic high entropy section indicators common in packed malware"
        reference = "https://attack.mitre.org/techniques/T1027/002/"
        mitre_attack_id = "T1027.002"
        severity = "HIGH"
        category = "Evasion"
        namespace = "packers"
        tags = "packer entropy"
    strings:
        $p1 = ".aspack" ascii nocase
        $p2 = ".themida" ascii nocase
        $p3 = ".vmp0" ascii nocase
        $p4 = ".mpress" ascii nocase
    condition:
        any of ($p*)
}
