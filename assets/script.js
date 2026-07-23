const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const header = document.querySelector('.site-header');

let savedTheme = null;
try {
  savedTheme = localStorage.getItem('pawel-portfolio-theme');
} catch (error) {
  // Some embedded previews disable localStorage; the portfolio still works without it.
}
const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
root.dataset.theme = savedTheme || preferredTheme;

function updateThemeColor() {
  const color = root.dataset.theme === 'dark' ? '#090b12' : '#f4f5f8';
  document.querySelector('meta[name="theme-color"]').setAttribute('content', color);
}
updateThemeColor();

themeToggle.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem('pawel-portfolio-theme', root.dataset.theme);
  } catch (error) {
    // Theme persistence is optional in restricted previews.
  }
  updateThemeColor();
});

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  mobileMenu.classList.toggle('open', !isOpen);
  mobileMenu.setAttribute('aria-hidden', String(isOpen));
  document.body.classList.toggle('menu-open', !isOpen);
});

mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
});

document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));

const filters = document.querySelectorAll('.filter');
const projectCards = document.querySelectorAll('.project-card');

filters.forEach(button => {
  button.addEventListener('click', () => {
    filters.forEach(filter => filter.classList.remove('active'));
    button.classList.add('active');
    const selected = button.dataset.filter;

    projectCards.forEach(card => {
      const show = selected === 'all' || card.dataset.category === selected;
      card.classList.toggle('hidden', !show);
    });
  });
});

document.getElementById('year').textContent = new Date().getFullYear();



// AI parking image hydration
const aiSourceImages = new Map(
  [...document.querySelectorAll('[data-ai-source]')].map(image => [image.dataset.aiSource, image.currentSrc || image.src])
);
function hydrateAiImages(root = document) {
  root.querySelectorAll('[data-ai-card-shot], [data-ai-detail-shot]').forEach(image => {
    const key = image.dataset.aiCardShot || image.dataset.aiDetailShot;
    const source = aiSourceImages.get(key);
    if (source && !image.src) image.src = source;
  });
}
hydrateAiImages();

// Autonomous robot image hydration
const roboticsSourceImages = new Map(
  [...document.querySelectorAll('[data-robotics-source]')].map(image => [image.dataset.roboticsSource, image.currentSrc || image.src])
);

function hydrateRoboticsImages(root = document) {
  root.querySelectorAll('[data-robotics-card-shot], [data-robotics-detail-shot]').forEach(image => {
    const key = image.dataset.roboticsCardShot || image.dataset.roboticsDetailShot;
    const source = roboticsSourceImages.get(key);
    if (source && !image.src) image.src = source;
  });
}
hydrateRoboticsImages();

// Reptra image hydration and card carousel
const reptraSourceImages = new Map(
  [...document.querySelectorAll('[data-reptra-source]')].map(image => [image.dataset.reptraSource, image.currentSrc || image.src])
);

function hydrateReptraImages(root = document) {
  root.querySelectorAll('[data-reptra-card-shot], [data-reptra-detail-shot]').forEach(image => {
    const key = image.dataset.reptraCardShot || image.dataset.reptraDetailShot;
    const source = reptraSourceImages.get(key);
    if (source && !image.src) image.src = source;
  });
}
hydrateReptraImages();

const reptraGallery = document.querySelector('[data-reptra-gallery]');
if (reptraGallery) {
  const order = ['home', 'logger', 'stats', 'distribution', 'calendar'];
  const slots = [...reptraGallery.querySelectorAll('[data-reptra-card-shot]')];
  const dots = [...reptraGallery.querySelectorAll('[data-reptra-select]')];
  let activeIndex = 0;

  const showReptraSet = (name) => {
    const nextIndex = order.indexOf(name);
    if (nextIndex < 0) return;
    activeIndex = nextIndex;
    const names = [
      order[(activeIndex - 1 + order.length) % order.length],
      order[activeIndex],
      order[(activeIndex + 1) % order.length]
    ];
    slots.forEach((image, index) => {
      image.dataset.reptraCardShot = names[index];
      image.src = reptraSourceImages.get(names[index]) || '';
      image.alt = `Reptra ${names[index]} screen`;
    });
    dots.forEach(dot => dot.classList.toggle('active', dot.dataset.reptraSelect === name));
  };

  dots.forEach(dot => dot.addEventListener('click', event => {
    event.stopPropagation();
    showReptraSet(dot.dataset.reptraSelect);
  }));
  showReptraSet('home');
}

// Goldbridge screenshot switcher
const goldbridgeGallery = document.querySelector('[data-goldbridge-gallery]');

if (goldbridgeGallery) {
  const goldbridgeTabs = [...goldbridgeGallery.querySelectorAll('[data-goldbridge-tab]')];
  const goldbridgeShots = [...goldbridgeGallery.querySelectorAll('[data-goldbridge-shot]')];
  const shotNames = goldbridgeShots.map(shot => shot.dataset.goldbridgeShot);
  let currentShotIndex = 0;

  const showGoldbridgeShot = (name) => {
    const nextIndex = shotNames.indexOf(name);
    if (nextIndex === -1) return;
    currentShotIndex = nextIndex;

    goldbridgeTabs.forEach(tab => {
      const active = tab.dataset.goldbridgeTab === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    goldbridgeShots.forEach(shot => {
      shot.classList.toggle('active', shot.dataset.goldbridgeShot === name);
    });
  };

  goldbridgeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      showGoldbridgeShot(tab.dataset.goldbridgeTab);
    });
  });
}

// Project image lightbox
const lightbox = document.querySelector('.image-lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxCaption = document.querySelector('.lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxTrigger = document.querySelector('[data-lightbox-trigger]');

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
}

if (lightbox && lightboxTrigger && lightboxImage && lightboxCaption) {
  lightboxTrigger.addEventListener('click', () => {
    const activeImage = lightboxTrigger.querySelector('.goldbridge-shot.active');
    if (!activeImage) return;

    lightboxImage.src = activeImage.currentSrc || activeImage.src;
    lightboxImage.alt = activeImage.alt;
    lightboxCaption.textContent = activeImage.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lightboxClose?.focus();
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
      lightboxTrigger.focus();
    }
  });
}


  

// Full-screen Goldbridge case study
const goldbridgeProjectCard = document.querySelector('[data-project-card="goldbridge"]');
const goldbridgeDetail = document.querySelector('[data-project-detail="goldbridge"]');
const goldbridgeDetailScroll = document.querySelector('[data-project-detail-scroll]');
const openGoldbridgeButtons = document.querySelectorAll('[data-open-project-detail]');
const closeGoldbridgeButtons = document.querySelectorAll('[data-close-project-detail]');
const closeGoldbridgeLinks = document.querySelectorAll('[data-close-project-link]');
const detailThemeToggle = document.querySelector('.detail-theme-toggle');
let projectDetailReturnFocus = null;

function hydrateGoldbridgeDetailImages() {
  document.querySelectorAll('[data-detail-shot]').forEach(image => {
    const source = document.querySelector(`[data-goldbridge-shot="${image.dataset.detailShot}"]`);
    if (!source || image.src) return;
    image.src = source.currentSrc || source.src;
  });
}

function openGoldbridgeDetailUi(returnFocus = goldbridgeProjectCard) {
  if (!goldbridgeDetail) return;
  projectDetailReturnFocus = returnFocus;
  hydrateGoldbridgeDetailImages();
  goldbridgeDetail.classList.add('open');
  goldbridgeDetail.setAttribute('aria-hidden', 'false');
  document.body.classList.add('project-detail-open');
  if (goldbridgeDetailScroll) goldbridgeDetailScroll.scrollTop = 0;
  requestAnimationFrame(() => goldbridgeDetail.querySelector('[data-close-project-detail]')?.focus());
}

function closeGoldbridgeDetailUi() {
  if (!goldbridgeDetail || !goldbridgeDetail.classList.contains('open')) return;
  goldbridgeDetail.classList.remove('open');
  goldbridgeDetail.setAttribute('aria-hidden', 'true');
  if (!reptraDetail?.classList.contains('open') && !parkingDetail?.classList.contains('open') && !roboticsDetail?.classList.contains('open')) document.body.classList.remove('project-detail-open');
  projectDetailReturnFocus?.focus?.();
}


const reptraProjectCard = document.querySelector('[data-project-card="reptra"]');
const reptraDetail = document.querySelector('[data-project-detail="reptra"]');
const reptraDetailScroll = document.querySelector('[data-reptra-detail-scroll]');
const openReptraButtons = document.querySelectorAll('[data-open-reptra-detail]');
const closeReptraButtons = document.querySelectorAll('[data-close-reptra-detail]');
const closeReptraLinks = document.querySelectorAll('[data-close-reptra-link]');
const reptraDetailThemeToggle = document.querySelector('.reptra-detail-theme-toggle');
let reptraDetailReturnFocus = null;

function openReptraDetailUi(returnFocus = reptraProjectCard) {
  if (!reptraDetail) return;
  reptraDetailReturnFocus = returnFocus;
  hydrateReptraImages(reptraDetail);
  reptraDetail.classList.add('open');
  reptraDetail.setAttribute('aria-hidden', 'false');
  document.body.classList.add('project-detail-open');
  if (reptraDetailScroll) reptraDetailScroll.scrollTop = 0;
  requestAnimationFrame(() => reptraDetail.querySelector('[data-close-reptra-detail]')?.focus());
}

function closeReptraDetailUi() {
  if (!reptraDetail || !reptraDetail.classList.contains('open')) return;
  reptraDetail.classList.remove('open');
  reptraDetail.setAttribute('aria-hidden', 'true');
  if (!goldbridgeDetail?.classList.contains('open') && !parkingDetail?.classList.contains('open') && !roboticsDetail?.classList.contains('open')) document.body.classList.remove('project-detail-open');
  reptraDetailReturnFocus?.focus?.();
}

function navigateToReptraDetail(trigger) {
  reptraDetailReturnFocus = trigger || reptraProjectCard;
  if (window.location.hash !== '#project/reptra') {
    history.pushState({ project: 'reptra' }, '', '#project/reptra');
  }
  openReptraDetailUi(reptraDetailReturnFocus);
}

function navigateBackFromReptra() {
  if (history.state?.project === 'reptra') {
    history.back();
  } else {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    closeReptraDetailUi();
  }
}

openReptraButtons.forEach(button => button.addEventListener('click', event => {
  event.stopPropagation();
  navigateToReptraDetail(button);
}));

if (reptraProjectCard) {
  reptraProjectCard.addEventListener('click', event => {
    if (event.target.closest('button, a')) return;
    navigateToReptraDetail(reptraProjectCard);
  });
  reptraProjectCard.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target === reptraProjectCard) {
      event.preventDefault();
      navigateToReptraDetail(reptraProjectCard);
    }
  });
}

closeReptraButtons.forEach(button => button.addEventListener('click', navigateBackFromReptra));
closeReptraLinks.forEach(link => link.addEventListener('click', () => {
  history.replaceState(null, '', `${location.pathname}${location.search}#top`);
  closeReptraDetailUi();
}));
reptraDetailThemeToggle?.addEventListener('click', () => themeToggle?.click());


const parkingProjectCard = document.querySelector('[data-project-card="parking-ai"]');
const parkingDetail = document.querySelector('[data-project-detail="parking-ai"]');
const parkingDetailScroll = document.querySelector('[data-parking-detail-scroll]');
const openParkingButtons = document.querySelectorAll('[data-open-parking-detail]');
const closeParkingButtons = document.querySelectorAll('[data-close-parking-detail]');
const closeParkingLinks = document.querySelectorAll('[data-close-parking-link]');
const parkingDetailThemeToggle = document.querySelector('.parking-detail-theme-toggle');
let parkingDetailReturnFocus = null;

function openParkingDetailUi(returnFocus = parkingProjectCard) {
  if (!parkingDetail) return;
  parkingDetailReturnFocus = returnFocus;
  hydrateAiImages(parkingDetail);
  parkingDetail.classList.add('open');
  parkingDetail.setAttribute('aria-hidden', 'false');
  document.body.classList.add('project-detail-open');
  if (parkingDetailScroll) parkingDetailScroll.scrollTop = 0;
  requestAnimationFrame(() => parkingDetail.querySelector('[data-close-parking-detail]')?.focus());
}

function closeParkingDetailUi() {
  if (!parkingDetail || !parkingDetail.classList.contains('open')) return;
  parkingDetail.classList.remove('open');
  parkingDetail.setAttribute('aria-hidden', 'true');
  if (!goldbridgeDetail?.classList.contains('open') && !reptraDetail?.classList.contains('open') && !roboticsDetail?.classList.contains('open')) document.body.classList.remove('project-detail-open');
  parkingDetailReturnFocus?.focus?.();
}

function navigateToParkingDetail(trigger) {
  parkingDetailReturnFocus = trigger || parkingProjectCard;
  if (window.location.hash !== '#project/parking-ai') history.pushState({ project: 'parking-ai' }, '', '#project/parking-ai');
  openParkingDetailUi(parkingDetailReturnFocus);
}

function navigateBackFromParking() {
  if (history.state?.project === 'parking-ai') history.back();
  else {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    closeParkingDetailUi();
  }
}

openParkingButtons.forEach(button => button.addEventListener('click', event => {
  event.stopPropagation();
  navigateToParkingDetail(button);
}));
if (parkingProjectCard) {
  parkingProjectCard.addEventListener('click', event => {
    if (event.target.closest('button, a')) return;
    navigateToParkingDetail(parkingProjectCard);
  });
  parkingProjectCard.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target === parkingProjectCard) {
      event.preventDefault();
      navigateToParkingDetail(parkingProjectCard);
    }
  });
}
closeParkingButtons.forEach(button => button.addEventListener('click', navigateBackFromParking));
closeParkingLinks.forEach(link => link.addEventListener('click', () => {
  history.replaceState(null, '', `${location.pathname}${location.search}#top`);
  closeParkingDetailUi();
}));
parkingDetailThemeToggle?.addEventListener('click', () => themeToggle?.click());


const roboticsProjectCard = document.querySelector('[data-project-card="robotics-car"]');
const roboticsDetail = document.querySelector('[data-project-detail="robotics-car"]');
const roboticsDetailScroll = document.querySelector('[data-robotics-detail-scroll]');
const openRoboticsButtons = document.querySelectorAll('[data-open-robotics-detail]');
const closeRoboticsButtons = document.querySelectorAll('[data-close-robotics-detail]');
const closeRoboticsLinks = document.querySelectorAll('[data-close-robotics-link]');
const roboticsDetailThemeToggle = document.querySelector('.robotics-detail-theme-toggle');
let roboticsDetailReturnFocus = null;

function openRoboticsDetailUi(returnFocus = roboticsProjectCard) {
  if (!roboticsDetail) return;
  roboticsDetailReturnFocus = returnFocus;
  hydrateRoboticsImages(roboticsDetail);
  roboticsDetail.classList.add('open');
  roboticsDetail.setAttribute('aria-hidden', 'false');
  document.body.classList.add('project-detail-open');
  if (roboticsDetailScroll) roboticsDetailScroll.scrollTop = 0;
  requestAnimationFrame(() => roboticsDetail.querySelector('[data-close-robotics-detail]')?.focus());
}

function closeRoboticsDetailUi() {
  if (!roboticsDetail || !roboticsDetail.classList.contains('open')) return;
  roboticsDetail.classList.remove('open');
  roboticsDetail.setAttribute('aria-hidden', 'true');
  if (!goldbridgeDetail?.classList.contains('open') && !reptraDetail?.classList.contains('open') && !parkingDetail?.classList.contains('open')) {
    document.body.classList.remove('project-detail-open');
  }
  roboticsDetailReturnFocus?.focus?.();
}

function navigateToRoboticsDetail(trigger) {
  roboticsDetailReturnFocus = trigger || roboticsProjectCard;
  if (window.location.hash !== '#project/robotics-car') {
    history.pushState({ project: 'robotics-car' }, '', '#project/robotics-car');
  }
  openRoboticsDetailUi(roboticsDetailReturnFocus);
}

function navigateBackFromRobotics() {
  if (history.state?.project === 'robotics-car') {
    history.back();
  } else {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    closeRoboticsDetailUi();
  }
}

openRoboticsButtons.forEach(button => button.addEventListener('click', event => {
  event.stopPropagation();
  navigateToRoboticsDetail(button);
}));

if (roboticsProjectCard) {
  roboticsProjectCard.addEventListener('click', event => {
    if (event.target.closest('button, a')) return;
    navigateToRoboticsDetail(roboticsProjectCard);
  });
  roboticsProjectCard.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target === roboticsProjectCard) {
      event.preventDefault();
      navigateToRoboticsDetail(roboticsProjectCard);
    }
  });
}

closeRoboticsButtons.forEach(button => button.addEventListener('click', navigateBackFromRobotics));
closeRoboticsLinks.forEach(link => link.addEventListener('click', () => {
  history.replaceState(null, '', `${location.pathname}${location.search}#top`);
  closeRoboticsDetailUi();
}));
roboticsDetailThemeToggle?.addEventListener('click', () => themeToggle?.click());

function renderProjectRoute() {
  if (window.location.hash === '#project/goldbridge') {
    closeReptraDetailUi();
    closeParkingDetailUi();
    closeRoboticsDetailUi();
    openGoldbridgeDetailUi();
  } else if (window.location.hash === '#project/reptra') {
    closeGoldbridgeDetailUi();
    closeParkingDetailUi();
    closeRoboticsDetailUi();
    openReptraDetailUi();
  } else if (window.location.hash === '#project/parking-ai') {
    closeGoldbridgeDetailUi();
    closeReptraDetailUi();
    closeRoboticsDetailUi();
    openParkingDetailUi();
  } else if (window.location.hash === '#project/robotics-car') {
    closeGoldbridgeDetailUi();
    closeReptraDetailUi();
    closeParkingDetailUi();
    openRoboticsDetailUi();
  } else {
    closeGoldbridgeDetailUi();
    closeReptraDetailUi();
    closeParkingDetailUi();
    closeRoboticsDetailUi();
  }
}

function navigateToGoldbridgeDetail(trigger) {
  projectDetailReturnFocus = trigger || goldbridgeProjectCard;
  if (window.location.hash !== '#project/goldbridge') {
    history.pushState({ project: 'goldbridge' }, '', '#project/goldbridge');
  }
  openGoldbridgeDetailUi(projectDetailReturnFocus);
}

function navigateBackFromGoldbridge() {
  if (history.state?.project === 'goldbridge') {
    history.back();
  } else {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    closeGoldbridgeDetailUi();
  }
}

openGoldbridgeButtons.forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation();
    navigateToGoldbridgeDetail(button);
  });
});

if (goldbridgeProjectCard) {
  goldbridgeProjectCard.addEventListener('click', event => {
    if (event.target.closest('button, a')) return;
    navigateToGoldbridgeDetail(goldbridgeProjectCard);
  });
  goldbridgeProjectCard.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target === goldbridgeProjectCard) {
      event.preventDefault();
      navigateToGoldbridgeDetail(goldbridgeProjectCard);
    }
  });
}

closeGoldbridgeButtons.forEach(button => button.addEventListener('click', navigateBackFromGoldbridge));
closeGoldbridgeLinks.forEach(link => {
  link.addEventListener('click', () => {
    history.replaceState(null, '', `${location.pathname}${location.search}#top`);
    closeGoldbridgeDetailUi();
  });
});

detailThemeToggle?.addEventListener('click', () => themeToggle?.click());

// Reuse the existing image lightbox for screenshots on the detail screen.
let lastDetailLightboxTrigger = null;
window.addEventListener('keydown', event => {
  if (event.key === 'Escape') event.detailLightboxWasOpen = Boolean(lightbox?.classList.contains('open'));
}, true);

document.querySelectorAll('[data-detail-lightbox]').forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation();
    lastDetailLightboxTrigger = button;
    const image = button.querySelector('img') || document.querySelector(`[data-detail-shot="${button.dataset.detailLightbox}"]`);
    if (!image || !lightbox || !lightboxImage || !lightboxCaption) return;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lightboxClose?.focus();
  });
});

document.querySelectorAll('[data-scroll-detail]').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.scrollDetail)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

lightboxClose?.addEventListener('click', () => {
  if (lastDetailLightboxTrigger) requestAnimationFrame(() => lastDetailLightboxTrigger.focus());
});
lightbox?.addEventListener('click', event => {
  if (event.target === lightbox && lastDetailLightboxTrigger) {
    requestAnimationFrame(() => lastDetailLightboxTrigger.focus());
  }
});

window.addEventListener('popstate', renderProjectRoute);
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && event.detailLightboxWasOpen && lastDetailLightboxTrigger) {
    requestAnimationFrame(() => lastDetailLightboxTrigger.focus());
    return;
  }
  if (event.key === 'Escape' && goldbridgeDetail?.classList.contains('open') && !lightbox?.classList.contains('open')) {
    navigateBackFromGoldbridge();
  } else if (event.key === 'Escape' && reptraDetail?.classList.contains('open') && !lightbox?.classList.contains('open')) {
    navigateBackFromReptra();
  } else if (event.key === 'Escape' && parkingDetail?.classList.contains('open') && !lightbox?.classList.contains('open')) {
    navigateBackFromParking();
  } else if (event.key === 'Escape' && roboticsDetail?.classList.contains('open') && !lightbox?.classList.contains('open')) {
    navigateBackFromRobotics();
  }
});

renderProjectRoute();
