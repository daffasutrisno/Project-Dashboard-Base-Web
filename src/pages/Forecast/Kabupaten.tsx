import { useState } from "react";
import ForecastChart from "../../components/forecast/ForecastChart";
import ComparisonTable from "../../components/forecast/ComparisonTable";
import KabupatenGrowthTable from "../../components/forecast/KabupatenGrowthTable";
import PageMeta from "../../components/common/PageMeta";

// All 119 kabupaten untuk dropdown
const KABUPATEN_OPTIONS = [
  "Alor",
  "Badung",
  "Bangkalan",
  "Bangli",
  "Banjarnegara",
  "Bantul",
  "Banyumas",
  "Banyuwangi",
  "Batang",
  "Belu",
  "Bima",
  "Blitar",
  "Blora",
  "Bojonegoro",
  "Bondowoso",
  "Boyolali",
  "Brebes",
  "Buleleng",
  "Cilacap",
  "Demak",
  "Dompu",
  "Ende",
  "Flores Timur",
  "Gianyar",
  "Gresik",
  "Grobogan",
  "Gunungkidul",
  "Jember",
  "Jembrana",
  "Jepara",
  "Jombang",
  "Karanganyar",
  "Karangasem",
  "Kebumen",
  "Kediri",
  "Kendal",
  "Klaten",
  "Klungkung",
  "Kota Batu",
  "Kota Bima",
  "Kota Blitar",
  "Kota Denpasar",
  "Kota Kediri",
  "Kota Kupang",
  "Kota Madiun",
  "Kota Magelang",
  "Kota Malang",
  "Kota Mataram",
  "Kota Mojokerto",
  "Kota Pasuruan",
  "Kota Pekalongan",
  "Kota Probolinggo",
  "Kota Salatiga",
  "Kota Semarang",
  "Kota Surabaya",
  "Kota Surakarta",
  "Kota Tegal",
  "Kota Yogyakarta",
  "Kudus",
  "Kulon Progo",
  "Kupang",
  "Lamongan",
  "Lembata",
  "Lombok Barat",
  "Lombok Tengah",
  "Lombok Timur",
  "Lombok Utara",
  "Lumajang",
  "Madiun",
  "Magelang",
  "Magetan",
  "Malaka",
  "Malang",
  "Manggarai",
  "Manggarai Barat",
  "Manggarai Timur",
  "Mojokerto",
  "Nagekeo",
  "Ngada",
  "Nganjuk",
  "Ngawi",
  "Pacitan",
  "Pamekasan",
  "Pasuruan",
  "Pati",
  "Pekalongan",
  "Pemalang",
  "Ponorogo",
  "Probolinggo",
  "Purbalingga",
  "Purworejo",
  "Rembang",
  "Rote Ndao",
  "Sabu Raijua",
  "Sampang",
  "Semarang",
  "Sidoarjo",
  "Sikka",
  "Situbondo",
  "Sleman",
  "Sragen",
  "Sukoharjo",
  "Sumbawa",
  "Sumbawa Barat",
  "Sumba Barat",
  "Sumba Barat Daya",
  "Sumba Tengah",
  "Sumba Timur",
  "Sumenep",
  "Tabanan",
  "Tegal",
  "Temanggung",
  "Timor Tengah Selatan",
  "Timor Tengah Utara",
  "Trenggalek",
  "Tuban",
  "Tulungagung",
  "Wonogiri",
  "Wonosobo",
];

export default function Kabupaten() {
  const [selectedKabupaten, setSelectedKabupaten] = useState(
    KABUPATEN_OPTIONS[0],
  );

  return (
    <>
      <PageMeta
        title="Kabupaten Forecast | Monitoring"
        description="Kabupaten Forecast Result page"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Kabupaten Forecast
          </h1>
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12">
              <ForecastChart
                type="kabupaten"
                options={KABUPATEN_OPTIONS}
                selectedOption={selectedKabupaten}
                onOptionChange={setSelectedKabupaten}
              />
            </div>
            <div className="col-span-12">
              <ComparisonTable
                type="kabupaten"
                selectedOption={selectedKabupaten}
              />
            </div>
            <div className="col-span-12">
              <KabupatenGrowthTable />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
