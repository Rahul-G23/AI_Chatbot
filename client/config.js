// Environment Configuration
const ENV = {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    ENV: process.env.NODE_ENV || 'development'
};

// For Frontend - update this in index.html
const CONFIG = {
    API_URL: 'http://localhost:5000/api',
    APP_NAME: 'ExamVerse AI',
    SUPPORTED_EXAMS: [
        'NEET', 'JEE Main', 'JEE Advanced', 'UPSC', 
        'KCET/KPSE', 'Banking', 'SSC', 'Railway', 
        'CAT', 'GATE', 'CUET', 'NDA', 'CLAT'
    ]
};
