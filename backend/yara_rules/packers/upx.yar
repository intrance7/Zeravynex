rule UPX_Packed_Binary {
    meta:
        author = "Zeravynex Security Team"
        description = "Detects UPX packed executable binaries"
        reference = "https://attack.mitre.org/techniques/T1027/002/"
        mitre_attack_id = "T1027.002"
        category = "Packer"
        severity = "MEDIUM"
        namespace = "packers"
        tags = "packer upx"
    strings:
        $upx0 = "UPX0" ascii wide
        $upx1 = "UPX1" ascii wide
    condition:
        $upx0 and $upx1
}
