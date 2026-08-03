const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_URL = 'https://github.com/mostafaahmed97/asbab-al-nuzul-dataset.git';
const TEMP_DIR = path.join(__dirname, 'temp_asbab_repo');
const OUTPUT_FILE = path.join(__dirname, '../src/assets/data/asbab_al_nuzul.json');

async function fetchAsbab() {
  console.log('⏳ جاري استنساخ المستودع (Cloning repository)...');
  
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  try {
    execSync(`git clone --depth 1 ${REPO_URL} "${TEMP_DIR}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ خطأ أثناء الاستنساخ:', error);
    return;
  }

  console.log('✅ تم الاستنساخ. جاري استخراج البيانات...');

  const asbabData = {};
  const plaintextDir = path.join(TEMP_DIR, 'data/plaintext');

  if (!fs.existsSync(plaintextDir)) {
    console.error('❌ لم يتم العثور على مجلد data/plaintext');
    return;
  }

  const surahDirs = fs.readdirSync(plaintextDir);

  for (const surahFolder of surahDirs) {
    const surahPath = path.join(plaintextDir, surahFolder);
    if (!fs.statSync(surahPath).isDirectory()) continue;

    const surahNum = parseInt(surahFolder, 10);
    const ayahDirs = fs.readdirSync(surahPath);

    for (const ayahFolder of ayahDirs) {
      const ayahPath = path.join(surahPath, ayahFolder);
      if (!fs.statSync(ayahPath).isDirectory()) continue;

      // Handle ranges like "217-218" or "200-201-202" or single ayah "089"
      const ayahNumbers = ayahFolder.split('-').map(a => parseInt(a, 10));
      
      const files = fs.readdirSync(ayahPath).filter(f => f.endsWith('.md'));
      
      let combinedText = [];
      for (const file of files) {
        const filePath = path.join(ayahPath, file);
        const text = fs.readFileSync(filePath, 'utf-8').trim();
        // Remove markdown headings if any
        const cleanText = text.replace(/^#+ .*\n?/gm, '').trim();
        combinedText.push(cleanText);
      }

      if (combinedText.length > 0) {
        const finalContent = combinedText.join('\n\n---\n\n');
        
        // Map to each ayah in the range
        for (const aNum of ayahNumbers) {
          const key = `${surahNum}_${aNum}`;
          asbabData[key] = finalContent;
        }
      }
    }
  }

  console.log(`✅ تم استخراج ${Object.keys(asbabData).length} آية لها أسباب نزول.`);

  console.log('⏳ جاري حفظ ملف JSON النهائي...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(asbabData, null, 2), 'utf-8');
  console.log(`🎉 اكتمل العمل! تم حفظ الملف في: ${OUTPUT_FILE}`);

  // Cleanup
  console.log('🧹 تنظيف الملفات المؤقتة...');
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('✨ تمت عملية التنظيف بنجاح.');
  } catch (err) {
    console.warn('⚠️ لم نتمكن من مسح المجلد المؤقت تلقائياً. يمكنك حذفه يدوياً:', err.message);
  }
}

fetchAsbab();
