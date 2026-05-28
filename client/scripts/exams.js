// Exams Page Script

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadExams();
});

function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        document.body.classList.add('dark-mode');
    }
}

async function loadExams() {
    try {
        // Sample exam data (you can fetch from API)
        const exams = [
            {
                name: 'NEET',
                description: 'National Eligibility cum Entrance Test for medical professionals',
                date: '26 May 2024',
                questions: 180,
                duration: '3 hours'
            },
            {
                name: 'JEE Main',
                description: 'Joint Entrance Examination for engineering colleges',
                date: '09 April 2024',
                questions: 90,
                duration: '3 hours'
            },
            {
                name: 'JEE Advanced',
                description: 'Advanced level engineering entrance exam',
                date: '28 May 2024',
                questions: 162,
                duration: '3 hours per paper'
            },
            {
                name: 'UPSC',
                description: 'Union Public Service Commission Civil Services',
                date: '26 May 2024',
                questions: 100,
                duration: 'Variable'
            },
            {
                name: 'KCET',
                description: 'Karnataka Common Entrance Test',
                date: '15 May 2024',
                questions: 180,
                duration: '3 hours'
            },
            {
                name: 'Banking',
                description: 'Banking sector competitive exams',
                date: 'Various',
                questions: 100,
                duration: '1-2 hours'
            }
        ];

        const grid = document.getElementById('examsGrid');
        grid.innerHTML = '';

        exams.forEach(exam => {
            const card = document.createElement('div');
            card.className = 'exam-card';
            card.innerHTML = `
                <h2>${exam.name}</h2>
                <p>${exam.description}</p>
                <div class="exam-details">
                    <p><strong>Exam Date:</strong> ${exam.date}</p>
                    <p><strong>Questions:</strong> ${exam.questions}</p>
                    <p><strong>Duration:</strong> ${exam.duration}</p>
                </div>
                <button class="btn btn-primary" onclick="startPreparation('${exam.name}')">Start Preparing</button>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading exams:', error);
    }
}

function startPreparation(examName) {
    const token = getToken();
    if (token) {
        // Store selected exam
        localStorage.setItem('selectedExam', examName);
        window.location.href = '/dashboard';
    } else {
        window.location.href = '/register';
    }
}
