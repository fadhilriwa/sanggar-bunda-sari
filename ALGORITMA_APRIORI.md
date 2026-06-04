# Dokumentasi Implementasi Algoritma Apriori untuk Rekomendasi Kombinasi Kelas

## Pendahuluan

Algoritma Apriori adalah algoritma association rule mining yang digunakan untuk menemukan pola hubungan antar item dalam dataset transaksi. Pada sistem ini, algoritma Apriori digunakan untuk merekomendasikan kombinasi kelas berdasarkan pola registrasi siswa sebelumnya.

## Konsep Dasar

### 1. Frequent Itemsets
Kombinasi kelas yang sering dipilih bersama oleh siswa dalam satu transaksi registrasi.

### 2. Support
Frekuensi kemunculan kombinasi kelas dibagi dengan total transaksi.

**Rumus:**
```
Support(X) = (Jumlah transaksi yang mengandung X) / (Total transaksi)
```

### 3. Confidence
Probabilitas jika kelas A dipilih, kelas B juga dipilih.

**Rumus:**
```
Confidence(A => B) = Support(A ∪ B) / Support(A)
```

### 4. Association Rules
Aturan rekomendasi dalam bentuk: Jika siswa memilih kelas A, maka direkomendasikan kelas B.

**Format:** A => B

## Alur Kerja Algoritma Apriori

### Phase 1: Generate Frequent Itemsets

1. **Generate Frequent 1-Itemsets (L1)**
   - Hitung frekuensi setiap kelas dalam semua transaksi
   - Filter kelas dengan support >= minimum support (default: 0.2 atau 20%)

2. **Generate Candidate k-Itemsets (Ck)**
   - Dari frequent (k-1)-itemsets, generate candidate k-itemsets
   - Prinsip: Join itemsets yang memiliki (k-1) elemen pertama sama

3. **Calculate Support untuk Candidate Itemsets**
   - Hitung support untuk setiap candidate itemset
   - Filter itemsets dengan support >= minimum support

4. **Iterasi**
   - Ulangi langkah 2-3 sampai tidak ada frequent itemsets baru

### Phase 2: Generate Association Rules

1. **Generate Rules dari Frequent Itemsets**
   - Untuk setiap frequent itemset, generate semua kombinasi antecedent dan consequent
   - Antecedent: Kelas yang sudah dipilih siswa
   - Consequent: Kelas yang direkomendasikan

2. **Calculate Confidence**
   - Hitung confidence untuk setiap rule
   - Filter rules dengan confidence >= minimum confidence (default: 0.4 atau 40%)

3. **Sort Rules**
   - Urutkan rules berdasarkan confidence (tertinggi ke terendah)

### Phase 3: Generate Rekomendasi

1. **Match Selected Classes dengan Rules**
   - Cari rules yang antecedent-nya match dengan kelas yang dipilih siswa

2. **Extract Recommended Classes**
   - Ambil consequent dari rules yang match
   - Hapus kelas yang sudah dipilih siswa

3. **Display Recommendations**
   - Tampilkan rekomendasi dengan confidence tertinggi

## Implementasi dalam Sistem

### File-file yang Terlibat

1. **php/apriori.php**
   - Class `AprioriAlgorithm` yang berisi implementasi algoritma
   - Method utama:
     - `generateFrequentItemsets()`: Generate semua frequent itemsets
     - `generateAssociationRules()`: Generate association rules
     - `getRecommendations()`: Generate rekomendasi berdasarkan kelas yang dipilih

2. **php/api/recommendations.php**
   - API endpoint untuk mendapatkan rekomendasi
   - Endpoint: `POST /php/api/recommendations.php`
   - Request body:
     ```json
     {
       "selected_classes": [1, 2, 3],
       "min_support": 0.2,
       "min_confidence": 0.4
     }
     ```
   - Response:
     ```json
     {
       "success": true,
       "recommendations": [
         {
           "class_id": 4,
           "class_name": "Bahasa Inggris Kelas 1",
           "category": "Bahasa Inggris",
           "schedule": "Senin 16:30",
           "price": 200000,
           "confidence": 75.5,
           "support": 30.2,
           "rule": {
             "antecedent": [1, 2],
             "consequent": [4]
           }
         }
       ],
       "total_transactions": 50,
       "min_support": 0.2,
       "min_confidence": 0.4
     }
     ```

3. **templates/register.html**
   - Frontend untuk menampilkan rekomendasi
   - Fungsi JavaScript:
     - `loadRecommendations()`: Memanggil API rekomendasi
     - `displayRecommendations()`: Menampilkan rekomendasi di UI
     - `addRecommendedClass()`: Menambahkan kelas rekomendasi ke pilihan

## Contoh Perhitungan

### Dataset Transaksi
```
Transaksi 1: [Calistung, Matematika Kelas 1]
Transaksi 2: [Calistung, Bahasa Inggris Kelas 1]
Transaksi 3: [Matematika Kelas 1, Bahasa Inggris Kelas 1]
Transaksi 4: [Calistung, Matematika Kelas 1, Bahasa Inggris Kelas 1]
Transaksi 5: [Melukis, Calistung]
```

### Step 1: Generate Frequent 1-Itemsets

| Kelas | Count | Support |
|-------|-------|---------|
| Calistung | 4 | 0.8 (80%) |
| Matematika Kelas 1 | 3 | 0.6 (60%) |
| Bahasa Inggris Kelas 1 | 3 | 0.6 (60%) |
| Melukis | 1 | 0.2 (20%) |

**Dengan min_support = 0.2, semua kelas adalah frequent 1-itemsets.**

### Step 2: Generate Frequent 2-Itemsets

| Kombinasi | Count | Support |
|-----------|-------|---------|
| {Calistung, Matematika Kelas 1} | 2 | 0.4 (40%) |
| {Calistung, Bahasa Inggris Kelas 1} | 2 | 0.4 (40%) |
| {Matematika Kelas 1, Bahasa Inggris Kelas 1} | 2 | 0.4 (40%) |
| {Calistung, Melukis} | 1 | 0.2 (20%) |

**Dengan min_support = 0.2, semua kombinasi adalah frequent 2-itemsets.**

### Step 3: Generate Association Rules

**Rule 1:** Calistung => Matematika Kelas 1
- Support(Calistung ∪ Matematika Kelas 1) = 0.4
- Support(Calistung) = 0.8
- Confidence = 0.4 / 0.8 = 0.5 (50%)

**Rule 2:** Matematika Kelas 1 => Bahasa Inggris Kelas 1
- Support(Matematika Kelas 1 ∪ Bahasa Inggris Kelas 1) = 0.4
- Support(Matematika Kelas 1) = 0.6
- Confidence = 0.4 / 0.6 = 0.67 (67%)

**Dengan min_confidence = 0.4, semua rules valid.**

### Step 4: Generate Rekomendasi

**Jika siswa memilih: Calistung**
- Match rule: Calistung => Matematika Kelas 1 (confidence: 50%)
- Match rule: Calistung => Bahasa Inggris Kelas 1 (confidence: 50%)
- Rekomendasi:
  1. Matematika Kelas 1 (confidence: 50%)
  2. Bahasa Inggris Kelas 1 (confidence: 50%)

**Jika siswa memilih: Calistung, Matematika Kelas 1**
- Match rule: {Calistung, Matematika Kelas 1} => Bahasa Inggris Kelas 1
- Rekomendasi:
  1. Bahasa Inggris Kelas 1 (confidence: 67%)

## Parameter Algoritma

### Minimum Support (min_support)
- Default: 0.2 (20%)
- Semakin tinggi, semakin ketat filtering frequent itemsets
- Semakin rendah, semakin banyak frequent itemsets yang ditemukan

### Minimum Confidence (min_confidence)
- Default: 0.4 (40%)
- Semakin tinggi, semakin ketat filtering association rules
- Semakin rendah, semakin banyak rules yang dihasilkan

**Catatan:** Untuk dataset kecil (kurang dari 50 transaksi), disarankan menggunakan min_support = 0.2 dan min_confidence = 0.4.

## Kelebihan dan Kekurangan

### Kelebihan
1. Mudah dipahami dan diimplementasikan
2. Efektif untuk dataset kecil sampai menengah
3. Hasil dapat diinterpretasikan dengan jelas (support, confidence)
4. Tidak memerlukan preprocessing data yang kompleks

### Kekurangan
1. Computational cost tinggi untuk dataset besar
2. Perlu multiple scan database
3. Memerlukan minimum threshold yang tepat

## Penggunaan dalam Skripsi

### Bab 3: Metodologi
- Jelaskan algoritma Apriori secara detail
- Jelaskan alur kerja algoritma
- Jelaskan konsep support, confidence, dan association rules

### Bab 4: Implementasi
- Jelaskan struktur class `AprioriAlgorithm`
- Jelaskan flow data dari database sampai tampilan rekomendasi
- Tampilkan contoh kode penting

### Bab 5: Pengujian
- Uji dengan berbagai nilai min_support dan min_confidence
- Uji dengan berbagai jumlah transaksi
- Evaluasi akurasi rekomendasi
- Bandingkan hasil dengan metode lain (jika ada)

## Referensi

1. Agrawal, R., & Srikant, R. (1994). Fast algorithms for mining association rules. In *Proceedings of the 20th international conference on very large data bases* (pp. 487-499).

2. Han, J., Pei, J., & Kamber, M. (2011). *Data mining: concepts and techniques*. Morgan kaufmann.

3. Tan, P. N., Steinbach, M., & Kumar, V. (2016). *Introduction to data mining*. Pearson Education India.

