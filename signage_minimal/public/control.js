// Minimal control script
let locations = [];
let selectedLocation = null;
let selectedScreen = null;
let lastFile = null;
const locEl = document.getElementById('locations');
const screensEl = document.getElementById('screens');
const drop = document.getElementById('drop');
const fileInput = document.getElementById('file');
const preview = document.getElementById('preview');
const uploadBtn = document.getElementById('uploadBtn');
const status = document.getElementById('status');

async function fetchScreens(){
  const res = await fetch('/api/screens');
  const data = await res.json();
  locations = data.locations;
  renderLocations();
}

function renderLocations(){
  locEl.innerHTML = '';
  locations.forEach(l => {
    const li = document.createElement('li');
    li.textContent = l.name;
    li.onclick = ()=> { selectLocation(l) };
    locEl.appendChild(li);
  });
}

function renderScreens(){
  screensEl.innerHTML = '';
  if(!selectedLocation){ screensEl.innerHTML = '<li style="color:#6b8799">Select location</li>'; return }
  selectedLocation.screens.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s.name;
    li.onclick = ()=> { selectScreen(s) };
    if(selectedScreen && selectedScreen.id===s.id) li.classList.add('selected');
    screensEl.appendChild(li);
  });
}

function selectLocation(l){
  selectedLocation = l;
  selectedScreen = null;
  renderLocations();
  renderScreens();
  setStatus('Selected ' + l.name);
}

function selectScreen(s){
  selectedScreen = s;
  renderScreens();
  setStatus('Selected screen: ' + s.name);
}

drop.addEventListener('click', ()=> fileInput.click());
drop.addEventListener('dragover', e=> { e.preventDefault(); drop.style.borderColor='#2b526d' });
drop.addEventListener('dragleave', ()=> drop.style.borderColor='rgba(255,255,255,.04)');
drop.addEventListener('drop', e=> { e.preventDefault(); drop.style.borderColor='rgba(255,255,255,.04)'; handleFiles(e.dataTransfer.files) });
fileInput.addEventListener('change', e=> handleFiles(e.target.files));

function handleFiles(files){
  if(!files || files.length===0) return;
  const f = files[0];
  lastFile = f;
  const url = URL.createObjectURL(f);
  preview.innerHTML = '';
  if(f.type.startsWith('video')) {
    const v = document.createElement('video'); v.src = url; v.controls=true; v.style.maxWidth='100%'; v.style.maxHeight='200px'; preview.appendChild(v);
  } else {
    const img = document.createElement('img'); img.src = url; img.style.maxWidth='100%'; preview.appendChild(img);
  }
  setStatus('Ready: ' + f.name);
}

uploadBtn.addEventListener('click', async ()=>{
  if(!selectedScreen) return setStatus('Pick a screen first');
  if(!lastFile) return setStatus('Choose a file first');
  setStatus('Uploading...');
  const form = new FormData();
  form.append('file', lastFile);
  form.append('screenId', selectedScreen.id);
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const j = await res.json();
    if(j.ok) setStatus('Uploaded & pushed ✓');
    else setStatus('Upload error');
  } catch (err) { setStatus('Upload failed'); console.error(err) }
});

function setStatus(t){ status.innerText = t }

fetchScreens();