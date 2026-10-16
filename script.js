const form = document.querySelector('#observation-form');
const fields = { lake: document.querySelector('#lake'), date: document.querySelector('#date'), location: document.querySelector('#location'), details: document.querySelector('#details'), photo: document.querySelector('#photo'), frequency: document.querySelector('#frequency') };
const concernInputs = [...document.querySelectorAll('#concerns input')];
const storageKey = 'lakesignal-neighborhood-v1';
let illustrative = false;
let reportText = '';

const today = () => new Date().toISOString().slice(0, 10);
const safe = value => String(value ?? '').trim();
const concerns = () => concernInputs.filter(input => input.checked).map(input => input.value);
const state = () => ({ lake: safe(fields.lake.value), date: fields.date.value, location: safe(fields.location.value), details: safe(fields.details.value), photo: safe(fields.photo.value), frequency: fields.frequency.value, concerns: concerns(), illustrative });

function setError(id, message) {
  const element = document.querySelector(`#${id}-error`);
  element.textContent = message;
  const input = fields[id];
  if (input) { input.setAttribute('aria-invalid', Boolean(message)); input.setAttribute('aria-describedby', message ? `${id}-error` : ''); }
}

function validUrl(value) {
  if (!value) return true;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol); } catch { return false; }
}

function validate() {
  const s = state();
  setError('lake', s.lake ? '' : 'Name the lake or waterbody.');
  setError('date', s.date ? '' : 'Choose the observation date.');
  setError('location', s.location ? '' : 'Add a landmark or side of the lake.');
  setError('details', s.details.length >= 20 ? '' : 'Describe what you saw in at least 20 characters.');
  setError('photo', validUrl(s.photo) ? '' : 'Use a full http or https link.');
  document.querySelector('#concerns-error').textContent = s.concerns.length ? '' : 'Select at least one visible concern.';
  return Boolean(s.lake && s.date && s.location && s.details.length >= 20 && s.concerns.length && validUrl(s.photo));
}

function renderReadiness() {
  const s = state();
  const items = [
    ['Named waterbody', Boolean(s.lake)],
    ['Observation date', Boolean(s.date)],
    ['Specific place around the lake', Boolean(s.location)],
    ['Visible concern selected', s.concerns.length > 0],
    ['Detailed first-hand description', s.details.length >= 20],
    ['Photo or video link (optional)', Boolean(s.photo && validUrl(s.photo))],
  ];
  const list = document.querySelector('#checklist');
  list.replaceChildren(...items.map(([label, done]) => {
    const row = document.createElement('li'); row.className = done ? 'done' : '';
    const icon = document.createElement('span'); icon.className = 'check'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = done ? '✓' : '';
    const text = document.createElement('span'); text.textContent = label;
    row.append(icon, text); return row;
  }));
  const complete = items.slice(0, 5).every(([, done]) => done);
  const badge = document.querySelector('#readiness-badge');
  badge.textContent = complete ? 'Ready to review' : `${items.filter(([, done]) => done).length} of 5 essentials`;
  badge.classList.toggle('ready', complete);
  document.querySelector('#evidence-note').textContent = s.photo ? 'Check that the link opens and shows only content you have permission to share.' : 'Add a dated image link if it is safe to do so. The report is still useful without one.';
  document.querySelector('#details-count').textContent = `${fields.details.value.length} / 900`;
}

function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(state())); } catch { document.querySelector('#saved-indicator').textContent = 'Browser storage unavailable'; }
}

function hydrate(s) {
  for (const key of Object.keys(fields)) fields[key].value = s[key] ?? (key === 'frequency' ? 'Not sure' : '');
  concernInputs.forEach(input => { input.checked = Array.isArray(s.concerns) && s.concerns.includes(input.value); });
  illustrative = Boolean(s.illustrative);
  for (const id of ['lake', 'date', 'location', 'details', 'photo']) setError(id, '');
  document.querySelector('#concerns-error').textContent = '';
  renderReadiness();
}

function buildReport() {
  const s = state();
  const lines = [
    `Subject: Lake maintenance observation — ${s.lake}`,
    '',
    `Waterbody: ${s.lake}`,
    `Observed on: ${s.date}`,
    `Location: ${s.location}`,
    `Visible concern(s): ${s.concerns.join(', ')}`,
    `Seen before: ${s.frequency}`,
    '',
    'What I observed:',
    s.details,
    '',
    s.photo ? `Supporting image/video: ${s.photo}` : 'Supporting image/video: Not provided',
    '',
    'Requested action: Please inspect this location and advise whether maintenance or further assessment is needed.',
    '',
    'This report records visible observations only. It does not establish a source, pollutant, or measured water-quality result.',
  ];
  if (s.illustrative) lines.unshift('ILLUSTRATIVE EXAMPLE — DO NOT SUBMIT AS A REAL OBSERVATION', '');
  return lines.join('\n');
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!validate()) { const invalid = form.querySelector('[aria-invalid="true"]'); (invalid || form.querySelector('#concerns input')).focus(); return; }
  reportText = buildReport();
  document.querySelector('#report-output').textContent = reportText;
  document.querySelector('#output-note').textContent = illustrative ? 'This is a fictional example for exploring the prototype. Replace it with a real observation before using an official channel.' : 'Review this draft for accuracy, then copy or download it. You decide whether and where to send it.';
  document.querySelector('#output-panel').hidden = false;
  persist();
  document.querySelector('#output-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

form.addEventListener('input', event => {
  renderReadiness(); persist();
  const id = event.target.id;
  if (id && document.querySelector(`#${id}-error`)?.textContent) setError(id, '');
  if (event.target.type === 'checkbox') document.querySelector('#concerns-error').textContent = '';
});
form.addEventListener('change', () => { renderReadiness(); persist(); });

document.querySelector('#load-example').addEventListener('click', () => {
  hydrate({ lake: 'Ulsoor Lake', date: today(), location: 'Illustrative: near a walking path', details: 'Illustrative only: several pieces of floating litter are visible near the edge of the water. This example was not reported by an actual resident and should not be sent as a complaint.', photo: '', frequency: 'Not sure', concerns: ['Floating litter'], illustrative: true });
  document.querySelector('#output-panel').hidden = true;
  persist(); fields.lake.focus();
});

document.querySelector('#clear-button').addEventListener('click', () => {
  form.reset(); concernInputs.forEach(input => input.checked = false); illustrative = false; reportText = '';
  for (const id of ['lake','date','location','details','photo']) setError(id, '');
  document.querySelector('#concerns-error').textContent = '';
  document.querySelector('#output-panel').hidden = true;
  try { localStorage.removeItem(storageKey); } catch {}
  renderReadiness(); fields.lake.focus();
});

document.querySelector('#copy-button').addEventListener('click', async () => {
  const button = document.querySelector('#copy-button');
  try { await navigator.clipboard.writeText(reportText); button.textContent = 'Copied'; }
  catch { button.textContent = 'Copy unavailable'; }
  setTimeout(() => { button.textContent = 'Copy report'; }, 2800);
});

document.querySelector('#download-button').addEventListener('click', () => {
  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'lakesignal-report.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
});

try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (saved) hydrate(saved); else renderReadiness(); }
catch { renderReadiness(); }
