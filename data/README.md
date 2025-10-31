# Data Directory

## Struktur

- `raw/` - Letakkan dataset mentah Anda di sini
- `processed/` - Data yang sudah diproses akan disimpan di sini

## Format Data

Pastikan data Anda dalam format CSV atau format yang dapat dibaca oleh pandas.

### Contoh Struktur Data

```csv
feature1,feature2,feature3,target
1.0,2.0,3.0,0
4.0,5.0,6.0,1
7.0,8.0,9.0,0
```

## Catatan

- File data tidak di-commit ke repository (lihat .gitignore)
- Gunakan data dummy untuk testing
- Dokumentasikan format dan deskripsi data Anda
