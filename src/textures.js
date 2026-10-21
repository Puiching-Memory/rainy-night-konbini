import {
  canvasTexture,
  fillRound,
  strokeRound,
  starPath,
  coverText,
  JP,
  EN,
  MONO,
  rng,
  asphaltTex,
  pavingTex,
  tactileTex,
  interiorFloorTex,
  glassDropsTex,
} from './utils.js';

export { asphaltTex, pavingTex, tactileTex, interiorFloorTex, glassDropsTex };

/* ------------------------------------------------------------------ *
 *  Store brand & fascia signs
 * ------------------------------------------------------------------ */
function drawBrandMark(ctx, x, y, r, fg = '#f8f1df', bg = '#147873') {
  ctx.save();
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fg;
  starPath(ctx, x, y + r * 0.03, r * 0.52, r * 0.22, 5, -Math.PI / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.28)';
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.78, 0.38, 2.55);
  ctx.stroke();
  ctx.restore();
}

function drawStripes(ctx, x, y, w, h) {
  const cols = ['#13827a', '#f1a24e', '#d9687b'];
  const each = w / 3;
  cols.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(x + i * each, y, each + 1, h);
  });
}

export const fasciaFrontTex = canvasTexture(2048, 300, (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#fbf5e7');
  bg.addColorStop(0.55, '#f4eddc');
  bg.addColorStop(1, '#e8e0ca');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  // inner hairline
  ctx.strokeStyle = 'rgba(18,83,79,.28)';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 8, w - 20, h - 16);
  drawBrandMark(ctx, 142, 130, 78);
  ctx.save();
  ctx.shadowColor = 'rgba(13,91,86,.28)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#125e5b';
  ctx.font = `900 129px ${EN}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '4px';
  ctx.fillText('HOSHIMART', 245, 119);
  ctx.restore();
  ctx.fillStyle = '#176e69';
  ctx.font = `700 52px ${JP}`;
  ctx.textAlign = 'left';
  ctx.letterSpacing = '6px';
  ctx.fillText('星 見 マ ー ト', 252, 205);
  ctx.letterSpacing = '0px';
  // open 24h badge
  fillRound(ctx, 1620, 50, 310, 154, 24, '#167a74');
  coverText(ctx, '24', 1688, 124, 100, 104, '#fff8e8', EN, '900');
  coverText(ctx, 'HOURS', 1688, 190, 140, 32, '#eadcae', EN, '700');
  coverText(ctx, 'OPEN', 1812, 116, 150, 49, '#fff8e8', EN, '900');
  coverText(ctx, '毎日 24時間営業', 1812, 174, 220, 26, '#e8dfc9', JP, '600');
  // right small dot pattern
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 ? '#efa14d' : '#13827a';
    ctx.beginPath();
    ctx.arc(1548 + i * 14, 82, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  drawStripes(ctx, 0, h - 23, w, 23);
}, { key: 'fascia-front' });

export const fasciaSideTex = canvasTexture(1024, 300, (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, w, 0);
  bg.addColorStop(0, '#e4cdb9');
  bg.addColorStop(0.3, '#f8f0dc');
  bg.addColorStop(1, '#f0e7d2');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(18,83,79,.3)';
  ctx.lineWidth = 4;
  ctx.strokeRect(9, 8, w - 18, h - 16);
  drawBrandMark(ctx, 105, 128, 64);
  ctx.fillStyle = '#145f5c';
  ctx.font = `900 95px ${EN}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '2px';
  ctx.fillText('HOSHIMART', 185, 111);
  ctx.font = `700 43px ${JP}`;
  ctx.letterSpacing = '4px';
  ctx.fillStyle = '#1a6863';
  ctx.fillText('星見マート', 189, 191);
  ctx.letterSpacing = '0px';
  fillRound(ctx, 785, 46, 185, 148, 22, '#167a74');
  coverText(ctx, '24H', 877, 105, 145, 65, '#fff8e8', EN, '900');
  coverText(ctx, 'OPEN', 877, 163, 125, 29, '#eedca7', EN, '700');
  drawStripes(ctx, 0, h - 23, w, 23);
}, { key: 'fascia-side' });

export const fasciaCornerTex = canvasTexture(640, 300, (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#fff8e7');
  bg.addColorStop(1, '#eadfc3');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(18,83,79,.3)';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, w - 16, h - 16);
  drawBrandMark(ctx, 90, 137, 59);
  ctx.fillStyle = '#135f5b';
  ctx.font = `900 76px ${EN}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('HOSHI', 168, 112);
  ctx.font = `700 37px ${JP}`;
  ctx.fillStyle = '#1b716b';
  ctx.fillText('星見マート', 170, 183);
  ctx.fillStyle = '#e99946';
  ctx.font = `900 74px ${EN}`;
  ctx.textAlign = 'right';
  ctx.fillText('24H', 604, 130);
  ctx.font = `700 25px ${EN}`;
  ctx.fillStyle = '#1a7770';
  ctx.fillText('OPEN', 603, 190);
  drawStripes(ctx, 0, h - 22, w, 22);
}, { key: 'fascia-corner' });

export const cornerSignTex = canvasTexture(512, 1024, (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#fff9eb');
  bg.addColorStop(0.7, '#f7eeda');
  bg.addColorStop(1, '#e8dcc0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#137971';
  ctx.fillRect(0, 0, w, 104);
  drawBrandMark(ctx, 78, 54, 51, '#fff6df', '#0f635e');
  coverText(ctx, 'HOSHIMART', 286, 55, 320, 44, '#fff8e8', EN, '900');
  // vertical rail
  ctx.fillStyle = '#e89b48';
  ctx.fillRect(0, 104, 15, h - 217);
  ctx.fillStyle = '#d66a7c';
  ctx.fillRect(15, 104, 8, h - 217);
  // star art
  ctx.save();
  ctx.translate(w / 2, 280);
  ctx.strokeStyle = 'rgba(20,124,115,.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 143, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#137a72';
  starPath(ctx, 0, 0, 112, 41, 5, -Math.PI / 2);
  ctx.fill();
  ctx.fillStyle = '#f7eddc';
  starPath(ctx, 0, 3, 74, 26, 5, -Math.PI / 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#145f5b';
  ctx.font = `900 188px ${EN}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('24H', w / 2, 500);
  ctx.fillStyle = '#e38f3d';
  ctx.font = `900 103px ${EN}`;
  ctx.fillText('OPEN', w / 2, 638);
  coverText(ctx, '毎日 24時間', w / 2, 715, 340, 39, '#1b6b66', JP, '700');
  coverText(ctx, '星見マート', w / 2, 786, 340, 58, '#145f5b', JP, '800');
  coverText(ctx, 'HOSHIMART', w / 2, 843, 320, 29, '#b07742', EN, '700');
  ctx.strokeStyle = 'rgba(18,83,79,.24)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 888);
  ctx.lineTo(w - 80, 888);
  ctx.stroke();
  coverText(ctx, 'ATM / COPY / MULTI', w / 2, 925, 360, 25, '#577c75', EN, '600');
  drawStripes(ctx, 0, h - 42, w, 42);
  // edge hairlines
  ctx.strokeStyle = 'rgba(18,83,79,.3)';
  ctx.lineWidth = 5;
  ctx.strokeRect(8, 8, w - 16, h - 16);
}, { key: 'corner-sign' });

export const cornerSignBackTex = canvasTexture(512, 1024, (ctx, w, h) => {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#f6efdf');
  grad.addColorStop(1, '#ddcfb5');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#147870';
  ctx.fillRect(0, 0, w, h * 0.48);
  ctx.strokeStyle = '#f4e5c8';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.24, 120, 0, Math.PI * 2);
  ctx.stroke();
  starPath(ctx, w / 2, h * 0.24, 102, 42, 5, -Math.PI / 2);
  ctx.fillStyle = '#f7ead0';
  ctx.fill();
  ctx.fillStyle = '#fdf5e4';
  ctx.font = `900 76px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('星見マート', w / 2, h * 0.6);
  ctx.font = `700 29px ${EN}`;
  ctx.fillStyle = '#3e706b';
  ctx.fillText('HOSHIMART  /  THANK YOU', w / 2, h * 0.65);
  drawStripes(ctx, 0, h - 32, w, 32);
}, { key: 'corner-sign-back' });

export const storeHoursTex = canvasTexture(512, 128, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  fillRound(ctx, 3, 3, w - 6, h - 6, 20, 'rgba(248,241,226,.94)');
  strokeRound(ctx, 3, 3, w - 6, h - 6, 20, 'rgba(23,112,105,.75)', 4);
  drawBrandMark(ctx, 63, 64, 38);
  ctx.fillStyle = '#145e5a';
  ctx.font = `800 38px ${JP}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('24時間営業', 116, 48);
  ctx.font = `600 24px ${JP}`;
  ctx.fillStyle = '#5b7b74';
  ctx.fillText('OPEN 24 HOURS / 7 DAYS', 116, 88);
}, { key: 'store-hours' });

export const doorDecalTex = canvasTexture(512, 128, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(247,242,229,.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(18, 109);
  ctx.lineTo(w - 18, 109);
  ctx.stroke();
  ctx.fillStyle = 'rgba(246,242,229,.9)';
  ctx.font = `700 36px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('自動ドア', w / 2, 55);
  ctx.font = `500 21px ${EN}`;
  ctx.letterSpacing = '5px';
  ctx.fillText('AUTOMATIC DOOR', w / 2, 88);
}, { key: 'door-decal' });

export const entranceMatTex = canvasTexture(1024, 512, (ctx, w, h) => {
  ctx.fillStyle = '#223d3d';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(210,222,209,.22)';
  ctx.lineWidth = 11;
  ctx.strokeRect(22, 22, w - 44, h - 44);
  ctx.strokeStyle = 'rgba(210,222,209,.11)';
  ctx.lineWidth = 3;
  ctx.strokeRect(42, 42, w - 84, h - 84);
  drawBrandMark(ctx, 154, 239, 78, '#eadfc8', '#1c5c59');
  ctx.fillStyle = 'rgba(240,233,214,.85)';
  ctx.font = `800 74px ${EN}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('HOSHIMART', 283, 225);
  ctx.font = `700 43px ${JP}`;
  ctx.fillStyle = 'rgba(230,187,125,.94)';
  ctx.fillText('いらっしゃいませ', 289, 303);
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  for (let y = 0; y < h; y += 12) ctx.fillRect(0, y, w, 3);
}, { key: 'entrance-mat' });

/* ------------------------------------------------------------------ *
 *  Window posters
 * ------------------------------------------------------------------ */
function posterBase(ctx, w, h, a, b, border = '#f7efdd') {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = border;
  ctx.lineWidth = 18;
  ctx.strokeRect(9, 9, w - 18, h - 18);
  ctx.strokeStyle = 'rgba(24,58,57,.2)';
  ctx.lineWidth = 3;
  ctx.strokeRect(29, 29, w - 58, h - 58);
}

export const posterOnigiriTex = canvasTexture(620, 840, (ctx, w, h) => {
  posterBase(ctx, w, h, '#fbf4df', '#f0dfba');
  ctx.fillStyle = '#147970';
  ctx.fillRect(28, 28, w - 56, 118);
  coverText(ctx, '新発売', 68, 88, 190, 64, '#fff6e4', JP, '800', 'left');
  coverText(ctx, 'NEW ITEM', w - 64, 89, 240, 30, '#f6d9a0', EN, '600', 'right');
  // onigiri illustration
  ctx.save();
  ctx.translate(w / 2, 389);
  ctx.shadowColor = 'rgba(103,75,40,.22)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 15;
  ctx.beginPath();
  ctx.moveTo(0, -160);
  ctx.quadraticCurveTo(28, -160, 45, -123);
  ctx.lineTo(148, 101);
  ctx.quadraticCurveTo(166, 144, 118, 154);
  ctx.lineTo(-118, 154);
  ctx.quadraticCurveTo(-166, 144, -148, 101);
  ctx.lineTo(-45, -123);
  ctx.quadraticCurveTo(-28, -160, 0, -160);
  ctx.closePath();
  ctx.fillStyle = '#fffdf4';
  ctx.fill();
  ctx.strokeStyle = '#bcae91';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  // nori
  ctx.fillStyle = '#163b33';
  ctx.beginPath();
  ctx.moveTo(-92, 38);
  ctx.lineTo(92, 38);
  ctx.lineTo(109, 150);
  ctx.lineTo(-109, 150);
  ctx.closePath();
  ctx.fill();
  // glossy highlight
  const gl = ctx.createLinearGradient(-110, -140, 110, 130);
  gl.addColorStop(0, 'rgba(255,255,255,.5)');
  gl.addColorStop(.4, 'rgba(255,255,255,0)');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.moveTo(-15, -143);
  ctx.quadraticCurveTo(48, -96, 90, 15);
  ctx.quadraticCurveTo(24, -32, -15, -143);
  ctx.fill();
  // sesame
  ctx.fillStyle = '#d9b77e';
  for (let i = 0; i < 20; i++) {
    const a = rng() * Math.PI * 2;
    const rr = 40 + rng() * 92;
    ctx.save();
    ctx.translate(Math.cos(a) * rr, Math.sin(a) * rr * 0.8 - 20);
    ctx.rotate(rng() * Math.PI);
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // label
  fillRound(ctx, -100, 78, 200, 55, 16, '#d9635c');
  coverText(ctx, '鮭いくら', 0, 106, 170, 30, '#fff7e9', JP, '700');
  ctx.restore();
  ctx.fillStyle = '#174c48';
  ctx.font = `900 70px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('おにぎり', w / 2, 620);
  ctx.fillStyle = '#e0744f';
  ctx.font = `900 83px ${EN}`;
  ctx.fillText('¥100', w / 2, 716);
  ctx.font = `700 30px ${JP}`;
  ctx.fillStyle = '#5f756b';
  ctx.fillText('税込 / 全8種類', w / 2, 768);
  drawStripes(ctx, 30, h - 60, w - 60, 18);
}, { key: 'poster-onigiri' });

export const posterCoffeeTex = canvasTexture(620, 840, (ctx, w, h) => {
  posterBase(ctx, w, h, '#3a251d', '#18110f', '#ecd8bd');
  const halo = ctx.createRadialGradient(w * 0.52, h * 0.4, 20, w * 0.52, h * 0.4, 320);
  halo.addColorStop(0, 'rgba(245,190,111,.32)');
  halo.addColorStop(1, 'rgba(245,190,111,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#f2bc75';
  ctx.font = `900 58px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('あったか〜い', w / 2, 118);
  coverText(ctx, 'HOT COFFEE', w / 2, 175, 480, 35, '#e5d3b9', EN, '700');
  // cup
  ctx.save();
  ctx.translate(w / 2, 407);
  ctx.fillStyle = '#f8eee0';
  ctx.beginPath();
  ctx.moveTo(-113, -89);
  ctx.lineTo(113, -89);
  ctx.lineTo(83, 124);
  ctx.quadraticCurveTo(0, 159, -83, 124);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#df634d';
  ctx.fillRect(-112, -33, 224, 45);
  ctx.fillStyle = '#f8eee0';
  coverText(ctx, 'HOSHI', 0, -10, 162, 25, '#f8eee0', EN, '900');
  ctx.fillStyle = '#b97b4b';
  ctx.beginPath();
  ctx.ellipse(0, -89, 113, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4b2d1d';
  ctx.beginPath();
  ctx.ellipse(0, -86, 98, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(244,233,216,.55)';
  ctx.lineWidth = 6;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 38, -138);
    ctx.bezierCurveTo(i * 38 - 25, -185, i * 38 + 30, -209, i * 38 + 4, -260);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = '#f2bb74';
  ctx.font = `900 97px ${EN}`;
  ctx.fillText('¥150', w / 2, 658);
  ctx.fillStyle = '#eadcc7';
  ctx.font = `700 30px ${JP}`;
  ctx.fillText('ホットコーヒー / カフェラテ', w / 2, 719);
  ctx.fillStyle = '#dbb98f';
  ctx.font = `600 25px ${EN}`;
  ctx.letterSpacing = '4px';
  ctx.fillText('FRESHLY BREWED', w / 2, 766);
  drawStripes(ctx, 30, h - 58, w - 60, 17);
}, { key: 'poster-coffee' });

export const posterChickenTex = canvasTexture(620, 840, (ctx, w, h) => {
  posterBase(ctx, w, h, '#f3dfb6', '#e6b86f', '#fff4df');
  ctx.fillStyle = '#ca563f';
  ctx.fillRect(28, 28, w - 56, 128);
  coverText(ctx, '揚げたて', 64, 89, 250, 63, '#fff7e5', JP, '900', 'left');
  coverText(ctx, 'HOT SNACK', w - 64, 91, 220, 31, '#ffddaa', EN, '700', 'right');
  ctx.save();
  ctx.translate(w / 2, 340);
  for (let i = 0; i < 9; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rr = i === 0 ? 0 : 90 + (i % 3) * 25;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr * 0.55;
    const size = 44 + (i % 3) * 12;
    ctx.save();
    ctx.translate(x, y);
    const g = ctx.createRadialGradient(-size * .25, -size * .3, 2, 0, 0, size);
    g.addColorStop(0, '#ffe3a0');
    g.addColorStop(.6, '#e6a54a');
    g.addColorStop(1, '#b8662f');
    ctx.fillStyle = g;
    ctx.beginPath();
    const pts = 10;
    for (let p = 0; p < pts; p++) {
      const pa = (p / pts) * Math.PI * 2;
      const pr = size * (0.72 + ((p * 7 + i) % 5) * 0.06);
      const px = Math.cos(pa) * pr;
      const py = Math.sin(pa) * pr * 0.82;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  // steam
  ctx.strokeStyle = 'rgba(255,255,255,.35)';
  ctx.lineWidth = 7;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * 52, 185);
    ctx.bezierCurveTo(w / 2 + i * 52 - 27, 155, w / 2 + i * 52 + 25, 131, w / 2 + i * 52 + 2, 104);
    ctx.stroke();
  }
  ctx.fillStyle = '#6f3826';
  ctx.font = `900 80px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('からあげ', w / 2, 618);
  ctx.fillStyle = '#b84832';
  ctx.font = `900 81px ${EN}`;
  ctx.fillText('¥180', w / 2, 714);
  ctx.fillStyle = '#76543a';
  ctx.font = `600 29px ${JP}`;
  ctx.fillText('ジューシー / 5個入り', w / 2, 765);
  drawStripes(ctx, 30, h - 58, w - 60, 17);
}, { key: 'poster-chicken' });

export const posterNewTex = canvasTexture(620, 840, (ctx, w, h) => {
  posterBase(ctx, w, h, '#e4f1e5', '#b9d7c7', '#fbf7e9');
  ctx.fillStyle = '#146f69';
  ctx.fillRect(28, 28, w - 56, 116);
  coverText(ctx, 'HOSHIMART NEWS', w / 2, 88, 480, 42, '#fff5df', EN, '800');
  ctx.fillStyle = '#ef9a48';
  ctx.beginPath();
  ctx.arc(w / 2, 305, 148, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f8f1df';
  starPath(ctx, w / 2, 305, 93, 34, 5, -Math.PI / 2);
  ctx.fill();
  coverText(ctx, '新商品', w / 2, 504, 410, 84, '#184e4a', JP, '900');
  coverText(ctx, '続々入荷', w / 2, 583, 400, 58, '#d46852', JP, '800');
  ctx.strokeStyle = '#2b7d76';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(92, 631);
  ctx.lineTo(w - 92, 631);
  ctx.stroke();
  ctx.fillStyle = '#4b7169';
  ctx.font = `600 29px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('雨の夜も、あたたかい。', w / 2, 688);
  coverText(ctx, 'A LITTLE WARMTH FOR A RAINY NIGHT', w / 2, 735, 440, 19, '#77958b', EN, '600');
  drawStripes(ctx, 30, h - 58, w - 60, 17);
}, { key: 'poster-new' });

/* ------------------------------------------------------------------ *
 *  Vending machine art
 * ------------------------------------------------------------------ */
export function vendingDisplayTexture(theme = 'blue') {
  const isBlue = theme === 'blue';
  return canvasTexture(560, 760, (ctx, w, h) => {
    const header = isBlue ? '#e8f6f8' : '#fff0df';
    const accent = isBlue ? '#127fb7' : '#c64a3f';
    const deep = isBlue ? '#0a4362' : '#652921';
    ctx.fillStyle = header;
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, isBlue ? '#dff7ff' : '#fff1d7');
    g.addColorStop(.55, '#ffffff');
    g.addColorStop(1, '#e8ece6');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, w, 96);
    coverText(ctx, isBlue ? 'AQUA  COOL' : 'HOT  &  SWEET', w / 2, 46, 440, 43, '#fffdf4', EN, '900');
    coverText(ctx, isBlue ? 'つめた〜い飲みもの' : 'あったか〜い飲みもの', w / 2, 78, 380, 20, isBlue ? '#c9eff5' : '#ffe1bd', JP, '600');
    // product shelves
    for (let row = 0; row < 3; row++) {
      const y = 124 + row * 155;
      ctx.fillStyle = 'rgba(20,60,65,.16)';
      ctx.fillRect(18, y + 105, w - 36, 8);
      for (let col = 0; col < 4; col++) {
        const x = 42 + col * 123;
        const palette = isBlue
          ? ['#d94d4b', '#48a754', '#e6a937', '#3e88c7', '#e7799a', '#7b5eb2']
          : ['#c9463d', '#e1943f', '#7e5b3b', '#4c8f64', '#d96c44', '#8f5e8b'];
        const cc = palette[(row * 4 + col + (isBlue ? 0 : 2)) % palette.length];
        const isBottle = (row + col) % 3 === 0;
        // can / bottle
        if (isBottle) {
          ctx.fillStyle = cc;
          fillRound(ctx, x + 18, y + 12, 54, 88, 16, cc);
          ctx.fillStyle = '#f7f1dd';
          ctx.fillRect(x + 18, y + 44, 54, 25);
          ctx.fillStyle = deep;
          ctx.font = `700 15px ${EN}`;
          ctx.textAlign = 'center';
          ctx.fillText(isBlue ? 'TEA' : 'LATTE', x + 45, y + 60);
          ctx.fillStyle = '#f5f2e7';
          ctx.fillRect(x + 28, y + 1, 32, 13);
          ctx.fillStyle = 'rgba(255,255,255,.35)';
          ctx.fillRect(x + 24, y + 18, 7, 71);
        } else {
          ctx.fillStyle = cc;
          fillRound(ctx, x + 15, y + 22, 60, 73, 11, cc);
          ctx.fillStyle = 'rgba(255,255,255,.86)';
          ctx.fillRect(x + 15, y + 42, 60, 26);
          ctx.fillStyle = deep;
          ctx.font = `800 15px ${EN}`;
          ctx.textAlign = 'center';
          ctx.fillText(isBlue ? 'SODA' : 'COCOA', x + 45, y + 60);
          ctx.fillStyle = '#e9e2cf';
          ctx.fillRect(x + 22, y + 13, 46, 8);
        }
        // price / button
        ctx.fillStyle = '#1f3f43';
        ctx.fillRect(x + 12, y + 98, 66, 22);
        ctx.fillStyle = '#f4d37a';
        ctx.font = `700 15px ${EN}`;
        ctx.textAlign = 'center';
        ctx.fillText('¥130', x + 45, y + 113);
        ctx.fillStyle = row === 0 && col === 0 ? '#f0a544' : '#3d8e87';
        ctx.beginPath();
        ctx.arc(x + 92, y + 108, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // lower button / coin panel
    ctx.fillStyle = '#d9dfd8';
    ctx.fillRect(0, 584, w, 176);
    ctx.fillStyle = accent;
    ctx.fillRect(24, 606, 210, 52);
    coverText(ctx, isBlue ? 'COLD' : 'WARM', 129, 632, 160, 27, '#fffdf4', EN, '900');
    ctx.fillStyle = '#34494c';
    ctx.fillRect(26, 676, 84, 34);
    ctx.fillStyle = '#e4be7c';
    ctx.fillRect(36, 686, 6, 16);
    ctx.fillStyle = '#f5e7bf';
    ctx.font = `600 13px ${EN}`;
    ctx.fillText('COIN', 80, 700);
    ctx.fillStyle = '#c6d0c7';
    fillRound(ctx, 330, 606, 204, 70, 9, '#c6d0c7');
    ctx.fillStyle = '#223235';
    ctx.fillRect(342, 618, 176, 44);
    ctx.fillStyle = '#97d6a1';
    ctx.font = `600 19px ${MONO}`;
    ctx.textAlign = 'left';
    ctx.fillText('SELECT', 353, 645);
    ctx.fillStyle = '#5c554b';
    fillRound(ctx, 26, 724, 510, 26, 12, '#5c554b');
    ctx.fillStyle = '#242b2c';
    ctx.fillRect(50, 730, 462, 13);
    ctx.strokeStyle = 'rgba(255,255,255,.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(90 + i * 110, 120);
      ctx.lineTo(90 + i * 110 - 60, 550);
      ctx.stroke();
    }
  }, { key: `vending-display-${theme}` });
}

export function vendingHeaderTexture(theme = 'blue') {
  return canvasTexture(512, 180, (ctx, w, h) => {
    const isBlue = theme === 'blue';
    ctx.fillStyle = isBlue ? '#0b5274' : '#7f2925';
    ctx.fillRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, isBlue ? '#0d6e9c' : '#ad3b32');
    grad.addColorStop(1, isBlue ? '#0a4870' : '#6e221f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    drawBrandMark(ctx, 71, 89, 44, isBlue ? '#e2f5ff' : '#ffe5c5', isBlue ? '#0a3f58' : '#5a1d1b');
    coverText(ctx, isBlue ? 'AQUA' : 'HOTTO', 121, 63, 270, 58, '#f9f2dd', EN, '900', 'left');
    coverText(ctx, isBlue ? 'DRINKS / 24H' : 'DRINK & SNACK', 122, 114, 350, 25, isBlue ? '#a8dced' : '#f0c797', EN, '600', 'left');
    ctx.strokeStyle = isBlue ? '#75c7df' : '#e6a567';
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    starPath(ctx, w - 50, 47, 18, 7, 5, -Math.PI / 2);
    ctx.fillStyle = isBlue ? '#bde8f2' : '#f5c58b';
    ctx.fill();
  }, { key: `vending-header-${theme}` });
}

/* ------------------------------------------------------------------ *
 *  Interior signage, screens, magazine covers
 * ------------------------------------------------------------------ */
function drawCategoryIcon(ctx, type, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.055);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (type === 'onigiri') {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.42);
    ctx.lineTo(s * 0.46, s * 0.38);
    ctx.lineTo(-s * 0.46, s * 0.38);
    ctx.closePath();
    ctx.fillStyle = '#f6f0df';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillRect(-s * 0.2, s * 0.09, s * 0.4, s * 0.28);
  } else if (type === 'drink') {
    ctx.beginPath();
    ctx.moveTo(-s * 0.27, -s * 0.34);
    ctx.lineTo(s * 0.27, -s * 0.34);
    ctx.lineTo(s * 0.19, s * 0.4);
    ctx.lineTo(-s * 0.19, s * 0.4);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, -s * 0.34);
    ctx.lineTo(s * 0.1, -s * 0.52);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.12, s * 0.03);
    ctx.lineTo(s * 0.13, s * 0.03);
    ctx.stroke();
  } else if (type === 'snack') {
    ctx.beginPath();
    ctx.moveTo(-s * 0.38, -s * 0.38);
    ctx.lineTo(s * 0.38, -s * 0.38);
    ctx.lineTo(s * 0.3, s * 0.38);
    ctx.lineTo(-s * 0.3, s * 0.38);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'mag') {
    ctx.strokeRect(-s * 0.36, -s * 0.4, s * 0.72, s * 0.8);
    ctx.beginPath();
    ctx.moveTo(-s * 0.24, -s * 0.18);
    ctx.lineTo(s * 0.2, -s * 0.18);
    ctx.moveTo(-s * 0.24, s * 0.01);
    ctx.lineTo(s * 0.28, s * 0.01);
    ctx.moveTo(-s * 0.24, s * 0.2);
    ctx.lineTo(s * 0.08, s * 0.2);
    ctx.stroke();
  } else if (type === 'bento') {
    ctx.strokeRect(-s * 0.4, -s * 0.3, s * 0.8, s * 0.6);
    ctx.beginPath();
    ctx.moveTo(-s * 0.38, -s * 0.05);
    ctx.lineTo(s * 0.38, -s * 0.05);
    ctx.moveTo(s * 0.02, -s * 0.3);
    ctx.lineTo(s * 0.02, s * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-s * 0.17, -s * 0.17, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'ice') {
    ctx.strokeRect(-s * 0.35, -s * 0.36, s * 0.7, s * 0.72);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.2);
    ctx.lineTo(s * 0.17, 0);
    ctx.lineTo(0, s * 0.2);
    ctx.lineTo(-s * 0.17, 0);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.25);
    ctx.lineTo(s * 0.35, -s * 0.25);
    ctx.lineTo(s * 0.25, s * 0.35);
    ctx.lineTo(-s * 0.25, s * 0.35);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

export function aisleSignTexture(main, sub, color, icon) {
  return canvasTexture(768, 220, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#fffaf0');
    g.addColorStop(1, '#eee3ce');
    ctx.fillStyle = g;
    fillRound(ctx, 4, 4, w - 8, h - 8, 27, '#fdf8ec');
    ctx.strokeStyle = 'rgba(37,89,83,.45)';
    ctx.lineWidth = 3;
    strokeRound(ctx, 4, 4, w - 8, h - 8, 27, 'rgba(37,89,83,.45)', 3);
    ctx.fillStyle = color;
    fillRound(ctx, 18, 18, 168, h - 36, 18, color);
    drawCategoryIcon(ctx, icon, 102, h / 2, 104, '#fff7e5');
    ctx.fillStyle = '#194f4b';
    ctx.font = `800 65px ${JP}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(main, 220, h / 2 - 20, 510);
    ctx.fillStyle = '#6e817a';
    ctx.font = `700 29px ${EN}`;
    ctx.letterSpacing = '5px';
    ctx.fillText(sub, 224, h / 2 + 50, 500);
    ctx.letterSpacing = '0px';
    ctx.fillStyle = color;
    ctx.fillRect(220, h - 33, 86, 7);
  }, { key: `aisle-${main}-${sub}-${color}-${icon}` });
}

export const coolerHeaderTex = canvasTexture(1024, 160, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#0b4f55');
  g.addColorStop(1, '#137c78');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#f0e2c3';
  ctx.font = `800 58px ${JP}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('つめた〜い 飲みもの', 42, 72, 660);
  ctx.fillStyle = '#82d8cf';
  ctx.font = `600 28px ${EN}`;
  ctx.letterSpacing = '5px';
  ctx.fillText('COLD DRINKS  /  TEA  /  COFFEE', 45, 123, 750);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = '#ef9d4a';
  ctx.beginPath();
  ctx.moveTo(w - 180, 0);
  ctx.lineTo(w - 40, 0);
  ctx.lineTo(w - 110, h);
  ctx.lineTo(w - 250, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f8edda';
  ctx.font = `900 70px ${EN}`;
  ctx.textAlign = 'center';
  ctx.fillText('ICE', w - 146, 82);
}, { key: 'cooler-header' });

export const odenSignTex = canvasTexture(512, 260, (ctx, w, h) => {
  ctx.fillStyle = '#f7eedb';
  fillRound(ctx, 3, 3, w - 6, h - 6, 18, '#f9f0dc');
  ctx.strokeStyle = '#b16c3f';
  ctx.lineWidth = 5;
  strokeRound(ctx, 3, 3, w - 6, h - 6, 18, '#b16c3f', 5);
  ctx.fillStyle = '#a54e2f';
  ctx.font = `900 67px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('おでん', w / 2, 81);
  ctx.fillStyle = '#e0a359';
  ctx.font = `700 35px ${JP}`;
  ctx.fillText('あったか〜い', w / 2, 145);
  ctx.fillStyle = '#677a67';
  ctx.font = `600 26px ${EN}`;
  ctx.fillText('ODEN  ¥100〜', w / 2, 200);
  ctx.strokeStyle = 'rgba(165,78,47,.3)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, 168);
  ctx.lineTo(w - 80, 168);
  ctx.stroke();
}, { key: 'oden-sign' });

export const staffSignTex = canvasTexture(512, 186, (ctx, w, h) => {
  fillRound(ctx, 2, 2, w - 4, h - 4, 13, '#f5efdf');
  ctx.strokeStyle = '#346c63';
  ctx.lineWidth = 5;
  ctx.strokeRect(12, 12, w - 24, h - 24);
  ctx.fillStyle = '#254f4a';
  ctx.font = `800 45px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('STAFF ONLY', w / 2, 70);
  ctx.font = `600 27px ${JP}`;
  ctx.fillStyle = '#9a5a4e';
  ctx.fillText('関係者以外 立入禁止', w / 2, 124);
  drawStripes(ctx, 22, h - 30, w - 44, 9);
}, { key: 'staff-sign' });

export const coffeeMenuTex = canvasTexture(512, 300, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#3e2418');
  g.addColorStop(1, '#1d1210');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#e8ad6a';
  ctx.font = `700 31px ${JP}`;
  ctx.textAlign = 'left';
  ctx.fillText('HOT COFFEE', 30, 54);
  ctx.font = `900 54px ${EN}`;
  ctx.fillStyle = '#fff1d8';
  ctx.fillText('¥150', 30, 124);
  ctx.fillStyle = '#cdbda8';
  ctx.font = `600 25px ${JP}`;
  ctx.fillText('S  ¥100    L  ¥180', 30, 172);
  ctx.fillStyle = '#7dc3ac';
  ctx.font = `700 22px ${EN}`;
  ctx.fillText('カフェラテ  +¥50', 30, 213);
  ctx.fillStyle = '#e9a454';
  fillRound(ctx, 337, 75, 141, 135, 18, '#e9a454');
  ctx.fillStyle = '#3e2418';
  ctx.font = `900 39px ${EN}`;
  ctx.textAlign = 'center';
  ctx.fillText('HOT', 407, 128);
  ctx.font = `800 24px ${JP}`;
  ctx.fillText('いかがですか', 407, 165);
  ctx.fillStyle = '#563320';
  ctx.beginPath();
  ctx.ellipse(407, 245, 52, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7eddc';
  ctx.fillRect(385, 224, 44, 19);
  ctx.strokeStyle = 'rgba(255,255,255,.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, w - 28, h - 28);
}, { key: 'coffee-menu' });

export const priceSignsTex = canvasTexture(1024, 128, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  const items = [
    ['おにぎり', '¥100', '#d05a4c'],
    ['お弁当', '¥498', '#c98a37'],
    ['サンド', '¥280', '#3a8a70'],
    ['コーヒー', '¥150', '#785544'],
  ];
  let x = 6;
  for (const [name, price, color] of items) {
    fillRound(ctx, x, 12, 240, 104, 12, '#f7eedb');
    ctx.fillStyle = color;
    ctx.fillRect(x, 12, 9, 104);
    ctx.fillStyle = '#39534e';
    ctx.font = `700 27px ${JP}`;
    ctx.textAlign = 'left';
    ctx.fillText(name, x + 23, 54);
    ctx.fillStyle = color;
    ctx.font = `900 34px ${EN}`;
    ctx.fillText(price, x + 23, 97);
    x += 252;
  }
}, { key: 'price-signs' });

export const floorArrowTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.strokeStyle = 'rgba(63,138,115,.62)';
  ctx.fillStyle = 'rgba(63,138,115,.4)';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 190);
  ctx.lineTo(0, -80);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -190);
  ctx.lineTo(-92, -52);
  ctx.lineTo(92, -52);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(w / 2, h - 68);
  ctx.fillStyle = 'rgba(56,113,99,.65)';
  ctx.font = `800 60px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('レジ', 0, 0);
  ctx.restore();
}, { key: 'floor-arrow' });

export const iceBoxTex = canvasTexture(512, 256, (ctx, w, h) => {
  ctx.fillStyle = '#f0f4f2';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#9aaba9';
  ctx.lineWidth = 8;
  ctx.strokeRect(5, 5, w - 10, h - 10);
  ctx.fillStyle = '#2d829b';
  fillRound(ctx, 26, 30, 192, 78, 12, '#2d829b');
  ctx.fillStyle = '#f7fbf7';
  ctx.font = `900 62px ${EN}`;
  ctx.textAlign = 'center';
  ctx.fillText('ICE', 122, 88);
  ctx.fillStyle = '#396a70';
  ctx.font = `700 37px ${JP}`;
  ctx.textAlign = 'left';
  ctx.fillText('アイスクリーム', 241, 71);
  ctx.font = `600 20px ${JP}`;
  ctx.fillStyle = '#78908b';
  ctx.fillText('COLD SNACKS', 244, 106);
  ctx.strokeStyle = '#c7d6d2';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(34, 148);
  ctx.lineTo(w - 34, 148);
  ctx.stroke();
  ctx.fillStyle = '#d0b46e';
  ctx.font = `600 22px ${JP}`;
  ctx.fillText('¥160〜', 34, 190);
}, { key: 'icebox' });

export const magazineTitles = ['夜の散歩', 'アニメ日和', '街と暮らし', '雨音', '週刊 星', '喫茶日和', '東京夜景', '小さな旅'];

export function magazineCoverTexture(i) {
  const palettes = [
    ['#255a71', '#d8b56d', '#f5ead7'],
    ['#d66f5f', '#f4dbc2', '#314b4a'],
    ['#3b6a5b', '#e3d4ac', '#f6f0e0'],
    ['#53596e', '#d6a1a9', '#f4e8df'],
    ['#c49a4e', '#243f44', '#fff3d6'],
    ['#6d4a3d', '#d9a66b', '#f7e8d5'],
    ['#333b50', '#d46277', '#f0e5d2'],
    ['#4f7771', '#e4bd7b', '#fcf4e5'],
  ];
  const [a, b, c] = palettes[i % palettes.length];
  return canvasTexture(300, 400, (ctx, w, h) => {
    ctx.fillStyle = a;
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(255,255,255,.23)');
    g.addColorStop(1, 'rgba(0,0,0,.2)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // graphic art
    ctx.save();
    if (i % 3 === 0) {
      ctx.fillStyle = b;
      ctx.beginPath();
      ctx.arc(w * 0.68, h * 0.3, 78, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c;
      ctx.fillRect(26, 153, w - 52, 4);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#ede0c8';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.7);
      ctx.lineTo(w * 0.32, h * 0.4);
      ctx.lineTo(w * 0.52, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    } else if (i % 3 === 1) {
      ctx.fillStyle = b;
      ctx.beginPath();
      ctx.ellipse(w * 0.66, h * 0.38, 82, 116, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = c;
      ctx.fillRect(28, h * 0.62, w - 56, 98);
    } else {
      ctx.strokeStyle = b;
      ctx.lineWidth = 3;
      for (let k = 0; k < 6; k++) {
        ctx.beginPath();
        ctx.arc(w * 0.66, h * 0.31, 18 + k * 16, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(20, h * 0.63, w - 40, 4);
    }
    ctx.restore();
    ctx.fillStyle = c;
    ctx.font = `900 39px ${JP}`;
    ctx.textAlign = 'left';
    const title = magazineTitles[i % magazineTitles.length];
    ctx.fillText(title, 24, 64, w - 42);
    ctx.font = `600 16px ${EN}`;
    ctx.letterSpacing = '3px';
    ctx.fillText(['TOKYO NIGHT', 'ANIME DAYS', 'CITY LIFE', 'RAIN SOUND', 'WEEKLY HOSHI', 'COFFEE TIME', 'NIGHTSCAPE', 'SMALL TRIP'][i % 8], 26, 95, w - 40);
    ctx.letterSpacing = '0px';
    ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    // bottom price
    ctx.fillStyle = 'rgba(20,32,31,.64)';
    ctx.fillRect(12, h - 47, w - 24, 35);
    ctx.fillStyle = '#f4e9d6';
    ctx.font = `600 15px ${JP}`;
    ctx.fillText('定価 580円', 24, h - 23);
  }, { key: `magazine-${i}` });
}

export const magRackHeaderTex = canvasTexture(768, 130, (ctx, w, h) => {
  ctx.fillStyle = '#f7edd8';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#1a615d';
  ctx.font = `800 51px ${JP}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('雑誌・コミック', 42, 58);
  ctx.fillStyle = '#b07e46';
  ctx.font = `700 24px ${EN}`;
  ctx.letterSpacing = '5px';
  ctx.fillText('MAGAZINES & BOOKS', 44, 101);
  ctx.letterSpacing = '0px';
  drawStripes(ctx, w - 202, 0, 202, h);
}, { key: 'mag-rack-header' });

/* ------------------------------------------------------------------ *
 *  Street signs / neighbourhood
 * ------------------------------------------------------------------ */
export const streetPlateTex = canvasTexture(768, 180, (ctx, w, h) => {
  ctx.fillStyle = '#1d6580';
  fillRound(ctx, 4, 4, w - 8, h - 8, 16, '#1d6580');
  ctx.strokeStyle = '#d7eadf';
  ctx.lineWidth = 5;
  strokeRound(ctx, 13, 13, w - 26, h - 26, 12, 'rgba(230,244,235,.9)', 5);
  ctx.fillStyle = '#f4f4e9';
  ctx.font = `800 67px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('星見町 二丁目', w / 2, 73, 660);
  ctx.font = `600 30px ${EN}`;
  ctx.letterSpacing = '3px';
  ctx.fillText('HOSHIMI-CHO 2-CHOME', w / 2, 132, 610);
}, { key: 'street-plate' });

export const parkingSignTex = canvasTexture(360, 450, (ctx, w, h) => {
  fillRound(ctx, 5, 5, w - 10, h - 10, 34, '#145f88');
  ctx.strokeStyle = '#f2f1e5';
  ctx.lineWidth = 11;
  strokeRound(ctx, 17, 17, w - 34, h - 34, 26, '#f2f1e5', 11);
  ctx.fillStyle = '#f5f3e7';
  ctx.font = `900 235px ${EN}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('P', w / 2, 235);
  ctx.font = `700 25px ${JP}`;
  ctx.fillText('駐車場', w / 2, 386);
}, { key: 'parking-sign' });

export const noParkingSignTex = canvasTexture(360, 450, (ctx, w, h) => {
  fillRound(ctx, 5, 5, w - 10, h - 10, 34, '#f3efe1');
  ctx.strokeStyle = '#bb4c3f';
  ctx.lineWidth = 9;
  strokeRound(ctx, 16, 16, w - 32, h - 32, 26, '#bb4c3f', 9);
  ctx.strokeStyle = '#bb4c3f';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(w / 2, 170, 103, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w / 2 - 74, 97);
  ctx.lineTo(w / 2 + 74, 243);
  ctx.stroke();
  ctx.fillStyle = '#43625b';
  ctx.font = `700 28px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('駐輪禁止', w / 2, 342);
  ctx.font = `600 18px ${EN}`;
  ctx.fillText('NO BICYCLES', w / 2, 381);
}, { key: 'no-parking' });

export const cafeSignTex = canvasTexture(360, 1100, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#f2e3c8');
  g.addColorStop(.5, '#e3ccaa');
  g.addColorStop(1, '#c7a881');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#3d2c25';
  ctx.lineWidth = 13;
  ctx.strokeRect(9, 9, w - 18, h - 18);
  ctx.strokeStyle = '#876d4d';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, w - 56, h - 56);
  ctx.save();
  ctx.translate(w / 2, 139);
  ctx.strokeStyle = '#8e573f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#8f5743';
  ctx.beginPath();
  ctx.arc(0, 0, 47, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e6cfad';
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#33251f';
  ctx.font = `800 80px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const chars = ['喫', '茶', '雨', '音'];
  chars.forEach((c, i) => {
    ctx.fillText(c, w / 2, 305 + i * 127);
  });
  ctx.strokeStyle = '#8d6e4c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 825);
  ctx.lineTo(w - 64, 825);
  ctx.stroke();
  ctx.fillStyle = '#6c5741';
  ctx.font = `600 25px ${EN}`;
  ctx.letterSpacing = '4px';
  ctx.fillText('COFFEE & JAZZ', w / 2, 870);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = '#985b49';
  ctx.font = `600 25px ${JP}`;
  ctx.fillText('営業 18:00 - 02:00', w / 2, 920);
  ctx.fillStyle = '#5f4a38';
  ctx.font = `500 21px ${JP}`;
  ctx.fillText('雨の日は、しずかに。', w / 2, 992);
}, { key: 'cafe-sign' });

export const norenTex = canvasTexture(768, 512, (ctx, w, h) => {
  ctx.fillStyle = '#203f49';
  ctx.fillRect(0, 0, w, h);
  // subtle weave
  ctx.strokeStyle = 'rgba(255,255,255,.035)';
  ctx.lineWidth = 1;
  for (let y = 0; y < h; y += 5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#e9dfc9';
  ctx.beginPath();
  ctx.arc(w / 2, 165, 96, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#294851';
  ctx.font = `800 122px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('雨', w / 2, 166);
  ctx.fillStyle = 'rgba(237,227,205,.9)';
  ctx.font = `600 44px ${JP}`;
  ctx.fillText('雨 音', w / 2, 343);
  ctx.font = `500 24px ${EN}`;
  ctx.letterSpacing = '6px';
  ctx.fillText('AMAOTO', w / 2, 402);
  ctx.letterSpacing = '0px';
  // vertical slit lines
  ctx.fillStyle = 'rgba(8,18,21,.75)';
  ctx.fillRect(w / 3 - 2, 0, 4, h);
  ctx.fillRect((w * 2) / 3 - 2, 0, 4, h);
  // bottom wear
  const gr = ctx.createLinearGradient(0, h - 40, 0, h);
  gr.addColorStop(0, 'rgba(10,22,25,0)');
  gr.addColorStop(1, 'rgba(10,22,25,.3)');
  ctx.fillStyle = gr;
  ctx.fillRect(0, h - 40, w, 40);
}, { key: 'noren' });

export const rearNeonTex = canvasTexture(320, 900, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(12,20,28,.9)';
  fillRound(ctx, 0, 0, w, h, 10, 'rgba(12,20,28,.92)');
  ctx.strokeStyle = 'rgba(255,114,158,.3)';
  ctx.lineWidth = 4;
  strokeRound(ctx, 5, 5, w - 10, h - 10, 8, 'rgba(255,114,158,.3)', 4);
  ctx.save();
  ctx.shadowColor = '#ff709a';
  ctx.shadowBlur = 22;
  ctx.fillStyle = '#ffd8d2';
  ctx.font = `700 84px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const chars = ['ミ', 'ナ', 'ト', '荘'];
  chars.forEach((c, i) => ctx.fillText(c, w / 2, 130 + i * 142));
  ctx.strokeStyle = '#5bd9d1';
  ctx.shadowColor = '#5bd9d1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 690);
  ctx.lineTo(w - 70, 690);
  ctx.stroke();
  ctx.fillStyle = '#bfeee7';
  ctx.font = `600 24px ${EN}`;
  ctx.letterSpacing = '4px';
  ctx.fillText('MINATO', w / 2, 727);
  ctx.fillText('APARTMENT', w / 2, 758);
  ctx.restore();
}, { key: 'rear-neon' });

export const noticeboardTex = canvasTexture(700, 512, (ctx, w, h) => {
  ctx.fillStyle = '#59483a';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#b49a76';
  ctx.fillRect(16, 16, w - 32, h - 32);
  const notes = [
    { x: 45, y: 53, w: 168, h: 212, bg: '#f6ecd3', title: '秋祭り', color: '#b7583f' },
    { x: 237, y: 36, w: 190, h: 142, bg: '#f5e2a4', title: '猫を探して', color: '#4b665b' },
    { x: 446, y: 62, w: 198, h: 118, bg: '#cfe2d8', title: 'リサイクル', color: '#2e6d68' },
    { x: 60, y: 293, w: 200, h: 148, bg: '#efe1d0', title: 'ピアノ教室', color: '#8b4a44' },
    { x: 285, y: 216, w: 160, h: 215, bg: '#e6ddc2', title: '町内会', color: '#475b4f' },
    { x: 466, y: 218, w: 176, h: 190, bg: '#dddfcc', title: '夜市', color: '#4c645d' },
  ];
  for (const n of notes) {
    ctx.save();
    ctx.translate(n.x, n.y);
    ctx.rotate((rng() - 0.5) * 0.045);
    ctx.shadowColor = 'rgba(55,35,20,.25)';
    ctx.shadowBlur = 7;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = n.bg;
    ctx.fillRect(0, 0, n.w, n.h);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = n.color;
    ctx.font = `800 25px ${JP}`;
    ctx.textAlign = 'center';
    ctx.fillText(n.title, n.w / 2, 37, n.w - 20);
    // fake lines
    ctx.fillStyle = 'rgba(62,65,56,.35)';
    for (let y = 62; y < n.h - 20; y += 16) {
      ctx.fillRect(16, y, n.w - 32 - (y % 3) * 13, 2);
    }
    // circular stamp
    ctx.strokeStyle = 'rgba(183,76,58,.42)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(n.w - 30, n.h - 30, 17, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.strokeStyle = 'rgba(47,36,27,.6)';
  ctx.lineWidth = 9;
  ctx.strokeRect(8, 8, w - 16, h - 16);
}, { key: 'noticeboard' });

export const roadStopTex = canvasTexture(512, 768, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.fillStyle = 'rgba(239,239,226,.82)';
  ctx.font = `900 164px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.save();
  ctx.translate(w / 2 - 100, h / 2);
  ctx.fillText('止', 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(w / 2 + 150, h / 2);
  ctx.rotate(Math.PI / 2);
  ctx.font = `900 100px ${JP}`;
  ctx.fillText('ま', 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(w / 2 + 220, h / 2);
  ctx.rotate(Math.PI / 2);
  ctx.font = `900 100px ${JP}`;
  ctx.fillText('れ', 0, 0);
  ctx.restore();
  ctx.restore();
}, { key: 'road-stop' });

export const utilityNoticeTex = canvasTexture(300, 420, (ctx, w, h) => {
  ctx.fillStyle = '#ece2c5';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#326c65';
  ctx.lineWidth = 7;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.fillStyle = '#315a55';
  ctx.font = `700 29px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('電力設備', w / 2, 61);
  ctx.font = `600 18px ${JP}`;
  ctx.fillStyle = '#7b7565';
  ctx.fillText('高圧注意', w / 2, 94);
  ctx.strokeStyle = '#b15243';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w / 2, 127);
  ctx.lineTo(w / 2 - 43, 201);
  ctx.lineTo(w / 2 + 43, 201);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = '#b15243';
  ctx.font = `900 59px ${EN}`;
  ctx.fillText('!', w / 2, 190);
  // warning bars
  ctx.save();
  ctx.translate(35, 239);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 ? '#d7ba53' : '#403e35';
    ctx.fillRect(i * 46, 0, 46, 23);
  }
  ctx.restore();
  ctx.fillStyle = '#6f6b5d';
  ctx.font = `500 16px ${JP}`;
  ctx.textAlign = 'left';
  ctx.fillText('星見町二丁目 電柱', 27, 303);
  ctx.fillText('No. 08-24', 27, 330);
  ctx.strokeStyle = 'rgba(64,71,61,.28)';
  ctx.lineWidth = 2;
  for (let y = 352; y < 392; y += 9) {
    ctx.beginPath();
    ctx.moveTo(28, y);
    ctx.lineTo(w - 28, y);
    ctx.stroke();
  }
}, { key: 'utility-notice' });

export const flyerTex = canvasTexture(512, 720, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#efe2ca');
  g.addColorStop(1, '#d8c5a6');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#1b6562';
  ctx.fillRect(0, 0, w, 118);
  ctx.fillStyle = '#f8eed9';
  ctx.font = `800 54px ${JP}`;
  ctx.textAlign = 'center';
  ctx.fillText('星見町 秋の夜市', w / 2, 75);
  ctx.fillStyle = '#c96b4f';
  ctx.beginPath();
  ctx.arc(w / 2, 264, 99, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f6ead2';
  ctx.font = `900 90px ${EN}`;
  ctx.fillText('10/24', w / 2, 293);
  ctx.fillStyle = '#37544c';
  ctx.font = `700 36px ${JP}`;
  ctx.fillText('夕方 5時から 9時まで', w / 2, 429, 440);
  ctx.font = `600 25px ${JP}`;
  ctx.fillStyle = '#717159';
  ctx.fillText('星見公園・雨天決行', w / 2, 482, 420);
  ctx.strokeStyle = 'rgba(49,74,68,.32)';
  ctx.lineWidth = 2;
  for (let y = 527; y < 640; y += 15) {
    ctx.beginPath();
    ctx.moveTo(56, y);
    ctx.lineTo(w - 56 - (y % 4) * 18, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#b25a43';
  ctx.font = `600 22px ${JP}`;
  ctx.textAlign = 'right';
  ctx.fillText('主催 / 星見町商店会', w - 42, h - 28);
}, { key: 'flyer' });

export const apartmentWindowTex = (variant = 0, lit = true) => canvasTexture(256, 320, (ctx, w, h) => {
  const warm = lit;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  if (warm) {
    bg.addColorStop(0, '#f8d89b');
    bg.addColorStop(0.55, '#e6a96a');
    bg.addColorStop(1, '#b8794e');
  } else {
    bg.addColorStop(0, '#1b2b3d');
    bg.addColorStop(1, '#111a26');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  // curtains
  if (warm) {
    ctx.fillStyle = 'rgba(245,231,203,.7)';
    ctx.fillRect(0, 0, w * 0.24, h);
    ctx.fillRect(w * 0.79, 0, w * 0.21, h);
    ctx.fillStyle = 'rgba(150,96,57,.2)';
    for (let x = 0; x < w * 0.24; x += 22) ctx.fillRect(x, 0, 7, h);
    for (let x = w * 0.79; x < w; x += 22) ctx.fillRect(x, 0, 7, h);
  }
  if (variant === 1 && warm) {
    // plant silhouette
    ctx.fillStyle = 'rgba(67,76,54,.75)';
    ctx.beginPath();
    ctx.ellipse(w * 0.76, h * 0.72, 34, 65, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5b4938';
    ctx.fillRect(w * 0.69, h * 0.83, 45, 44);
  }
  if (variant === 2 && warm) {
    // hanging lamp
    ctx.fillStyle = 'rgba(87,62,40,.55)';
    ctx.fillRect(w * 0.16, 0, 3, h * 0.32);
    ctx.fillStyle = '#f6e2b9';
    ctx.beginPath();
    ctx.moveTo(w * 0.09, h * 0.34);
    ctx.lineTo(w * 0.25, h * 0.34);
    ctx.lineTo(w * 0.21, h * 0.26);
    ctx.lineTo(w * 0.13, h * 0.26);
    ctx.closePath();
    ctx.fill();
  }
  if (variant === 3 && !warm) {
    ctx.fillStyle = 'rgba(143,176,190,.22)';
    ctx.fillRect(35, 30, w - 70, h - 60);
  }
  // window frame
  ctx.strokeStyle = warm ? 'rgba(56,47,39,.7)' : 'rgba(10,17,24,.9)';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, w - 16, h - 16);
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(w / 2, 8);
  ctx.lineTo(w / 2, h - 8);
  ctx.moveTo(8, h * 0.52);
  ctx.lineTo(w - 8, h * 0.52);
  ctx.stroke();
  // screen reflection
  const refl = ctx.createLinearGradient(0, 0, w, h);
  refl.addColorStop(0, 'rgba(230,247,255,.2)');
  refl.addColorStop(0.4, 'rgba(230,247,255,.0)');
  refl.addColorStop(1, 'rgba(255,255,255,.06)');
  ctx.fillStyle = refl;
  ctx.fillRect(0, 0, w, h);
}, { key: `apartment-window-${variant}-${lit ? 'lit' : 'dark'}` });

export const basePlaqueTex = canvasTexture(1024, 240, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#b29b67');
  g.addColorStop(0.45, '#827044');
  g.addColorStop(1, '#55462c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(246,226,175,.6)';
  ctx.lineWidth = 4;
  ctx.strokeRect(15, 15, w - 30, h - 30);
  ctx.strokeStyle = 'rgba(30,24,15,.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, w - 52, h - 52);
  starPath(ctx, 100, h / 2, 38, 14, 5, -Math.PI / 2);
  ctx.fillStyle = 'rgba(246,230,187,.9)';
  ctx.fill();
  ctx.fillStyle = '#f3e3b8';
  ctx.font = `700 48px ${JP}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('雨夜の街角', 165, 89);
  ctx.font = `600 27px ${JP}`;
  ctx.fillStyle = '#e9d7a7';
  ctx.fillText('星見マート前  /  午後十一時', 167, 141);
  ctx.font = `600 24px ${EN}`;
  ctx.letterSpacing = '6px';
  ctx.fillStyle = '#cfba8c';
  ctx.fillText('RAINY NIGHT CORNER', 166, 184);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(34,27,17,.5)';
  ctx.font = `500 18px ${EN}`;
  ctx.textAlign = 'right';
  ctx.fillText('HOSHIMI-CHO  2-24', w - 62, 86);
  ctx.font = `500 16px ${JP}`;
  ctx.fillText('MINIATURE DIORAMA', w - 62, 118);
  ctx.fillStyle = '#e1c988';
  ctx.beginPath();
  ctx.arc(w - 91, 169, 12, 0, Math.PI * 2);
  ctx.fill();
}, { key: 'base-plaque' });

export const busStopTex = canvasTexture(360, 512, (ctx, w, h) => {
  fillRound(ctx, 4, 4, w - 8, h - 8, 22, '#e8ebe1');
  strokeRound(ctx, 4, 4, w - 8, h - 8, 22, '#255a61', 8);
  ctx.fillStyle = '#2b666d';
  ctx.fillRect(4, 4, w - 8, 84);
  ctx.fillStyle = '#f3f3e8';
  ctx.font = `700 36px ${JP}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('星見町二丁目', w / 2, 49);
  ctx.fillStyle = '#365658';
  ctx.font = `500 23px ${JP}`;
  ctx.fillText('バス停', w / 2, 127);
  ctx.fillStyle = '#e6a348';
  ctx.beginPath();
  ctx.arc(w / 2, 195, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f9f4e5';
  ctx.font = `800 33px ${EN}`;
  ctx.fillText('24', w / 2, 198);
  ctx.fillStyle = '#5f6d69';
  ctx.font = `500 18px ${JP}`;
  ctx.fillText('市役所前行', w / 2, 263);
  ctx.fillText('最終 23:42', w / 2, 293);
  ctx.strokeStyle = 'rgba(45,80,78,.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(35, 322);
  ctx.lineTo(w - 35, 322);
  ctx.stroke();
  ctx.font = `500 15px ${JP}`;
  ctx.fillStyle = '#78817a';
  ctx.fillText('星見町コミュニティバス', w / 2, 357);
  ctx.fillStyle = '#316c67';
  ctx.font = `600 18px ${EN}`;
  ctx.fillText('HOSHIMI COMMUNITY BUS', w / 2, 386);
}, { key: 'bus-stop' });

export const interiorPosterTex = (i = 0) => {
  const configs = [
    { bg: '#e5efe2', fg: '#2d6962', accent: '#e79b4e', title: 'あたらしい朝', sub: 'FRESH BAKERY', item: 'メロンパン' },
    { bg: '#f5e1ca', fg: '#814a3d', accent: '#dc7656', title: '秋の味覚', sub: 'SEASONAL SWEETS', item: 'さつまいも' },
    { bg: '#dce8ee', fg: '#345d74', accent: '#5ea9a0', title: '夜もOPEN', sub: '24 HOURS', item: 'あったかい' },
  ];
  const c = configs[i % configs.length];
  return canvasTexture(480, 680, (ctx, w, h) => {
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = c.fg;
    ctx.fillRect(0, 0, w, 104);
    ctx.fillStyle = '#f7f1df';
    ctx.font = `800 48px ${JP}`;
    ctx.textAlign = 'center';
    ctx.fillText(c.title, w / 2, 66, w - 44);
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.arc(w / 2, 294, 116, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.beginPath();
    ctx.arc(w / 2 - 30, 260, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.fg;
    ctx.font = `700 40px ${JP}`;
    ctx.fillText(c.item, w / 2, 480);
    ctx.font = `600 20px ${EN}`;
    ctx.letterSpacing = '5px';
    ctx.fillText(c.sub, w / 2, 522);
    ctx.letterSpacing = '0px';
    ctx.strokeStyle = 'rgba(37,81,78,.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = c.fg;
    ctx.font = `600 18px ${JP}`;
    ctx.fillText('星見マート', w / 2, h - 38);
  }, { key: `interior-poster-${i}` });
};
