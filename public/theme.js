(function () {
    const btn = document.getElementById('theme-toggle');

    function applyTheme(dark) {
        document.body.classList.toggle('dark', dark);
        if (btn) {
            btn.innerHTML = dark
                ? '<i class="fa-solid fa-sun"></i> Yorug\' rejim'
                : '<i class="fa-solid fa-moon"></i> Qorong\'i rejim';
        }
    }

    const saved = localStorage.getItem('theme');
    applyTheme(saved === 'dark');

    if (btn) {
        btn.addEventListener('click', function () {
            const isDark = !document.body.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            applyTheme(isDark);
        });
    }
})();
