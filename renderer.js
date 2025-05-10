console.log("electronAPI exists:", typeof window.electronAPI);

const saveFile = window.electronAPI.getSavePath();
const journalFile = saveFile.replace('tasks.json', 'journal.json');

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closeBtn');
    const saveBtn = document.getElementById('saveBtn');
    const promptSelect = document.getElementById('dailyPrompt');
    const journalEntry = document.getElementById('journalEntry');
    const saveJournalBtn = document.getElementById('saveJournalBtn');
    const journalList = document.getElementById('journalList');
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const sidebarJournalList = document.getElementById('sidebarJournalList');
    const weatherResult = document.getElementById('weatherResult');

    const permanentPrompts = [
        "Diary Entry"
    ];

    const disposePrompts = [
        "What does it mean to dismantle a system from within? Is it possible?",
        "How do you balance listening with using your voice when advocating for others?",
        "What does transformative allyship look like in your relationships, not just in public?",
        "In what ways do you benefit from or resist systems of oppression, knowingly or unknowingly?",
        "How do educational institutions reinforce or challenge injustice?"
    ];

    

   

    const usedJournalData = JSON.parse(window.electronAPI.loadFile(journalFile) || '[]');
    const usedPrompts = usedJournalData.map(entry => entry.prompt);



    let prompts = disposePrompts.filter(p => !usedPrompts.includes(p));

    prompts = [...permanentPrompts, ...prompts];

    closeBtn.addEventListener('click', () => {
        window.electronAPI.closeWindow();
    });

    saveBtn.addEventListener('click', () => {
        console.log('Manual save');
        saveTasks(true);
    });

    toggleSidebar.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    function populatePromptDropdown() {
         
        promptSelect.innerHTML = '<option disabled selected>Select a prompt</option>';
        prompts.forEach(p => {
            const opt = document.createElement('option');
            opt.textContent = p;
            opt.value = p;
            promptSelect.appendChild(opt);
        });
    }

    function populateSidebarEntries() {
        sidebarJournalList.innerHTML = '';
        //journalList.innerHTML = '';
        const journalData = JSON.parse(window.electronAPI.loadFile(journalFile) || '[]');
        journalData.slice().reverse().forEach(entry => {
           
            const li = document.createElement('li');
            li.innerHTML = `<strong>${new Date(entry.timestamp).toLocaleString()}</strong><br>
                        <em>${entry.prompt}</em><br>${entry.response}`;
            sidebarJournalList.appendChild(li);
        });
    }

    async function fetchWeatherForBoston() {
        const city = "Boston";
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`);
            const geoData = await geoRes.json();
            if (!geoData.results || geoData.results.length === 0) throw new Error("City not found");

            const { latitude, longitude, name } = geoData.results[0];
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const weatherData = await weatherRes.json();
            const weather = weatherData.current_weather;
            const fahrenheit = (weather.temperature * 9/5) + 32;




            const weatherDescriptions = {
                0: "Clear sky ☀️",
                1: "Mainly clear 🌤️",
                2: "Partly cloudy ⛅",
                3: "Overcast ☁️",
                45: "Fog 🌫️",
                48: "Depositing rime fog 🌫️",
                51: "Light drizzle 🌦️",
                53: "Moderate drizzle 🌦️",
                55: "Dense drizzle 🌧️",
                61: "Light rain 🌧️",
                63: "Moderate rain 🌧️",
                65: "Heavy rain 🌧️",
                71: "Light snow 🌨️",
                73: "Moderate snow 🌨️",
                75: "Heavy snow ❄️",
                80: "Rain showers 🌦️",
                81: "Moderate rain showers 🌦️",
                82: "Violent rain showers 🌩️",
                95: "Thunderstorm ⛈️",
                96: "Thunderstorm with hail ⛈️",
                99: "Severe thunderstorm with hail 🌩️"
            };
            const description = weatherDescriptions[weather.weathercode] || "Unknown";

            weatherResult.textContent = `${name}: ${fahrenheit.toFixed(1)}°F, ${description}`;
        } catch (err) {
            console.error(err);
            weatherResult.textContent = "Could not fetch weather.";
        }
    }

    saveJournalBtn.addEventListener('click', () => {
        const text = journalEntry.value.trim();
        const selectedPrompt = promptSelect.value;

        if (!text || selectedPrompt === "Select a prompt") {
            alert("Please select a prompt and write your reflection.");
            return;
        }

        const entry = {
            prompt: selectedPrompt,
            response: text,
            timestamp: new Date().toISOString()
        };

        const previous = JSON.parse(window.electronAPI.loadFile(journalFile) || '[]');
        previous.push(entry);
        window.electronAPI.saveJournal(journalFile, JSON.stringify(previous, null, 2));

       

        if (!permanentPrompts.includes(selectedPrompt)) {
            prompts.splice(prompts.indexOf(selectedPrompt), 1);
        }


        populatePromptDropdown();
        populateSidebarEntries();
        journalEntry.value = '';
    });

    promptSelect.addEventListener('change', (e) => {
        journalEntry.value = e.target.value + ' ';
    });

    loadTasks();
    populatePromptDropdown();
    populateSidebarEntries();
    fetchWeatherForBoston();
});

function loadTasks() {
    const data = window.electronAPI.loadFile(saveFile);
    if (data) {
        try {
            const tasks = JSON.parse(data);
            tasks.forEach(task => createTask(task.text, task.checked));
        } catch (err) {
            console.error("Failed to parse tasks.json:", err);
            alert("Error: Your saved tasks are corrupted. Deleting file.");
            window.electronAPI.saveFile(saveFile, JSON.stringify([], null, 2));
        }
    }
}

function createTask(text, checked = false) {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    checkbox.addEventListener('change', saveTasks);

    const span = document.createElement('span');
    span.textContent = text;

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
    deleteBtn.className = 'task-delete-btn';
    deleteBtn.addEventListener('click', () => {
        li.remove();
        saveTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    document.getElementById('taskList').appendChild(li);
}

function saveTasks(showAlert = false) {
    const tasks = [];
    document.querySelectorAll('#taskList li').forEach(li => {
        const checkbox = li.querySelector('input[type="checkbox"]');
        const text = li.querySelector('span').textContent;
        tasks.push({ text, checked: checkbox.checked });
    });

    window.electronAPI.saveFile(saveFile, JSON.stringify(tasks, null, 2));

    if (showAlert) {
        alert("Tasks saved successfully!");
    }
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();

    if (text) {
        createTask(text);
        input.value = '';
        saveTasks();
    }
}
