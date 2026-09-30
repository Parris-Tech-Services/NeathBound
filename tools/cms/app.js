import { stories } from '../../src/game/content.js';

const listContainer = document.getElementById('storylet-list');
const formContainer = document.getElementById('form-container');
const emptyState = document.getElementById('empty-state');

const idInput = document.getElementById('story-id');
const titleInput = document.getElementById('story-title');
const kickerInput = document.getElementById('story-kicker');
const textInput = document.getElementById('story-text');
const saveBtn = document.getElementById('save-btn');

let currentStoryId = null;

// Populate the storylet list in the sidebar
function renderList() {
    listContainer.innerHTML = '';
    for (const [id, story] of Object.entries(stories)) {
        const div = document.createElement('div');
        div.className = 'storylet-item';
        div.textContent = story.title || id;
        div.addEventListener('click', () => selectStory(id));
        listContainer.appendChild(div);
    }
}

// Populate the editor form when a storylet is selected
function selectStory(id) {
    currentStoryId = id;
    const story = stories[id];
    
    idInput.value = id;
    titleInput.value = story.title || '';
    kickerInput.value = story.kicker || '';
    textInput.value = story.text || '';
    
    emptyState.style.display = 'none';
    formContainer.style.display = 'block';
}

// Stub for saving changes
saveBtn.addEventListener('click', () => {
    alert(`[CMS Stub] Would save changes for storylet: "${currentStoryId}"\n\nNew Title: ${titleInput.value}\nNew Kicker: ${kickerInput.value}`);
});

// Initialization
renderList();
