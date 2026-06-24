"""
FETCH DATA KPI — GENERATE PPT
==============================
Program 1: Generate PowerPoint dashboard dari database KPI.
Mengambil data dari tabel cluster_5g dan membuat dashboard PPT 5G & 4G.

Database: PostgreSQL (cluster_5g)
Output: ../hasil/KPI_Monitoring_Dashboard_[timestamp].pptx
"""

import psycopg2
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from pptx import Presentation
from pptx.util import Inches, Pt
from datetime import datetime, timedelta
import numpy as np
from io import BytesIO
from scipy.interpolate import make_interp_spline
from pathlib import Path

# ============================================================
# DATABASE CONFIGURATION
# ============================================================
DB_CONFIG = {
    'host': '1.tcp.ap.ngrok.io',
    'port': 21039,
    'database': 'postgres',
    'user': 'postgres',
    'password': 'option88'
}

# Chart styling
plt.rcParams['font.size'] = 9
plt.rcParams['axes.titlesize'] = 10
plt.rcParams['axes.labelsize'] = 8
plt.rcParams['xtick.labelsize'] = 7
plt.rcParams['ytick.labelsize'] = 7
plt.rcParams['legend.fontsize'] = 7
plt.rcParams['figure.autolayout'] = False


def get_data_from_db(days_back=35):
    """Fetch data from database (default 5 weeks = 35 days)"""
    conn = psycopg2.connect(**DB_CONFIG)

    query = f"""
    SELECT *
    FROM cluster_5g 
    WHERE date_column >= (SELECT MAX(date_column)::date - INTERVAL '{days_back} days' FROM cluster_5g)
    ORDER BY date_column ASC, nc_5g
    """

    df = pd.read_sql(query, conn)
    conn.close()

    df['date_column'] = pd.to_datetime(df['date_column'])

    return df


def create_individual_chart(chart_data, chart_type='line', **kwargs):
    """Create individual chart with border as separate image"""
    fig, ax = plt.subplots(figsize=(5, 3.5))

    fig.patch.set_edgecolor('black')
    fig.patch.set_linewidth(1)

    dates = chart_data['dates']
    values = chart_data['values']
    title = chart_data['title']
    ylabel = chart_data['ylabel']

    if chart_type == 'line':
        smooth = kwargs.get('smooth', True)
        color = kwargs.get('color', '#1f77b4')
        ylim = kwargs.get('ylim', None)
        ytick_format = kwargs.get('ytick_format', None)

        if smooth and len(dates) > 3:
            dates_num = mdates.date2num(dates)
            dates_num_smooth = np.linspace(dates_num.min(), dates_num.max(), 300)
            try:
                spl = make_interp_spline(dates_num, values, k=3)
                values_smooth = spl(dates_num_smooth)
                dates_smooth = mdates.num2date(dates_num_smooth)
                ax.plot(dates_smooth, values_smooth, color=color, linewidth=2)
            except:
                ax.plot(dates, values, color=color, linewidth=2)
        else:
            ax.plot(dates, values, color=color, linewidth=2)

        if ylim:
            ax.set_ylim(ylim)

        if ytick_format:
            from matplotlib.ticker import FuncFormatter
            ax.yaxis.set_major_formatter(FuncFormatter(lambda y, _: ytick_format.format(y)))

    elif chart_type == 'area':
        color = kwargs.get('color', '#17516d')
        ax.fill_between(dates, values, alpha=0.7, color=color)
        ax.plot(dates, values, color=color, linewidth=1.5)

    elif chart_type == 'bar':
        color = kwargs.get('color', '#1f77b4')
        ax.bar(dates, values, color=color, width=0.8)

    elif chart_type == 'dual_line':
        values2 = chart_data['values2']
        label1 = chart_data['label1']
        label2 = chart_data['label2']
        color1 = kwargs.get('color1', '#1f77b4')
        color2 = kwargs.get('color2', '#ff7f0e')

        if len(dates) > 3:
            dates_num = mdates.date2num(dates)
            dates_num_smooth = np.linspace(dates_num.min(), dates_num.max(), 300)
            dates_smooth = mdates.num2date(dates_num_smooth)

            try:
                spl1 = make_interp_spline(dates_num, values, k=3)
                values_smooth1 = spl1(dates_num_smooth)
                ax.plot(dates_smooth, values_smooth1, color=color1, linewidth=2, label=label1)
            except:
                ax.plot(dates, values, color=color1, linewidth=2, label=label1)

            try:
                spl2 = make_interp_spline(dates_num, values2, k=3)
                values_smooth2 = spl2(dates_num_smooth)
                ax.plot(dates_smooth, values_smooth2, color=color2, linewidth=2, label=label2)
            except:
                ax.plot(dates, values2, color=color2, linewidth=2, label=label2)
        else:
            ax.plot(dates, values, color=color1, linewidth=2, label=label1)
            ax.plot(dates, values2, color=color2, linewidth=2, label=label2)

        ax.legend(loc='upper left', fontsize=7)

    elif chart_type == 'stacked_bar':
        values2 = chart_data['values2']
        label1 = chart_data['label1']
        label2 = chart_data['label2']
        color1 = kwargs.get('color1', '#1f77b4')
        color2 = kwargs.get('color2', '#ff7f0e')

        ax.bar(dates, values, color=color1, label=label1, width=0.8)
        ax.bar(dates, values2, bottom=values, color=color2, label=label2, width=0.8)
        ax.legend(loc='upper left', fontsize=7)

    # Common formatting
    ax.set_title(title, fontweight='bold', pad=12, fontsize=10)
    ax.set_ylabel(ylabel, fontsize=9)
    ax.grid(True, alpha=0.3, linestyle='--', linewidth=0.5)
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%d/%m'))
    ax.tick_params(axis='x', rotation=45, labelsize=6)
    ax.tick_params(axis='y', labelsize=8)

    if len(dates) > 0:
        ax.set_xlim(dates.iloc[0] if hasattr(dates, 'iloc') else dates[0],
                    dates.iloc[-1] if hasattr(dates, 'iloc') else dates[-1])
        if len(dates) > 10:
            ax.set_xticks(dates[::2])
        else:
            ax.set_xticks(dates)

    for label in ax.get_xticklabels():
        label.set_horizontalalignment('right')

    for spine in ax.spines.values():
        spine.set_edgecolor('black')
        spine.set_linewidth(0.5)

    plt.tight_layout()

    img_stream = BytesIO()
    plt.savefig(img_stream, format='png', dpi=150, bbox_inches='tight', facecolor='white')
    img_stream.seek(0)
    plt.close()

    return img_stream


def generate_5g_charts(df):
    """Generate all 5G charts as individual images"""
    daily_data = df.groupby('date_column').agg({
        'avail_auto_5g': 'max',
        'da_5g': 'max',
        'g5_cdr': 'max',
        'sgnb_addition_sr': 'max',
        'traffic_5g': 'sum',
        'g5_userdl_thp': 'max',
        'sum_en_dc_user_5g_wd': 'max',
        'g5_dlprb_util': 'max',
        'inter_esgnb': 'max',
        'intra_esgnb': 'max',
        'inter_sgnb_intrafreq': 'max',
        'intra_sgnb_intrafreq': 'max'
    }).reset_index()

    dates = daily_data['date_column'][::2]
    data_display = daily_data.iloc[::2]
    charts = {}

    # Chart 1: Availability
    avail_data = daily_data.copy()
    avail_data.loc[avail_data['avail_auto_5g'] <= 0, 'avail_auto_5g'] = np.nan
    avail_data['avail_auto_5g'] = avail_data['avail_auto_5g'].interpolate(method='linear')
    avail_data['avail_auto_5g'] = avail_data['avail_auto_5g'].fillna(method='ffill').fillna(method='bfill')

    fig, ax = plt.subplots(figsize=(5, 3.5))
    fig.patch.set_edgecolor('black')
    fig.patch.set_linewidth(1)

    dates_chart = avail_data['date_column']
    values_chart = avail_data['avail_auto_5g'] * 100

    if len(dates_chart) > 3:
        dates_num = mdates.date2num(dates_chart)
        dates_num_smooth = np.linspace(dates_num.min(), dates_num.max(), 300)
        try:
            spl = make_interp_spline(dates_num, values_chart, k=3)
            values_smooth = spl(dates_num_smooth)
            dates_smooth = mdates.num2date(dates_num_smooth)
            ax.plot(dates_smooth, values_smooth, color='#1f77b4', linewidth=2)
        except:
            ax.plot(dates_chart, values_chart, color='#1f77b4', linewidth=2)
    else:
        ax.plot(dates_chart, values_chart, color='#1f77b4', linewidth=2)

    ax.set_ylim(99.00, 100.20)
    yticks = np.arange(99.00, 100.21, 0.20)
    ax.set_yticks(yticks)
    yticklabels = [f'{y:.2f}%' if abs(y - 100.20) > 0.01 else '' for y in yticks]
    ax.set_yticklabels(yticklabels)

    ax.set_title('Availability', fontweight='bold', pad=12, fontsize=10)
    ax.set_ylabel('%', fontsize=9)
    ax.grid(True, alpha=0.3, linestyle='--', linewidth=0.5)
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%d/%m'))
    ax.tick_params(axis='x', rotation=45, labelsize=6)
    ax.tick_params(axis='y', labelsize=8)

    ax.set_xlim(dates_chart.iloc[0], dates_chart.iloc[-1])
    if len(dates_chart) > 10:
        ax.set_xticks(dates_chart[::2])
    else:
        ax.set_xticks(dates_chart)

    for label in ax.get_xticklabels():
        label.set_horizontalalignment('right')

    for spine in ax.spines.values():
        spine.set_edgecolor('black')
        spine.set_linewidth(0.5)

    plt.tight_layout()

    img_stream = BytesIO()
    plt.savefig(img_stream, format='png', dpi=150, bbox_inches='tight', facecolor='white')
    img_stream.seek(0)
    plt.close()
    charts['availability'] = img_stream

    # Chart 2-12: remaining 5G charts
    charts['accessibility'] = create_individual_chart({
        'dates': dates, 'values': data_display['da_5g'] * 100,
        'title': 'Accessibility', 'ylabel': '%'
    }, chart_type='line', smooth=True, ylim=(96, 101), ytick_format='{:.2f}%')

    charts['cdr'] = create_individual_chart({
        'dates': dates, 'values': data_display['g5_cdr'] * 100,
        'title': 'Call Drop Rate', 'ylabel': '%'
    }, chart_type='line', smooth=True, ylim=(-0.002, 0.020), ytick_format='{:.3f}%')

    charts['sgnb_sr'] = create_individual_chart({
        'dates': dates, 'values': data_display['sgnb_addition_sr'] * 100,
        'title': 'Sgnb addition SR', 'ylabel': '%'
    }, chart_type='line', smooth=True, ylim=(98, 100.5), ytick_format='{:.2f}%')

    charts['traffic'] = create_individual_chart({
        'dates': dates, 'values': data_display['traffic_5g'],
        'title': 'Total Traffic (GB)', 'ylabel': 'GB'
    }, chart_type='area', color='#17516d')

    charts['eut_thp'] = create_individual_chart({
        'dates': daily_data['date_column'],
        'values': daily_data['traffic_5g'] / 1000,
        'values2': daily_data['g5_userdl_thp'],
        'label1': 'traffic_5g', 'label2': 'dl_user_thp_5g',
        'title': 'EUT vs DL User Thp', 'ylabel': 'Value'
    }, chart_type='dual_line', color1='#1f77b4', color2='#ff7f0e')

    charts['user_5g'] = create_individual_chart({
        'dates': dates, 'values': data_display['sum_en_dc_user_5g_wd'],
        'title': 'User 5G', 'ylabel': 'Users'
    }, chart_type='bar', color='#1f77b4')

    charts['prb_util'] = create_individual_chart({
        'dates': dates, 'values': data_display['g5_dlprb_util'] * 100,
        'title': 'DL PRB Util', 'ylabel': '%'
    }, chart_type='line', smooth=True, ytick_format='{:.2f}%')

    charts['inter_esgnb'] = create_individual_chart({
        'dates': dates, 'values': data_display['inter_esgnb'] * 100,
        'title': 'inter_esgnb_pscell_change', 'ylabel': '%'
    }, chart_type='line', smooth=True, ylim=(0, 120), ytick_format='{:.2f}%')

    charts['intra_esgnb'] = create_individual_chart({
        'dates': dates, 'values': data_display['intra_esgnb'] * 100,
        'title': 'intra_esgnb_pscell_change', 'ylabel': '%'
    }, chart_type='line', smooth=True, ylim=(99.80, 100.00), ytick_format='{:.2f}%')

    charts['intra_sgnb'] = create_individual_chart({
        'dates': dates, 'values': data_display['intra_sgnb_intrafreq'] * 100,
        'title': 'intra_sgnb_intrafreq_pscell_change', 'ylabel': '%'
    }, chart_type='line', smooth=True, ylim=(99.80, 100.00), ytick_format='{:.2f}%')

    charts['inter_sgnb'] = create_individual_chart({
        'dates': dates, 'values': data_display['inter_sgnb_intrafreq'] * 100,
        'title': 'inter_sgnb_intrafreq_pscell_change', 'ylabel': '%'
    }, chart_type='line', smooth=True, ylim=(99.0, 100.1), ytick_format='{:.2f}%')

    return charts


def generate_4g_charts(df):
    """Generate all 4G charts as individual images"""
    daily_data = df.groupby('date_column').agg({
        'g4_avail_auto': 'max',
        's1_failure': 'max',
        'rrc_ue': 'max',
        'traffic_4g': 'sum',
        'eut_4g_bh': 'max',
        'dl_prb_util': 'max',
        'cqi_bh': 'max',
        'traffic_3id': 'sum',
        'traffic_im3': 'sum',
        'user_3id': 'sum',
        'user_im3': 'sum',
        'dl_user_thp_bhv': 'max'
    }).reset_index()

    dates = daily_data['date_column']
    charts = {}

    # Chart 1: Availability
    avail_data = daily_data.copy()
    avail_data.loc[avail_data['g4_avail_auto'] < 0.99, 'g4_avail_auto'] = np.nan
    avail_data['g4_avail_auto'] = avail_data['g4_avail_auto'].interpolate(method='linear')
    avail_data['g4_avail_auto'] = avail_data['g4_avail_auto'].fillna(method='ffill').fillna(method='bfill')
    avail_display = avail_data.iloc[::2]

    fig, ax = plt.subplots(figsize=(5, 3.5))
    fig.patch.set_edgecolor('black')
    fig.patch.set_linewidth(1)

    dates_chart = avail_display['date_column']
    values_chart = avail_display['g4_avail_auto'] * 100

    if len(dates_chart) > 3:
        dates_num = mdates.date2num(dates_chart)
        dates_num_smooth = np.linspace(dates_num.min(), dates_num.max(), 300)
        try:
            spl = make_interp_spline(dates_num, values_chart, k=3)
            values_smooth = spl(dates_num_smooth)
            dates_smooth = mdates.num2date(dates_num_smooth)
            ax.plot(dates_smooth, values_smooth, color='#1f77b4', linewidth=2)
        except:
            ax.plot(dates_chart, values_chart, color='#1f77b4', linewidth=2)
    else:
        ax.plot(dates_chart, values_chart, color='#1f77b4', linewidth=2)

    ax.set_ylim(99.00, 100.20)
    yticks = np.arange(99.00, 100.21, 0.20)
    ax.set_yticks(yticks)
    yticklabels = [f'{y:.2f}%' if abs(y - 100.20) > 0.01 else '' for y in yticks]
    ax.set_yticklabels(yticklabels)

    ax.set_title('Availability', fontweight='bold', pad=12, fontsize=10)
    ax.set_ylabel('%', fontsize=9)
    ax.grid(True, alpha=0.3, linestyle='--', linewidth=0.5)
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%d/%m'))
    ax.tick_params(axis='x', rotation=45, labelsize=6)
    ax.tick_params(axis='y', labelsize=8)

    ax.set_xlim(dates_chart.iloc[0], dates_chart.iloc[-1])
    if len(dates_chart) > 10:
        ax.set_xticks(dates_chart[::2])
    else:
        ax.set_xticks(dates_chart)

    for label in ax.get_xticklabels():
        label.set_horizontalalignment('right')

    for spine in ax.spines.values():
        spine.set_edgecolor('black')
        spine.set_linewidth(0.5)

    plt.tight_layout()

    img_stream = BytesIO()
    plt.savefig(img_stream, format='png', dpi=150, bbox_inches='tight', facecolor='white')
    img_stream.seek(0)
    plt.close()
    charts['availability'] = img_stream

    # Chart 2-12
    charts['s1sr'] = create_individual_chart({
        'dates': dates, 'values': (1 - daily_data['s1_failure']) * 100,
        'title': 'S1SR', 'ylabel': '%'
    }, chart_type='line', smooth=True)

    charts['rrc_user'] = create_individual_chart({
        'dates': dates, 'values': daily_data['rrc_ue'],
        'title': 'RRC Conn User', 'ylabel': 'Users'
    }, chart_type='line', smooth=True)

    charts['traffic'] = create_individual_chart({
        'dates': dates, 'values': daily_data['traffic_4g'],
        'title': 'Traffic 4G (GB)', 'ylabel': 'GB'
    }, chart_type='area', color='#17516d')

    charts['eut'] = create_individual_chart({
        'dates': dates, 'values': daily_data['eut_4g_bh'],
        'title': 'EUT', 'ylabel': 'Mbps'
    }, chart_type='line', smooth=True, color='#ff7f0e')

    charts['prb_util'] = create_individual_chart({
        'dates': dates, 'values': daily_data['dl_prb_util'] * 100,
        'title': 'DL PRB Util', 'ylabel': '%'
    }, chart_type='bar', color='#1f77b4')

    charts['cqi'] = create_individual_chart({
        'dates': dates, 'values': daily_data['cqi_bh'],
        'title': 'CQI', 'ylabel': 'CQI'
    }, chart_type='line', smooth=True, color='#ff7f0e')

    charts['qpsk'] = create_individual_chart({
        'dates': dates, 'values': daily_data['dl_user_thp_bhv'],
        'title': 'QPSK', 'ylabel': 'Mbps'
    }, chart_type='line', smooth=True)

    charts['traffic_split'] = create_individual_chart({
        'dates': dates,
        'values': daily_data['traffic_3id'], 'values2': daily_data['traffic_im3'],
        'label1': 'traffic_3id', 'label2': 'traffic_im3',
        'title': 'Traffic 4G - 5G', 'ylabel': 'GB'
    }, chart_type='stacked_bar', color1='#1f77b4', color2='#ff7f0e')

    total_traffic = daily_data['traffic_3id'] + daily_data['traffic_im3']
    ratio_3id = (daily_data['traffic_3id'] / total_traffic * 100).fillna(0)
    ratio_im3 = (daily_data['traffic_im3'] / total_traffic * 100).fillna(0)
    charts['ratio_traffic'] = create_individual_chart({
        'dates': dates,
        'values': ratio_3id, 'values2': ratio_im3,
        'label1': '3ID', 'label2': 'IM3',
        'title': 'Ratio traffic 4G - 5G', 'ylabel': '%'
    }, chart_type='stacked_bar', color1='#1f77b4', color2='#ff7f0e')

    charts['user_split'] = create_individual_chart({
        'dates': dates,
        'values': daily_data['user_3id'], 'values2': daily_data['user_im3'],
        'label1': 'user_3id', 'label2': 'user_im3',
        'title': 'RRC Conn 4G - 5G', 'ylabel': 'Users'
    }, chart_type='stacked_bar', color1='#1f77b4', color2='#ff7f0e')

    total_users = daily_data['user_3id'] + daily_data['user_im3']
    ratio_user_3id = (daily_data['user_3id'] / total_users * 100).fillna(0)
    ratio_user_im3 = (daily_data['user_im3'] / total_users * 100).fillna(0)
    charts['ratio_user'] = create_individual_chart({
        'dates': dates,
        'values': ratio_user_3id, 'values2': ratio_user_im3,
        'label1': 'user_3ID', 'label2': 'user_IM3',
        'title': 'RRC Conn 4G - 5G', 'ylabel': '%'
    }, chart_type='stacked_bar', color1='#1f77b4', color2='#ff7f0e')

    return charts


def create_presentation():
    """Create PowerPoint presentation with individual chart images"""
    print("Fetching data from database...")
    df = get_data_from_db(days_back=35)

    print(f"Data fetched: {len(df)} records")
    print(f"Date range: {df['date_column'].min()} to {df['date_column'].max()}")

    print("\nGenerating 5G charts...")
    charts_5g = generate_5g_charts(df)

    print("Generating 4G charts...")
    charts_4g = generate_4g_charts(df)

    print("\nCreating PowerPoint presentation...")
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)

    # Slide 1: 5G Dashboard
    slide_5g = prs.slides.add_slide(prs.slide_layouts[6])

    title_box = slide_5g.shapes.add_textbox(Inches(0.5), Inches(0.2), Inches(9), Inches(0.5))
    title_frame = title_box.text_frame
    title_frame.text = 'KPI MONITORING 5G EAST JAVA'
    title_frame.paragraphs[0].font.size = Pt(18)
    title_frame.paragraphs[0].font.bold = True

    chart_width = Inches(2.3)
    chart_height = Inches(2.0)
    start_left = Inches(0.3)
    start_top = Inches(1.0)
    h_spacing = Inches(2.4)
    v_spacing = Inches(2.1)

    chart_list_5g = ['availability', 'accessibility', 'cdr', 'sgnb_sr',
                     'traffic', 'eut_thp', 'user_5g', 'prb_util',
                     'inter_esgnb', 'intra_esgnb', 'intra_sgnb', 'inter_sgnb']

    for idx, chart_name in enumerate(chart_list_5g):
        if chart_name in charts_5g:
            row = idx // 4
            col = idx % 4
            left = start_left + (col * h_spacing)
            top = start_top + (row * v_spacing)
            slide_5g.shapes.add_picture(charts_5g[chart_name], left, top,
                                       width=chart_width, height=chart_height)

    # Slide 2: 4G Dashboard
    slide_4g = prs.slides.add_slide(prs.slide_layouts[6])

    title_box_4g = slide_4g.shapes.add_textbox(Inches(0.5), Inches(0.2), Inches(9), Inches(0.5))
    title_frame_4g = title_box_4g.text_frame
    title_frame_4g.text = 'KPI MONITORING 4G EAST JAVA'
    title_frame_4g.paragraphs[0].font.size = Pt(18)
    title_frame_4g.paragraphs[0].font.bold = True

    chart_list_4g = ['availability', 's1sr', 'rrc_user', 'traffic',
                     'eut', 'prb_util', 'cqi', 'qpsk',
                     'traffic_split', 'ratio_traffic', 'user_split', 'ratio_user']

    for idx, chart_name in enumerate(chart_list_4g):
        if chart_name in charts_4g:
            row = idx // 4
            col = idx % 4
            left = start_left + (col * h_spacing)
            top = start_top + (row * v_spacing)
            slide_4g.shapes.add_picture(charts_4g[chart_name], left, top,
                                       width=chart_width, height=chart_height)

    # Save presentation
    output_dir = Path("hasil")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f'KPI_Monitoring_Dashboard_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pptx'
    prs.save(str(output_file))

    print(f"\n✓ Presentation saved as: {output_file}")
    return output_file


if __name__ == "__main__":
    try:
        create_presentation()
        print("\n✓ Dashboard generated successfully!")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
