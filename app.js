// DOM SELECTION
const bodyEl = document.body;

// THE LOG SECTION
const winFormEl = document.getElementById('win-form');
const winInputEl = document.getElementById('win-input');
const charCountEl = document.getElementById('char-count');
const addWinBtnEl = document.getElementById('add-win-btn');

// STATS SECTION
const totalWinsEl = document.getElementById('total-wins');
const thisWeekEl = document.getElementById('this-week');
const thisMonthEl = document.getElementById('this-month');
// Evidence section - wins list
const winsListEl = document.getElementById('wins-list');
const emptyStateEl = document.getElementById('empty-state');

// Meaning-making
const reflectionBtnEl = document.getElementById('reflection-btn');
const reflectionTextEl = document.getElementById('reflection-text');

// Header (not tied to a model)
const themeToggleEl = document.getElementById('theme-toggle');

const wins = JSON.parse(localStorage.getItem('winlog-wins')) || [];
const savedTheme = localStorage.getItem('winlog-theme');

if(savedTheme === 'dark') {
    bodyEl.classList.add('dark');
    themeToggleEl.innerHTML = '<i class="fa-solid fa-sun"></i>';
}else {
    bodyEl.classList.remove('dark');
    themeToggleEl.innerHTML = '<i class="fa-solid fa-moon"></i>'
}

renderWins();

function addWin(e) {
    e.preventDefault();
    let userInput = winInputEl.value;
    if(userInput === '') return;

    let win = {
        id : Date.now(),
        text : userInput,
        timestamp : new Date()
    }
    wins.push(win)
    localStorage.setItem('winlog-wins',JSON.stringify(wins))    
    winInputEl.value = '';    
    renderWins()
    updateStats();
}

winFormEl.addEventListener('submit',addWin)

function renderWins() {
    winsListEl.innerHTML = '';
    if(wins.length === 0) {
        emptyStateEl.hidden = false;        
        return;
    }

    emptyStateEl.hidden = true;
    wins.forEach(win => {
        const card = document.createElement('div');
        card.className = 'win-card';
        card.innerHTML = `
            <p class = 'win-text'></p>
            <div class="win-meta">
                    <small class="win-time"></small>
                    <div class="win-actions">
                        <button class="edit-btn" data-id="${win.id}">Edit</button>
                        <button class="delete-btn" data-id="${win.id}">Delete</button>
                    </div>
            </div>
        `;
        
        const winTextEl = card.querySelector('.win-text');
        winTextEl.textContent = win.text;        

        const winTimeEl = card.querySelector('.win-time');
        const winDate = new Date(win.timestamp);
        winTimeEl.textContent = getRelativeTime(winDate);
        winTimeEl.title = winDate.toLocaleString();
        
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');        
        
        // Inline Edit Button
        editBtn.addEventListener('click',(e) => {

            const id = Number(e.target.dataset.id);
            const selectedWin = wins.find(item => item.id === id);

            if(editBtn.textContent === 'Edit') {
                const winTextEl = card.querySelector('.win-text');
                const editTextArea = document.createElement('textarea');
                editTextArea.className = 'edit-textarea';
                editTextArea.value = selectedWin.text;

                winTextEl.replaceWith(editTextArea);

                editBtn.textContent = 'Save';
                editBtn.style.background = 'green';
            }else {
                const editTextArea = card.querySelector('.edit-textarea');

                let newText = editTextArea.value;
                selectedWin.text = newText;                
                localStorage.setItem('winlog-wins',JSON.stringify(wins));    

                const newWinTextEl = document.createElement('p');
                newWinTextEl.className = 'win-text';
                newWinTextEl.textContent = newText;                
                editTextArea.replaceWith(newWinTextEl);
                editBtn.textContent = 'Edit';
                editBtn.style.background = '#171717';
            }            
        });

        deleteBtn.addEventListener('click',delWin);
        
        winsListEl.appendChild(card);
    });    
}

function getRelativeTime(date) {
    const now = Date.now();
    const timestamp = new Date(date).getTime();

    const diff = now - timestamp;
    const second = Math.floor(diff / 1000)    
    const minute = Math.floor(second / 60);    
    const hour = Math.floor(minute / 60);    
    const day = Math.floor(hour / 24)

    if(second < 60 ) {
        return 'Just now';
    }
    if(minute < 60) {
        return `${minute} minute${minute !== 1? 's': ''} ago`;
    }
    if(hour < 24) {
        return `${hour} hour${hour !== 1 ? 's' : ''} ago`;
    }

    if(day === 1) {
        return `Yesterday`
    }
    if(day < 7) {
        return `${day} days ago`
    }else {
        return new Date(date).toLocaleString();
    }
    
}


function updateStats() {
    const weekStart = new Date();
    const dayOfWeek = weekStart.getDay();    
    weekStart.setDate(weekStart.getDate() - dayOfWeek);    
    weekStart.setHours(0, 0, 0, 0);
    

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0,0,0,0);

    const weekWin = wins.filter(item =>new Date(item.timestamp) >= weekStart);
    const monthWin = wins.filter(item => new Date(item.timestamp) >= monthStart);

    const totalWins = wins.length;

    totalWinsEl.textContent = totalWins
    thisWeekEl.textContent = weekWin.length;
    thisMonthEl.textContent = monthWin.length;
}


// Delete wins in the card
function delWin(e) {    
    const id = Number(e.target.dataset.id);
    const filteredItem = wins.filter(item => item.id !== id);

    wins.length = 0;
    wins.push(...filteredItem)

    localStorage.setItem('winlog-wins',JSON.stringify(wins))    
    renderWins();
    updateStats();
}

// An event listener that handles toggling of theme
themeToggleEl.addEventListener('click',() => {
    bodyEl.classList.toggle('dark');
    if(bodyEl.classList.contains('dark')) {
        localStorage.setItem('winlog-theme','dark')        
        themeToggleEl.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }else {
        localStorage.setItem('winlog-theme','light');
        themeToggleEl.innerHTML = '<i class="fa-solid fa-moon"></i>'
    }
})

// This function get the month key for instance '2026-04' based on the parameter passed
function getMonthKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
    // For Instance 2026-05-22
}

// Returns the current Month key for instance '2026-09'
function getCurrentMonthKey() {
    return getMonthKey(new Date());    
}

// Returns the recent Month wins
function getLastMonthWins() {
    // Filtering for past wins
    const pastWins = wins.filter(win => getMonthKey(win.timestamp) !== getCurrentMonthKey());
    // pastWins = full WIN Objects from past months
    // e.g [{id,text,timestamp}]

    
    const monthKeys = pastWins.map(win => getMonthKey(win.timestamp));
    // for instance = ['2026-07','2026-08','2026-09'] for the month keys

    // Sorted and Mutated the Monthly keys 
    const sortedKey = [...monthKeys].sort();

    // Picked the last key in the sorted array
    const recentKey = sortedKey[sortedKey.length - 1];

    // Filtering the pastWins and checking each month key against the recent month
    const recentMonthWin = pastWins.filter(win => getMonthKey(win.timestamp) === recentKey)
    console.log('recentMonthwins',recentMonthWin)
    return recentMonthWin        
}


function isReflectionAvailable() {
    const targetWins = getLastMonthWins();
    if(targetWins.length === 0) return false;

    const targetMonthKey = getMonthKey(targetWins[0].timestamp)
    const cache = JSON.parse(localStorage.getItem('winlog-reflection'))

    return !cache || cache.month !== targetMonthKey;
}

loadReflection()
async function loadReflection() {
    if(!isReflectionAvailable())   return;

    const targetWins = getLastMonthWins();
    console.log('getlastmonth',getLastMonthWins())
    const targetMonthKey = getMonthKey(targetWins[0].timestamp);

    const cache = JSON.parse(localStorage.getItem('winlog-reflection'));

    if(cache && cache.month === targetMonthKey) {
        reflectionTextEl.textContent = cache.text;
        console.log('reflectionTextEl ',reflectionTextEl.textContent)
        return;
    }

        reflectionBtnEl.disabled = true;
        console.log('reflection',reflectionBtnEl.disabled)
        reflectionTextEl.textContent = 'Reflecting...';

        try {
            const response = await fetch('/api/reflect',{
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    count : targetWins.length,
                    wins : targetWins.map(w => w.text)
                })
            })

            if(!response.ok) {
                console.log('Status :',response.status)
                console.log('Response',await response.text())
                throw new Error('Something went wrong,Try again later');                
            }

            const data = response.json();
            const content = data.choices[0].message.content;        
            
        }catch(err) {
            console.log(err);
            reflectionTextEl.textContent = "Couldn't load your reflection right now. Try again later.";                      
        }    
        
        reflectionBtnEl.disabled = false;        
        console.log('reflection',reflectionBtnEl.disabled)
}

reflectionBtnEl.addEventListener('click',loadReflection)