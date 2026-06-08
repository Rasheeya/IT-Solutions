/**
 * Custom Select Dropdown
 * Replaces native <select> elements with styled custom dropdowns.
 * Applies to all elements with class "form-input" that are <select> tags.
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // Small delay to let Lucide icons initialize first
    setTimeout(initCustomSelects, 50);
  });

  function initCustomSelects() {
    const selects = document.querySelectorAll('select.form-input');
    selects.forEach(buildCustomSelect);
  }

  function buildCustomSelect(nativeSelect) {
    // Hide native select
    nativeSelect.style.display = 'none';

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';

    // Selected display
    const selected = document.createElement('div');
    selected.className = 'custom-select-trigger';

    // Get initial selected option text
    const initialOption = nativeSelect.options[nativeSelect.selectedIndex];
    const placeholderText = initialOption ? initialOption.textContent : 'Select';
    selected.innerHTML = '<span class="custom-select-text">' + placeholderText + '</span><svg class="custom-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    if (initialOption && initialOption.disabled) {
      selected.classList.add('placeholder');
    }

    wrapper.appendChild(selected);

    // Options panel
    const optionsPanel = document.createElement('div');
    optionsPanel.className = 'custom-select-options';

    Array.from(nativeSelect.options).forEach(function (option, index) {
      if (option.disabled && option.value === '') return; // Skip placeholder

      const customOption = document.createElement('div');
      customOption.className = 'custom-select-option';
      customOption.textContent = option.textContent;
      customOption.dataset.value = option.value;
      customOption.dataset.index = index;

      if (option.selected && !option.disabled) {
        customOption.classList.add('selected');
      }

      customOption.addEventListener('click', function (e) {
        e.stopPropagation();

        // Update native select
        nativeSelect.selectedIndex = index;
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));

        // Update display
        selected.querySelector('.custom-select-text').textContent = option.textContent;
        selected.classList.remove('placeholder');

        // Update selected state
        optionsPanel.querySelectorAll('.custom-select-option').forEach(function (opt) {
          opt.classList.remove('selected');
        });
        customOption.classList.add('selected');

        // Close dropdown
        wrapper.classList.remove('open');
      });

      optionsPanel.appendChild(customOption);
    });

    wrapper.appendChild(optionsPanel);

    // Insert after native select
    nativeSelect.parentNode.insertBefore(wrapper, nativeSelect.nextSibling);

    // Remove the old chevron-down icon if present
    const oldArrow = nativeSelect.parentNode.querySelector('.select-arrow');
    if (oldArrow) oldArrow.style.display = 'none';

    // Toggle dropdown
    selected.addEventListener('click', function (e) {
      e.stopPropagation();

      // Close all other open selects
      document.querySelectorAll('.custom-select.open').forEach(function (el) {
        if (el !== wrapper) el.classList.remove('open');
      });

      wrapper.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', function () {
      wrapper.classList.remove('open');
    });
  }
})();
