rule UPX_Packed_Binary {
    meta:
        description = "Detects UPX packed executable binaries"
        author = "Zeravynex Security Team"
        severity = "MEDIUM"
        category = "Packer"
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
        description = "Detects generic high entropy section indicators common in packed malware"
        author = "Zeravynex Security Team"
        severity = "HIGH"
        category = "Evasion"
    strings:
        $p1 = ".aspack" ascii case_insensitive
        $p2 = ".themida" ascii case_insensitive
        $p3 = ".vmp0" ascii case_insensitive
        $p4 = ".mpress" ascii case_insensitive
    condition:
        any of ($p*)
}
