// Weather page: the interval of the hourly table is chosen above the table
// itself. Changing it reloads the hourly forecast of the day that is open.
(function () {
  const select = document.getElementById('interval');
  if (!select || typeof window.showHourlyForecast !== 'function') return;

  let openDate = null;
  // The "Hourly forecast" link under each day calls showHourlyForecast(date)
  const show = window.showHourlyForecast;
  window.showHourlyForecast = function (date) {
    openDate = date;
    return show.apply(this, arguments);
  };

  select.addEventListener('change', () => {
    const block = document.getElementById('hourlyTableBlock');
    if (!openDate || !block || block.style.display === 'none') return;
    updateHourlyForecast(openDate);
  });
})();
