/* Fare temaları. Sıra = özelleştirme ekranındaki sıra.
 * Telif nedeniyle hepsi orijinal tasarım; marka karakteri yok. */
window.FO = window.FO || {};
FO.skins = {
  list: [
    { id: 'mouse_base',   file: 'mouse/mouse_base.png',   label: 'Gri fare' },
    { id: 'skin_robi',    file: 'mouse/skin_robi.png',    label: 'Robi robot fare' },
    { id: 'skin_ladybug', file: 'mouse/skin_ladybug.png', label: 'Uğur böceği fare' },
    { id: 'skin_spider',  file: 'mouse/skin_spider.png',  label: 'Örümcek kahraman fare' },
    { id: 'skin_dino',    file: 'mouse/skin_dino.png',    label: 'Dinozor fare' },
    { id: 'skin_pixel',   file: 'mouse/skin_pixel.png',   label: 'Pikselli fare' },
    { id: 'skin_furry',   file: 'mouse/skin_furry.png',   label: 'Tüylü canavar fare' }
  ],
  byId: function (id) {
    for (var i = 0; i < this.list.length; i++) if (this.list[i].id === id) return this.list[i];
    return this.list[0];
  }
};

/* Bilgisayar parçaları (eşleştirme oyunu). */
FO.parts = [
  { id: 'monitor',  file: 'parts/part_monitor.png',  label: 'Ekran',     voice: 'part_monitor' },
  { id: 'case',     file: 'parts/part_case.png',     label: 'Kasa',      voice: 'part_case' },
  { id: 'mouse',    file: 'mouse/mouse_base.png',    label: 'Fare',      voice: 'part_mouse' },
  { id: 'keyboard', file: 'parts/part_keyboard.png', label: 'Klavye',    voice: 'part_keyboard' },
  { id: 'speaker',  file: 'parts/part_speaker.png',  label: 'Hoparlör',  voice: 'part_speaker' },
  { id: 'laptop',   file: 'parts/part_laptop.png',   label: 'Laptop',    voice: 'part_laptop' }
];
