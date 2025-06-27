const fs = require('fs');
const path = require('path');

const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

const files = [
  'src/utils/testSupabase.ts',
  'src/utils/performance.ts', 
  'src/lib/cache.ts',
  'src/integrations/supabase/client.ts',
  'src/hooks/useInitialSetup.ts',
  'src/hooks/useImageUpload.ts',
  'src/hooks/use-toast.ts',
  'src/config/env.ts'
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Substituir emojis específicos
    content = content
      .replace(/🗑️/g, '[DELETE]')
      .replace(/🔍/g, '[SEARCH]')
      .replace(/❌/g, '[ERROR]')
      .replace(/✅/g, '[SUCCESS]')
      .replace(/💥/g, '[CRASH]')
      .replace(/🔄/g, '[LOADING]')
      .replace(/📊/g, '[DATA]')
      .replace(/⚠️/g, '[WARNING]')
      .replace(/ℹ️/g, '[INFO]')
      .replace(/🗄️/g, '[CACHE]')
      .replace(/⏱️/g, '[TIME]')
      .replace(/🔍/g, '[VALIDATE]')
      .replace(/🚀/g, '[ROCKET]');
    
    // Remover qualquer emoji restante
    content = content.replace(emojiPattern, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed encoding for: ${filePath}`);
  }
});

console.log('All files fixed!'); 