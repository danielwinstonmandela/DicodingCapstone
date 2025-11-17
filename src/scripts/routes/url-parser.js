const getActiveRoute = () => {
  const hash = window.location.hash.slice(1);
  return hash || '/';
};

export { getActiveRoute };
