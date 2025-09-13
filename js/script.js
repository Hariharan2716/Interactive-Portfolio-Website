// js/script.js
(function(){
// --- Helpers ---
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }


// Theme: load from localStorage
const body = document.body;
const themeToggle = qs('#theme-toggle');


function applyTheme(theme){
if(theme === 'dark') body.classList.add('dark');
else body.classList.remove('dark');
themeToggle.setAttribute('aria-pressed', theme === 'dark');
}

const saved = localStorage.getItem('theme') || 'light';
applyTheme(saved);


themeToggle.addEventListener('click', () => {
const isDark = body.classList.toggle('dark');
localStorage.setItem('theme', isDark ? 'dark' : 'light');
themeToggle.setAttribute('aria-pressed', isDark);
});

// --- Projects render + filtering ---
const projectsContainer = qs('#projects');
let projects = window.APP_PROJECTS || [];


function projectCardHTML(p){
return `
<article class="card" tabindex="0" aria-labelledby="proj-${p.id}-title">
<img src="${p.img}" alt="${p.title} screenshot" loading="lazy"/>
<h3 id="proj-${p.id}-title">${p.title}</h3>
<p>${p.desc}</p>
<div class="tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join(' ')}</div>
<a href="${p.url}" class="visit" aria-label="Visit ${p.title}">View</a>
</article>
`;
}


function renderProjects(filterTag = 'all'){
const html = projects
.filter(p => filterTag === 'all' || p.tags.includes(filterTag))
.map(projectCardHTML)
.join('');
projectsContainer.innerHTML = html || '<p>No matching projects.</p>';
}


renderProjects();

// Filter buttons
qsa('.filter-btn').forEach(btn => {
btn.addEventListener('click', () => {
qsa('.filter-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
const tag = btn.getAttribute('data-tag');
renderProjects(tag);
});


// keyboard support
btn.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') btn.click(); });
});


// --- Intersection Observer: subtle fade-in for cards ---
const observer = new IntersectionObserver(entries => {
entries.forEach(entry => {
if(entry.isIntersecting) entry.target.classList.add('in-view');
else entry.target.classList.remove('in-view');
});
}, { threshold: 0.12 });


// observe after rendering (initially and after filter)
function observeCards(){
qsa('.card').forEach(c => observer.observe(c));
}
// observe after a tiny delay to ensure DOM updated
setTimeout(observeCards, 100);

// Re-observe when content changes (simple hack: observe on every render)
const originalRender = renderProjects;
renderProjects = function(tag){
originalRender(tag);
setTimeout(observeCards, 50);
};


// --- Contact form validation ---
const form = qs('#contactForm');
const status = qs('#form-status');


function showError(input, message){
const small = input.closest('label').querySelector('small.error');
small.textContent = message;
small.setAttribute('aria-hidden', 'false');
input.setAttribute('aria-invalid', 'true');
}
function clearError(input){
const small = input.closest('label').querySelector('small.error');
small.textContent = '';
small.setAttribute('aria-hidden', 'true');
input.removeAttribute('aria-invalid');
}


function validateEmail(email){
const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return re.test(email);
}


form.addEventListener('submit', (e) => {
e.preventDefault();
const name = form.name;
const email = form.email;
const message = form.message;


let valid = true;
if(!name.value.trim()){ showError(name, 'Name is required'); valid = false; } else clearError(name);
if(!validateEmail(email.value)){ showError(email, 'Enter a valid email'); valid = false; } else clearError(email);
if(message.value.trim().length < 10){ showError(message, 'Message should be at least 10 characters'); valid = false; } else clearError(message);


if(!valid){ status.textContent = 'Please fix errors above.'; return; }


// Simulate success (replace with real endpoint later)
status.textContent = 'Sending...';
setTimeout(() => {
status.textContent = 'Message sent — thanks!';
form.reset();
}, 600);
});


})();