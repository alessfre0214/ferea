interface Servicio {
  nombre: string;
  descripcion: string;
  precio: string;
}

interface Testimonio {
  nombre: string;
  texto: string;
  estrellas: number;
}

interface Pago {
  nombre: string;
  descripcion: string;
}

interface Horario {
  dias: string;
  horario: string;
}

interface Highlight {
  texto: string;
}

interface ItemsFile<T> {
  items?: T[];
}

interface GeneralContent {
  hero_titulo?: string;
  hero_subtitulo?: string;
  agenda_texto?: string;
  agenda_url?: string;
  servicios_titulo?: string;
  galeria_titulo?: string;
  estudio_eyebrow?: string;
  estudio_titulo?: string;
  estudio_parrafo_1?: string;
  estudio_parrafo_2?: string;
  estudio_imagen?: string;
  estudio_highlights?: Highlight[];
  testimonios_titulo?: string;
  testimonios_intro?: string;
  pagos_titulo?: string;
  pagos_intro?: string;
  footer_tagline?: string;
  whatsapp_texto?: string;
  whatsapp_url?: string;
  instagram_texto?: string;
  instagram_url?: string;
  horarios?: Horario[];
  ubicacion_linea1?: string;
  ubicacion_linea2?: string;
  mapa_url?: string;
  mapa_texto?: string;
  copyright?: string;
}

document.addEventListener('DOMContentLoaded', () => {
  void bootstrap();
});

async function bootstrap(): Promise<void> {
  await loadSiteContent();
  initHamburgerMenu();
  initSmoothScroll();
  initLightbox();
  initAgendaButtons();
  initAnimations();
}

async function loadSiteContent(): Promise<void> {
  const [servicios, testimonios, pagos, general] = await Promise.all([
    fetchJson<ItemsFile<Servicio>>('content/servicios.json'),
    fetchJson<ItemsFile<Testimonio>>('content/testimonios.json'),
    fetchJson<ItemsFile<Pago>>('content/pagos.json'),
    fetchJson<GeneralContent>('content/general.json'),
  ]);

  const servicioItems = servicios?.items ?? [];
  const testimonioItems = testimonios?.items ?? [];
  const pagoItems = pagos?.items ?? [];
  const generalData = general ?? {};

  renderGeneral(generalData);
  renderServicios(servicioItems);
  renderTestimonios(testimonioItems);
  renderPagos(pagoItems);
  renderEstudio(generalData);
  renderFooterBlocks(generalData);

  toggleSection('servicios', servicioItems.length > 0);
  toggleSection('testimonios', testimonioItems.length > 0);
  toggleSection('pagos', pagoItems.length > 0);
  toggleSection('estudio', hasEstudioContent(generalData));
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function renderGeneral(data: GeneralContent): void {
  setText('hero_titulo', data.hero_titulo);
  setText('hero_subtitulo', data.hero_subtitulo);
  setText('servicios_titulo', data.servicios_titulo);
  setText('galeria_titulo', data.galeria_titulo);
  setText('testimonios_titulo', data.testimonios_titulo);
  setText('testimonios_intro', data.testimonios_intro);
  setText('pagos_titulo', data.pagos_titulo);
  setText('pagos_intro', data.pagos_intro);
  setText('footer_tagline', data.footer_tagline);
  setText('copyright', data.copyright);

  const agendaText = data.agenda_texto?.trim();
  const agendaUrl = data.agenda_url?.trim();

  document.querySelectorAll<HTMLAnchorElement>('[data-agenda]').forEach((button) => {
    if (agendaText) button.textContent = agendaText;
    if (agendaUrl) button.href = agendaUrl;
  });
}

function renderServicios(items: Servicio[]): void {
  const grid = document.querySelector<HTMLElement>('[data-list="servicios"]');
  if (!grid) return;

  grid.innerHTML = items
    .map(
      (item) => `
        <div class="servicio">
          <h3>${escapeHtml(item.nombre)}</h3>
          <p>${escapeHtml(item.descripcion)}</p>
          <span class="precio">${escapeHtml(item.precio)}</span>
        </div>
      `
    )
    .join('');
}

function renderTestimonios(items: Testimonio[]): void {
  const grid = document.querySelector<HTMLElement>('[data-list="testimonios"]');
  if (!grid) return;

  grid.innerHTML = items
    .map((item) => {
      const stars = clampStars(item.estrellas);
      const starsLabel = `${stars} de 5 estrellas`;
      return `
        <article class="testimonio">
          <p class="testimonio-stars" aria-label="${starsLabel}">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</p>
          <p class="testimonio-texto">“${escapeHtml(item.texto)}”</p>
          <p class="testimonio-autor">${escapeHtml(item.nombre)}</p>
        </article>
      `;
    })
    .join('');
}

function renderPagos(items: Pago[]): void {
  const list = document.querySelector<HTMLElement>('[data-list="pagos"]');
  if (!list) return;

  list.innerHTML = items
    .map(
      (item) => `
        <li class="pago-item">
          <span class="pago-label">${escapeHtml(item.nombre)}</span>
          <span class="pago-desc">${escapeHtml(item.descripcion)}</span>
        </li>
      `
    )
    .join('');
}

function renderEstudio(data: GeneralContent): void {
  setText('estudio_eyebrow', data.estudio_eyebrow);
  setText('estudio_titulo', data.estudio_titulo);
  setText('estudio_parrafo_1', data.estudio_parrafo_1);
  setText('estudio_parrafo_2', data.estudio_parrafo_2);

  const image = document.querySelector<HTMLImageElement>('[data-field="estudio_imagen"]');
  if (image && data.estudio_imagen?.trim()) {
    image.src = data.estudio_imagen.trim();
  }

  const highlights = (data.estudio_highlights ?? []).filter((item) => item.texto?.trim());
  const list = document.querySelector<HTMLElement>('[data-list="estudio_highlights"]');
  if (list) {
    list.innerHTML = highlights
      .map((item) => `<li>${escapeHtml(item.texto)}</li>`)
      .join('');
    list.hidden = highlights.length === 0;
  }
}

function renderFooterBlocks(data: GeneralContent): void {
  const whatsappLink = document.querySelector<HTMLAnchorElement>('[data-field="whatsapp"]');
  const whatsappWrap = document.querySelector<HTMLElement>('[data-field="whatsapp_wrap"]');
  if (whatsappLink && data.whatsapp_texto?.trim()) {
    whatsappLink.textContent = data.whatsapp_texto.trim();
    if (data.whatsapp_url?.trim()) whatsappLink.href = data.whatsapp_url.trim();
  } else if (whatsappWrap) {
    whatsappWrap.hidden = true;
  }

  const instagramLink = document.querySelector<HTMLAnchorElement>('[data-field="instagram"]');
  const instagramWrap = document.querySelector<HTMLElement>('[data-field="instagram_wrap"]');
  if (instagramLink && data.instagram_texto?.trim()) {
    instagramLink.textContent = data.instagram_texto.trim();
    if (data.instagram_url?.trim()) instagramLink.href = data.instagram_url.trim();
  } else if (instagramWrap) {
    instagramWrap.hidden = true;
  }

  const horarios = (data.horarios ?? []).filter(
    (item) => item.dias?.trim() || item.horario?.trim()
  );
  const horariosList = document.querySelector<HTMLElement>('[data-list="horarios"]');
  const horariosBlock = document.querySelector<HTMLElement>('[data-block="horarios"]');
  if (horariosList && horariosBlock) {
    horariosList.innerHTML = horarios
      .map(
        (item) =>
          `<p>${escapeHtml(item.dias)}${item.dias && item.horario ? ': ' : ''}${escapeHtml(item.horario)}</p>`
      )
      .join('');
    horariosBlock.hidden = horarios.length === 0;
  }

  const ubicacionLine1 = data.ubicacion_linea1?.trim() ?? '';
  const ubicacionLine2 = data.ubicacion_linea2?.trim() ?? '';
  const ubicacionEl = document.querySelector<HTMLElement>('[data-field="ubicacion"]');
  const ubicacionBlock = document.querySelector<HTMLElement>('[data-block="ubicacion"]');
  const mapaLink = document.querySelector<HTMLAnchorElement>('[data-field="mapa"]');

  if (ubicacionEl && ubicacionBlock) {
    const hasUbicacion = Boolean(ubicacionLine1 || ubicacionLine2);
    if (hasUbicacion) {
      ubicacionEl.innerHTML = [ubicacionLine1, ubicacionLine2]
        .filter(Boolean)
        .map((line) => escapeHtml(line))
        .join('<br>');
    }
    ubicacionBlock.hidden = !hasUbicacion;

    if (mapaLink) {
      if (data.mapa_texto?.trim()) mapaLink.textContent = data.mapa_texto.trim();
      if (data.mapa_url?.trim()) mapaLink.href = data.mapa_url.trim();
      mapaLink.hidden = !data.mapa_url?.trim();
    }
  }
}

function hasEstudioContent(data: GeneralContent): boolean {
  const highlights = (data.estudio_highlights ?? []).filter((item) => item.texto?.trim());
  return Boolean(
    data.estudio_titulo?.trim() ||
      data.estudio_parrafo_1?.trim() ||
      data.estudio_parrafo_2?.trim() ||
      highlights.length > 0
  );
}

function toggleSection(name: string, visible: boolean): void {
  const section = document.querySelector<HTMLElement>(`[data-section="${name}"]`);
  if (section) {
    section.hidden = !visible;
  }

  document.querySelectorAll<HTMLAnchorElement>(`[data-nav="${name}"]`).forEach((link) => {
    link.hidden = !visible;
  });
}

function setText(field: string, value: string | undefined): void {
  const el = document.querySelector<HTMLElement>(`[data-field="${field}"]`);
  if (!el || value === undefined) return;
  el.textContent = value;
}

function clampStars(value: number): number {
  if (!Number.isFinite(value)) return 5;
  return Math.min(5, Math.max(1, Math.round(value)));
}

function escapeHtml(value: string | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initHamburgerMenu(): void {
  const hamburger = document.querySelector<HTMLButtonElement>('.hamburger');
  const nav = document.querySelector<HTMLElement>('.nav');

  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
  });

  nav.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      nav.classList.remove('active');
    });
  });
}

function initSmoothScroll(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target || (target as HTMLElement).hidden) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initLightbox(): void {
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>('.galeria-grid img')
  );

  if (images.length === 0) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Vista ampliada de la galería');
  lightbox.innerHTML = `
    <button type="button" class="lightbox__close" aria-label="Cerrar">&times;</button>
    <button type="button" class="lightbox__prev" aria-label="Imagen anterior">&#10094;</button>
    <div class="lightbox__content">
      <img class="lightbox__image" src="" alt="">
    </div>
    <button type="button" class="lightbox__next" aria-label="Imagen siguiente">&#10095;</button>
  `;

  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector<HTMLImageElement>('.lightbox__image');
  const closeBtn = lightbox.querySelector<HTMLButtonElement>('.lightbox__close');
  const prevBtn = lightbox.querySelector<HTMLButtonElement>('.lightbox__prev');
  const nextBtn = lightbox.querySelector<HTMLButtonElement>('.lightbox__next');

  if (!lightboxImage || !closeBtn || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  const showImage = (index: number): void => {
    currentIndex = (index + images.length) % images.length;
    const source = images[currentIndex];
    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = source.alt || 'Imagen de la galería';
  };

  const open = (index: number): void => {
    showImage(index);
    lightbox.classList.add('is-open');
    document.body.classList.add('lightbox-open');
  };

  const close = (): void => {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
  };

  const showPrev = (): void => showImage(currentIndex - 1);
  const showNext = (): void => showImage(currentIndex + 1);

  images.forEach((image, index) => {
    image.addEventListener('click', () => open(index));
  });

  closeBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    close();
  });

  prevBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    showPrev();
  });

  nextBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    showNext();
  });

  lightboxImage.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  lightbox.addEventListener('click', close);

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      close();
    } else if (event.key === 'ArrowLeft') {
      showPrev();
    } else if (event.key === 'ArrowRight') {
      showNext();
    }
  });
}

function initAgendaButtons(): void {
  const agendaButtons = document.querySelectorAll<HTMLAnchorElement>(
    '.btn-agenda, .btn-primary'
  );

  agendaButtons.forEach((button) => {
    button.setAttribute('target', '_blank');
    button.setAttribute('rel', 'noopener noreferrer');

    button.addEventListener('click', () => {
      if (typeof gsap === 'undefined') return;

      gsap.fromTo(
        button,
        { scale: 1 },
        {
          scale: 0.96,
          duration: 0.12,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
        }
      );
    });
  });
}

function initAnimations(): void {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    return;
  }

  animateHero();
  animateGallery();
  animateEstudio();
  animateTestimonios();
  animatePagos();
  animateButtonHovers();
}

function animateHero(): void {
  const heroTitle = document.querySelector('.hero h2');
  const heroText = document.querySelector('.hero p');
  const heroButton = document.querySelector('.hero .btn-primary');

  if (!heroTitle && !heroText && !heroButton) return;

  const timeline = gsap.timeline({
    defaults: { ease: 'power2.out', duration: 0.9 },
  });

  if (heroTitle) {
    timeline.from(heroTitle, { opacity: 0, y: 28 });
  }

  if (heroText) {
    timeline.from(heroText, { opacity: 0, y: 20 }, '-=0.55');
  }

  if (heroButton) {
    timeline.from(heroButton, { opacity: 0, y: 16, duration: 0.75 }, '-=0.45');
  }
}

function animateGallery(): void {
  const galleryHeading = document.querySelector('.galeria h2');
  const galleryImages = document.querySelectorAll('.galeria-grid img');

  if (galleryHeading) {
    gsap.from(galleryHeading, {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.galeria',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  if (galleryImages.length === 0) return;

  gsap.from(galleryImages, {
    opacity: 0,
    y: 36,
    duration: 0.85,
    ease: 'power2.out',
    stagger: 0.12,
    scrollTrigger: {
      trigger: '.galeria-grid',
      start: 'top 82%',
      toggleActions: 'play none none none',
    },
  });
}

function animateEstudio(): void {
  const section = document.querySelector<HTMLElement>('.estudio');
  if (!section || section.hidden) return;

  const media = document.querySelector('.estudio-media');
  const content = document.querySelector('.estudio-content');

  if (!media && !content) return;

  const timeline = gsap.timeline({
    defaults: { ease: 'power2.out', duration: 0.85 },
    scrollTrigger: {
      trigger: '.estudio',
      start: 'top 78%',
      toggleActions: 'play none none none',
    },
  });

  if (media) {
    timeline.from(media, { opacity: 0, x: -24 });
  }

  if (content) {
    timeline.from(content, { opacity: 0, x: 24 }, '-=0.55');
  }
}

function animateTestimonios(): void {
  const section = document.querySelector<HTMLElement>('.testimonios');
  if (!section || section.hidden) return;

  const heading = document.querySelector('.testimonios h2');
  const cards = document.querySelectorAll('.testimonio');

  if (heading) {
    gsap.from(heading, {
      opacity: 0,
      y: 22,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.testimonios',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  if (cards.length === 0) return;

  gsap.from(cards, {
    opacity: 0,
    y: 28,
    duration: 0.8,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: '.testimonios-grid',
      start: 'top 82%',
      toggleActions: 'play none none none',
    },
  });
}

function animatePagos(): void {
  const section = document.querySelector<HTMLElement>('.pagos');
  if (!section || section.hidden) return;

  const items = document.querySelectorAll('.pago-item');
  if (items.length === 0) return;

  gsap.from(items, {
    opacity: 0,
    y: 18,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.08,
    scrollTrigger: {
      trigger: '.pagos',
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });
}

function animateButtonHovers(): void {
  const buttons = document.querySelectorAll<HTMLAnchorElement>(
    '.btn-agenda, .btn-primary'
  );

  buttons.forEach((button) => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        y: -3,
        scale: 1.03,
        duration: 0.28,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        y: 0,
        scale: 1,
        duration: 0.32,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  });
}
