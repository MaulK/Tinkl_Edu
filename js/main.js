window.onload = () => {
  loadData();
  initBackground();
  initInteraction();
  renderMap();
  requestAnimationFrame(renderLoop);
};
