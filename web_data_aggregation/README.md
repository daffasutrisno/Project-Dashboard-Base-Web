# Web Data Aggregation

Folder ini berisi program Python untuk mengagregasi data dari hasil forecast menjadi format CSV yang siap dibaca oleh web dashboard.

## Struktur

```
web_data_aggregation/
├── README.md
├── requirements.txt
├── aggregate_all.py              # Jalankan semua agregasi
├── aggregate_regional_stats.py   # Statistics untuk 3 regional
├── aggregate_provinsi_stats.py   # Statistics untuk 6 provinsi
├── aggregate_kabupaten_ranking.py # Ranking 111 kabupaten
└── outputs/                       # Hasil CSV untuk web
    ├── regional_statistics.csv
    ├── provinsi_statistics.csv
    ├── kabupaten_all_growth.csv
    ├── regional_comparison.csv
    └── provinsi_comparison.csv
```

## Output Files

### 1. regional_statistics.csv
Kolom: `Region, Hist_Mean, Hist_Std, Hist_Min, Hist_Max, Fore_Mean, Fore_Std, Fore_Min, Fore_Max, Data_Points_Hist, Data_Points_Fore`

### 2. provinsi_statistics.csv
Kolom: `Province, Hist_Mean, Hist_Std, Hist_Min, Hist_Max, Fore_Mean, Fore_Std, Fore_Min, Fore_Max, Data_Points_Hist, Data_Points_Fore`

### 3. kabupaten_all_growth.csv
Kolom: `Kabupaten, Region, Province, Hist_Mean, Fore_Mean, Absolute_Growth, Percentage_Growth`

### 4. regional_comparison.csv
Kolom: `Region, Historical_Avg, Forecast_Avg, Change, Change_Pct`

### 5. provinsi_comparison.csv
Kolom: `Province, Historical_Avg, Forecast_Avg, Change, Change_Pct`

## Cara Penggunaan

1. Pastikan forecast sudah dijalankan
2. Install dependencies: `pip install pandas openpyxl`
3. Jalankan dari root project:
   ```bash
   cd "e:\Sem 5\KP\Prjeect 4\web_data_aggregation"
   python aggregate_all.py
   ```
4. Script akan otomatis copy ke `../fix/public/web_data/`

## Web Integration

Web root ada di folder `fix/`, akan membaca dari `/web_data/*.csv` untuk:
- Statistics Summary Tables (ComparisonTable.tsx)
- Comparison Charts (RegionalComparisonChart.tsx, ProvinsiComparisonChart.tsx)
- Kabupaten Growth Ranking (KabupatenGrowthList.tsx)

Tidak ada lagi kalkulasi di frontend, semua tinggal baca CSV.
