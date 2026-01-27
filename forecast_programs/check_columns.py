"""
Check Excel Column Names
"""
import pandas as pd

# Load Excel file
df = pd.read_excel("Traffic_VLR_Java_2024-2025.xlsx", sheet_name=0)

print("=" * 60)
print("COLUMN NAMES IN EXCEL FILE:")
print("=" * 60)
print("\nColumns found:")
for i, col in enumerate(df.columns, 1):
    print(f"{i}. '{col}'")

print("\n" + "=" * 60)
print("FIRST 3 ROWS:")
print("=" * 60)
print(df.head(3))

print("\n" + "=" * 60)
print("UNIQUE VALUES IN KEY COLUMNS:")
print("=" * 60)

# Check for region/province related columns
for col in df.columns:
    col_lower = col.lower()
    if any(keyword in col_lower for keyword in ['region', 'provinsi', 'province', 'kabupaten', 'kota']):
        print(f"\n{col}:")
        unique_vals = df[col].unique()[:10]  # Show first 10 unique values
        for val in unique_vals:
            print(f"  - {val}")
        if len(df[col].unique()) > 10:
            print(f"  ... and {len(df[col].unique()) - 10} more")
