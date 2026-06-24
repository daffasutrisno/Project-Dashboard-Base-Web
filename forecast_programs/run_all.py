"""
RUN ALL — FORECAST PIPELINE ORCHESTRATOR
=========================================
Menjalankan seluruh pipeline forecasting secara berurutan:
  Step 1: Forecast (total → regional → provinsi → kabupaten)
  Step 2: Merge forecast + historical → merged_outputs/
  Step 3: Analysis → statistics + comparison → web_data/

Urutan eksekusi:
  1. step1_forecast_total.py      — Forecast total traffic
  2. step1_forecast_regional.py   — Forecast 3 regional
  3. step1_forecast_provinsi.py   — Forecast 6 provinsi
  4. step1_forecast_kabupaten.py  — Forecast 119 kabupaten (⚠️ ~5-10 menit)
  5. step2_merge_outputs.py       — Merge ke public/merged_outputs/
  6. step3_analysis.py            — Analisis → public/web_data/
"""

import subprocess
import sys
from pathlib import Path


def print_header(text):
    """Print formatted header"""
    print("\n" + "=" * 80)
    print(f"  {text}")
    print("=" * 80)


def print_step(step_num, total_steps, text):
    """Print step information"""
    print(f"\n[STEP {step_num}/{total_steps}] {text}")
    print("-" * 80)


def run_script(script_name, description):
    """Run a Python script"""
    print(f"\n▶ Menjalankan: {script_name}")
    print(f"  {description}")
    print()

    try:
        root_dir = Path(__file__).parent
        result = subprocess.run(
            [sys.executable, str(root_dir / script_name)],
            cwd=root_dir,
            check=True,
            capture_output=False
        )
        print(f"\n✓ {script_name} selesai")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n✗ Error menjalankan {script_name}")
        print(f"  Exit code: {e.returncode}")
        return False
    except FileNotFoundError:
        print(f"\n✗ File tidak ditemukan: {script_name}")
        return False


def main():
    """Main execution"""
    print_header("FORECAST PIPELINE — RUN ALL")

    print("\n⚠️  CATATAN:")
    print("  - Step 1c (kabupaten) memakan waktu ~5-10 menit")
    print("  - Jika tidak ingin menjalankan forecast kabupaten, tekan Ctrl+C")
    print("  - Semua output akan tersedia untuk web dashboard")
    print()

    total_steps = 6

    # =========================================================
    # STEP 1: FORECAST
    # =========================================================

    # Step 1a: Forecast Total
    print_step(1, total_steps, "Step 1a: Forecast Total Traffic")
    if not run_script("step1_forecast_total.py", "Forecast traffic keseluruhan"):
        print("\n❌ Pipeline berhenti karena error di forecast total")
        return

    # Step 1b: Forecast Regional
    print_step(2, total_steps, "Step 1b: Forecast Regional (3 regional)")
    if not run_script("step1_forecast_regional.py", "Forecast Bali Nusra, Central Java, East Java"):
        print("\n❌ Pipeline berhenti karena error di forecast regional")
        return

    # Step 1c: Forecast Provinsi
    print_step(3, total_steps, "Step 1c: Forecast Provinsi (6 provinsi)")
    if not run_script("step1_forecast_provinsi.py", "Forecast 6 provinsi"):
        print("\n❌ Pipeline berhenti karena error di forecast provinsi")
        return

    # Step 1d: Forecast Kabupaten (optional, long process)
    print_step(4, total_steps, "Step 1d: Forecast Kabupaten ⚠️  ~5-10 menit")
    if not run_script("step1_forecast_kabupaten.py", "Forecast 119 kabupaten"):
        print("\n⚠️  Forecast kabupaten gagal atau dibatalkan")
        print("  Pipeline lanjut ke step 2 tanpa data kabupaten")

    # =========================================================
    # STEP 2: MERGE
    # =========================================================
    print_step(5, total_steps, "Step 2: Merge Forecast + Historical → merged_outputs/")
    if not run_script("step2_merge_outputs.py", "Gabung historical + forecast untuk web"):
        print("\n❌ Pipeline berhenti karena error di merge")
        return

    # =========================================================
    # STEP 3: ANALYSIS
    # =========================================================
    print_step(6, total_steps, "Step 3: Analysis → Statistics & Comparison")
    if not run_script("step3_analysis.py", "Analisis statistik, top 10, growth ranking"):
        print("\n⚠️  Analysis gagal (web_data mungkin tidak lengkap)")
        return

    # =========================================================
    # DONE
    # =========================================================
    print_header("PIPELINE SELESAI!")
    print("\n✓ Forecast, merge, dan analisis telah selesai")
    print("\n📁 Output:")
    print("  forecast_results/       — Hasil forecast mentah")
    print("  public/merged_outputs/  — Data gabungan untuk web dashboard")
    print("  public/web_data/        — Statistik & analisis untuk web")
    print("\n🌐 Web dashboard siap dijalankan:")
    print("  npm run dev")
    print("=" * 80)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Pipeline dibatalkan oleh user (Ctrl+C)")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Pipeline error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
