const Fontmin = require('fontmin')
const fontmin = new Fontmin()
  .src('assets/font/*.ttf')
  .dest('dest')
  .use(Fontmin.glyph({ 
    text: `
      一夕轻雷落万丝，
      霁光浮瓦碧参差。
      有情芍药含春泪，
      无力蔷薇卧晓枝。
    `,
    hinting: false // keep ttf hint info (fpgm, prep, cvt). default = true
}));

fontmin.run()