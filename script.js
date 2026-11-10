(() => {
  'use strict';
  const PHONE = '910000000000'; // <-- replace with your WhatsApp number (country code + number, no + or spaces)
  const IMG = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=70`;
  const MENU = [
    {n:'Paneer Tikka', c:'Starters', p:280, e:'🧀', d:'Smoky tandoor-style paneer with peppers and mint chutney.', i:'photo-1567188040759-fb8a883dc6d8'},
    {n:'Butter Chicken', c:'Mains', p:420, e:'🍗', d:'Overnight-marinated chicken in a silky tomato and cashew gravy.', i:'photo-1603894584373-5ac82b2ae398'},
    {n:'Dum Biryani', c:'Mains', p:380, e:'🍚', d:'Aged basmati and whole spices, sealed and steamed on slow heat.', i:'photo-1563379091339-03b21ab4a4f8'},
    {n:'Masala Dosa', c:'Breakfast', p:160, e:'🥞', d:'Crisp fermented-rice crepe with spiced potato, sambar and chutneys.', i:'photo-1668236543090-82eba5ee5976'},
    {n:'Dal Tadka', c:'Mains', p:240, e:'🍲', d:'Yellow lentils finished with ghee, garlic and roasted cumin.', i:'photo-1546833998-877b37c2e5c6'},
    {n:'Gulab Jamun', c:'Sweets', p:150, e:'🍮', d:'Soft milk dumplings soaked in cardamom and rose syrup. Six pieces.', i:'photo-1666190092159-3171cf0fbb12'}
  ];
  const $ = (s, r = document) => r.querySelector(s);
  const order = {};
  const wa = t => `https://wa.me/${PHONE}?text=${encodeURIComponent(t)}`;
  const fix = img => img.addEventListener('error', () => img.remove(), {once: true});

  // nav
  const nav = $('#nav'), links = $('#links'), burger = $('#burger');
  addEventListener('scroll', () => nav.classList.toggle('s', scrollY > 40), {passive: true});
  burger.addEventListener('click', () => {
    const o = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', o);
  });
  links.addEventListener('click', e => { if (e.target.tagName === 'A') { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

  // menu
  const cats = ['All', ...new Set(MENU.map(m => m.c))];
  let cat = 'All';
  const tabs = $('#tabs'), grid = $('#grid');
  tabs.innerHTML = cats.map(c => `<button role="tab" class="${c === cat ? 'on' : ''}" data-c="${c}">${c}</button>`).join('');
  tabs.addEventListener('click', e => {
    if (!e.target.dataset.c) return;
    cat = e.target.dataset.c;
    tabs.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.c === cat));
    render();
  });
  function render() {
    grid.innerHTML = MENU.filter(m => cat === 'All' || m.c === cat).map(m => `
      <article class="item"><div class="im"><img src="${IMG(m.i)}" alt="${m.n}" loading="lazy" width="700" height="525"><span aria-hidden="true" style="position:absolute">${m.e}</span></div>
      <div class="body"><h3>${m.n}</h3><p>${m.d}</p>
      <div class="row"><span class="price">₹${m.p}</span><span data-n="${m.n}">${ctl(m.n)}</span></div></div></article>`).join('');
    grid.querySelectorAll('.im img').forEach(fix);
  }
  const ctl = n => order[n]
    ? `<span class="qty"><button data-a="-" data-n="${n}" aria-label="Remove one ${n}">−</button>${order[n]}<button data-a="+" data-n="${n}" aria-label="Add one ${n}">+</button></span>`
    : `<button class="add" data-a="+" data-n="${n}">Add</button>`;
  grid.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const n = b.dataset.n;
    order[n] = Math.max(0, (order[n] || 0) + (b.dataset.a === '+' ? 1 : -1));
    if (!order[n]) delete order[n];
    b.closest('[data-n]').innerHTML = ctl(n);
    cart();
  });
  const bar = $('#cart');
  function cart() {
    const items = Object.entries(order);
    const qty = items.reduce((s, [, q]) => s + q, 0);
    const tot = items.reduce((s, [n, q]) => s + q * MENU.find(m => m.n === n).p, 0);
    bar.hidden = !qty;
    $('#cart-info').textContent = `${qty} item${qty > 1 ? 's' : ''} · ₹${tot}`;
  }
  $('#cart-send').addEventListener('click', () => {
    const lines = Object.entries(order).map(([n, q]) => `${q} x ${n}`).join('\n');
    const tot = Object.entries(order).reduce((s, [n, q]) => s + q * MENU.find(m => m.n === n).p, 0);
    open(wa(`Hi Tanushree, I'd like to order:\n${lines}\nTotal: ₹${tot}`), '_blank', 'noopener');
  });
  $('#cart-clear').addEventListener('click', () => { Object.keys(order).forEach(k => delete order[k]); cart(); render(); });
  render();

  // gallery + lightbox
  const GAL = ['photo-1585937421612-70a008356fbe','photo-1603894584373-5ac82b2ae398','photo-1563379091339-03b21ab4a4f8','photo-1567188040759-fb8a883dc6d8','photo-1546833998-877b37c2e5c6','photo-1556910103-1c02745aae4d'];
  const gal = $('#gal'), lb = $('#lb');
  gal.innerHTML = GAL.map((id, i) => `<button aria-label="View photo ${i + 1}" data-i="${id}"><img src="${IMG(id)}" alt="Freshly cooked dish from Tanushree's kitchen, photo ${i + 1}" loading="lazy"></button>`).join('');
  gal.querySelectorAll('img').forEach(fix);
  gal.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const im = $('img', lb); im.src = `https://images.unsplash.com/${b.dataset.i}?auto=format&fit=crop&w=1400&q=80`; im.alt = $('img', b)?.alt || '';
    lb.hidden = false; $('button', lb).focus();
  });
  lb.addEventListener('click', () => lb.hidden = true);
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.hidden = true; });

  // testimonials
  const qs = [...document.querySelectorAll('blockquote')], dots = $('#dots');
  let cur = 0, timer;
  dots.innerHTML = qs.map((_, i) => `<button aria-label="Show review ${i + 1}"></button>`).join('');
  const show = i => { cur = i; qs.forEach((q, k) => q.classList.toggle('on', k === i)); [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i)); };
  const auto = () => { clearInterval(timer); timer = setInterval(() => show((cur + 1) % qs.length), 6000); };
  dots.addEventListener('click', e => { const i = [...dots.children].indexOf(e.target); if (i > -1) { show(i); auto(); } });
  show(0); auto();

  // contact
  $('#wa-main').href = wa("Hi Tanushree, I'd like to place an order.");
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    open(wa(`Hi Tanushree, I'm ${f.get('n')}.\n${f.get('m')}`), '_blank', 'noopener');
  });
  $('#yr').textContent = new Date().getFullYear();
})();
