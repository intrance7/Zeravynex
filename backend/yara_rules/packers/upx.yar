rule UPX_Packed_Binary {
    meta:
        description = "Detects UPX packed executable binaries"
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
