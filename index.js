(function () {
  'use strict';
  const KEY = 'yn_theme_panel_v1';
  const DEFAULTS = {
    botText: '#f5f5f5', botItalic: '#b8b8b8', botSize: 15,
    userText: '#f5f5f5', userItalic: '#b8b8b8', userSize: 15,
    lineHeight: 1.42,
    barBg: '#000000', icon: '#b4b4b9', inputText: '#f5f5f5', placeholder: '#8e8e93', send: '#1e90ff',
    fab: true,
  };
  const MAP = {
    botText: ['--yn-bot-text', ''], botItalic: ['--yn-bot-italic', ''], botSize: ['--yn-bot-size', 'px'],
    userText: ['--yn-user-text', ''], userItalic: ['--yn-user-italic', ''], userSize: ['--yn-user-size', 'px'],
    lineHeight: ['--yn-line-height', ''],
    barBg: ['--yn-bar-bg', ''], icon: ['--yn-icon', ''], inputText: ['--yn-input-text', ''],
    placeholder: ['--yn-placeholder', ''], send: ['--yn-send', ''],
  };
  let S = Object.assign({}, DEFAULTS);
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}

  const save = () => localStorage.setItem(KEY, JSON.stringify(S));
  function apply() {
    const r = document.documentElement.style;
    for (const k in MAP) r.setProperty(MAP[k][0], S[k] + MAP[k][1]);
    const fab = document.getElementById('yn_fab');
    if (fab) fab.style.display = S.fab ? 'flex' : 'none';
  }

  const COLORS = [
    ['Réponses des bots', [['botText', 'Texte'], ['botItalic', 'Texte en italique (actions)']]],
    ['Mes messages', [['userText', 'Texte'], ['userItalic', 'Texte en italique (actions)']]],
    ['Barre de saisie', [['barBg', 'Fond de la barre'], ['icon', 'Icônes'], ['inputText', 'Texte saisi'], ['placeholder', 'Texte « Tapez un message »'], ['send', 'Bouton envoyer']]],
  ];

  function row(key, label) {
    return `<div class="yn-row"><span>${label}</span><input type="color" data-k="${key}" value="${S[key]}"></div>`;
  }
  function slider(key, label, min, max, step) {
    return `<div class="yn-row"><span>${label}</span><input type="range" data-k="${key}" min="${min}" max="${max}" step="${step}" value="${S[key]}"><span class="yn-val" data-v="${key}">${S[key]}</span></div>`;
  }

  function buildPanel() {
    if (document.getElementById('yn_panel')) return;
    const p = document.createElement('div');
    p.id = 'yn_panel';
    p.innerHTML = `
      <h3>Réglages du thème <span id="yn_close" class="fa-solid fa-xmark"></span></h3>
      <h4>Réponses des bots</h4>
      ${row('botText', 'Couleur du texte')}${row('botItalic', 'Couleur italique (actions)')}${slider('botSize', 'Taille du texte (px)', 11, 26, 1)}
      <h4>Mes messages</h4>
      ${row('userText', 'Couleur du texte')}${row('userItalic', 'Couleur italique (actions)')}${slider('userSize', 'Taille du texte (px)', 11, 26, 1)}
      <h4>Général</h4>
      ${slider('lineHeight', 'Interligne', 1.1, 2, 0.02)}
      <h4>Barre de saisie</h4>
      ${row('barBg', 'Fond de la barre')}${row('icon', 'Icônes')}${row('inputText', 'Texte saisi')}${row('placeholder', 'Texte « Tapez un message »')}${row('send', 'Bouton envoyer')}
      <div class="yn-row"><span>Afficher le bouton flottant ⚙</span><input type="checkbox" data-k="fab" ${S.fab ? 'checked' : ''}></div>
      <div class="yn-btns"><button id="yn_reset">Réinitialiser</button><button id="yn_ok" class="primary">Fermer</button></div>`;
    document.body.appendChild(p);

    p.addEventListener('input', (e) => {
      const k = e.target.dataset && e.target.dataset.k;
      if (!k) return;
      if (e.target.type === 'checkbox') S[k] = e.target.checked;
      else if (e.target.type === 'range') {
        S[k] = parseFloat(e.target.value);
        const v = p.querySelector(`[data-v="${k}"]`); if (v) v.textContent = S[k];
      } else S[k] = e.target.value;
      save(); apply();
    });
    const close = () => p.classList.remove('open');
    p.querySelector('#yn_close').onclick = close;
    p.querySelector('#yn_ok').onclick = close;
    p.querySelector('#yn_reset').onclick = () => {
      S = Object.assign({}, DEFAULTS); save(); apply(); p.remove(); buildPanel(); document.getElementById('yn_panel').classList.add('open');
    };
  }
  function togglePanel() {
    buildPanel();
    document.getElementById('yn_panel').classList.toggle('open');
  }

  function addFab() {
    if (document.getElementById('yn_fab')) return;
    const f = document.createElement('div');
    f.id = 'yn_fab'; f.className = 'fa-solid fa-palette'; f.title = 'Réglages du thème';
    f.onclick = togglePanel;
    document.body.appendChild(f);
    apply();
  }

  function addMenuItem() {
    const menu = document.getElementById('extensionsMenu');
    if (!menu || document.getElementById('yn_menu_item')) return;
    const it = document.createElement('div');
    it.id = 'yn_menu_item'; it.className = 'list-group-item flex-container flexGap5 interactable';
    it.innerHTML = '<div class="fa-solid fa-palette extensionsMenuExtensionButton"></div><span>Réglages du thème</span>';
    it.onclick = () => { togglePanel(); };
    menu.appendChild(it);
  }

  const click = (sel) => { const el = document.querySelector(sel); if (el) el.click(); };

  function personaSrc() {
    const sel = document.querySelector('#user_avatar_block .avatar-container.selected img');
    if (sel && sel.src) return sel.src;
    const imgs = document.querySelectorAll('#chat .mes[is_user="true"] .avatar img');
    if (imgs.length) return imgs[imgs.length - 1].src;
    return '';
  }

  function addBarButtons() {
    const left = document.getElementById('leftSendForm');
    const right = document.getElementById('rightSendForm');
    if (!left || !right) return;
    if (!document.getElementById('yn_btn_edit')) {
      const edit = document.createElement('div');
      edit.id = 'yn_btn_edit'; edit.className = 'yn-bar-btn fa-regular fa-pen-to-square'; edit.title = 'Modifier le dernier message';
      edit.onclick = () => { const last = document.querySelector('#chat .mes:last-of-type .mes_edit'); if (last) last.click(); };
      left.insertBefore(edit, left.firstChild);

      const persona = document.createElement('div');
      persona.id = 'yn_btn_persona'; persona.className = 'yn-bar-btn yn-caret'; persona.title = 'Persona';
      persona.onclick = () => click('#persona-management-button .drawer-toggle');
      left.appendChild(persona);

      const group = document.createElement('div');
      group.id = 'yn_btn_group'; group.className = 'yn-bar-btn yn-caret fa-solid fa-users'; group.title = 'Personnages';
      group.onclick = () => click('#rightNavHolder .drawer-toggle');
      right.insertBefore(group, right.firstChild);

      const arrow = document.createElement('div');
      arrow.id = 'yn_btn_arrow'; arrow.className = 'yn-bar-btn fa-solid fa-arrow-right'; arrow.title = 'Continuer';
      arrow.onclick = () => click('#mes_continue');
      right.insertBefore(arrow, document.getElementById('send_but'));
    }
    const persona = document.getElementById('yn_btn_persona');
    const src = personaSrc();
    if (persona) {
      const cur = persona.querySelector('img');
      if (src && (!cur || cur.src !== src)) persona.innerHTML = `<img src="${src}" alt="">`;
      else if (!src && !cur && !persona.firstChild) persona.innerHTML = '<span class="fa-solid fa-circle-user"></span>';
    }
  }

  function tick() { addFab(); addMenuItem(); document.querySelectorAll('#yn_btn_edit,#yn_btn_persona,#yn_btn_group,#yn_btn_arrow').forEach(e => e.remove()); }
  apply();
  const start = () => { tick(); setInterval(tick, 2500); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
