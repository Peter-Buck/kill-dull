(() => {
  const stage = document.querySelector('[data-guided-stage]');
  if (!stage) return;

  const next = stage.querySelector('[data-guided-next]');
  const back = stage.querySelector('[data-guided-back]');

  const showDirections = () => {
    stage.classList.add('is-directions');
    next?.setAttribute('aria-expanded', 'true');
    back?.focus({ preventScroll: true });
  };

  const showProposition = () => {
    stage.classList.remove('is-directions');
    next?.setAttribute('aria-expanded', 'false');
    next?.focus({ preventScroll: true });
  };

  next?.addEventListener('click', showDirections);
  back?.addEventListener('click', showProposition);

  stage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' && !stage.classList.contains('is-directions')) {
      showDirections();
    }
    if (event.key === 'ArrowLeft' && stage.classList.contains('is-directions')) {
      showProposition();
    }
  });
})();
