// Syllabus Controller
const Syllabus = require('../models/Syllabus');

const recentSyllabusCatalog = [
  {
    examName: 'NEET',
    subject: 'Physics',
    unit: 'Recent syllabus update',
    chapter: 'Mechanics, Thermodynamics, Electromagnetism, Waves and Modern Physics',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Mechanics', subtopics: ['Kinematics', 'Newton laws', 'Work, Energy and Power'] },
      { name: 'Thermodynamics', subtopics: ['Heat transfer', 'Laws of thermodynamics', 'Kinetic theory'] },
      { name: 'Modern Physics', subtopics: ['Dual nature', 'Atoms and nuclei', 'Semiconductors'] }
    ]
  },
  {
    examName: 'NEET',
    subject: 'Chemistry',
    unit: 'Recent syllabus update',
    chapter: 'Physical, Inorganic and Organic Chemistry core revisions',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Physical Chemistry', subtopics: ['Mole concept', 'Solutions', 'Electrochemistry'] },
      { name: 'Inorganic Chemistry', subtopics: ['Periodic table', 'Coordination compounds', 'p-block'] },
      { name: 'Organic Chemistry', subtopics: ['GOC', 'Hydrocarbons', 'Biomolecules'] }
    ]
  },
  {
    examName: 'NEET',
    subject: 'Biology',
    unit: 'Recent syllabus update',
    chapter: 'Cell biology, Genetics, Human physiology and Ecology',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Genetics', subtopics: ['Mendelian genetics', 'Inheritance', 'Molecular basis'] },
      { name: 'Human Physiology', subtopics: ['Digestive system', 'Circulation', 'Nervous system'] },
      { name: 'Ecology', subtopics: ['Ecosystem', 'Biodiversity', 'Environmental issues'] }
    ]
  },
  {
    examName: 'JEE Main',
    subject: 'Mathematics',
    unit: 'Recent syllabus update',
    chapter: 'Algebra, Calculus, Coordinate Geometry and Probability',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Calculus', subtopics: ['Limits', 'Differentiation', 'Integration'] },
      { name: 'Algebra', subtopics: ['Sequences and series', 'Complex numbers', 'Matrices'] },
      { name: 'Coordinate Geometry', subtopics: ['Straight lines', 'Circles', 'Conics'] }
    ]
  },
  {
    examName: 'JEE Main',
    subject: 'Physics',
    unit: 'Recent syllabus update',
    chapter: 'Electrostatics, Current Electricity, Optics, Thermodynamics and Modern Physics',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Electrostatics', subtopics: ['Coulomb law', 'Electric field', 'Potential'] },
      { name: 'Current Electricity', subtopics: ['Ohm law', 'Kirchhoff rules', 'Wheatstone bridge'] },
      { name: 'Modern Physics', subtopics: ['Photoelectric effect', 'Nuclear physics', 'Semiconductors'] }
    ]
  },
  {
    examName: 'JEE Main',
    subject: 'Chemistry',
    unit: 'Recent syllabus update',
    chapter: 'Physical, Inorganic and Organic Chemistry revisions',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Physical Chemistry', subtopics: ['Thermodynamics', 'Equilibrium', 'Electrochemistry'] },
      { name: 'Inorganic Chemistry', subtopics: ['Chemical bonding', 'Coordination chemistry', 'p-block'] },
      { name: 'Organic Chemistry', subtopics: ['Hydrocarbons', 'Carbonyl compounds', 'Amines'] }
    ]
  },
  {
    examName: 'JEE Advanced',
    subject: 'Physics',
    unit: 'Recent syllabus update',
    chapter: 'Advanced mechanics, E&M, optics and modern physics',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Mechanics', subtopics: ['Relative motion', 'Rotation', 'Gravitation'] },
      { name: 'Electromagnetism', subtopics: ['Magnetic field', 'Induction', 'AC circuits'] },
      { name: 'Modern Physics', subtopics: ['Quantum physics', 'Nuclear physics', 'Semiconductors'] }
    ]
  },
  {
    examName: 'UPSC',
    subject: 'General Studies',
    unit: 'Recent syllabus update',
    chapter: 'Polity, Economy, History, Geography, Environment and Current Affairs',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Polity', subtopics: ['Constitution', 'Governance', 'Fundamental rights'] },
      { name: 'Economy', subtopics: ['Budget', 'Inflation', 'Growth and development'] },
      { name: 'Current Affairs', subtopics: ['National issues', 'International relations', 'Government schemes'] }
    ]
  }
  ,
  {
    examName: 'Banking',
    subject: 'Quant & Reasoning',
    unit: 'Recent syllabus update',
    chapter: 'Quantitative aptitude, Reasoning ability and English language',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Quantitative Aptitude', subtopics: ['Number systems', 'Time & work', 'Profit & loss'] },
      { name: 'Reasoning', subtopics: ['Puzzles', 'Seating arrangement', 'Syllogism'] },
      { name: 'English', subtopics: ['Reading comprehension', 'Cloze test', 'Para jumbles'] }
    ]
  },
  {
    examName: 'SSC',
    subject: 'General Awareness & Quant',
    unit: 'Recent syllabus update',
    chapter: 'General awareness, reasoning and quantitative aptitude',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'General Awareness', subtopics: ['History', 'Geography', 'Polity'] },
      { name: 'Quantitative Aptitude', subtopics: ['Algebra', 'Arithmetic', 'Data interpretation'] },
      { name: 'English', subtopics: ['Grammar', 'Vocabulary', 'Comprehension'] }
    ]
  },
  {
    examName: 'Railway',
    subject: 'Aptitude & Reasoning',
    unit: 'Recent syllabus update',
    chapter: 'Arithmetic, reasoning and general science basics',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Arithmetic', subtopics: ['Percentages', 'Ratio & proportion', 'Mensuration'] },
      { name: 'Reasoning', subtopics: ['Coding-decoding', 'Series', 'Analogy'] },
      { name: 'Science', subtopics: ['Basic physics', 'Basic chemistry', 'Biology fundamentals'] }
    ]
  },
  {
    examName: 'CAT',
    subject: 'VARC, DILR, QA',
    unit: 'Recent syllabus update',
    chapter: 'Verbal ability, Data interpretation & logical reasoning, Quantitative ability',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'VARC', subtopics: ['RC passages', 'Para summary', 'Critical reasoning'] },
      { name: 'DILR', subtopics: ['Sets & venn', 'Tables', 'Graphs'] },
      { name: 'QA', subtopics: ['Arithmetic', 'Algebra', 'Geometry'] }
    ]
  },
  {
    examName: 'GATE',
    subject: 'Technical Subject & Aptitude',
    unit: 'Recent syllabus update',
    chapter: 'Core engineering topics and general aptitude',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Core Topics', subtopics: ['Engineering Mathematics', 'Subject-specific core concepts'] },
      { name: 'Aptitude', subtopics: ['Numerical ability', 'Logical reasoning'] },
      { name: 'Design & Analysis', subtopics: ['System design basics', 'Algorithms (select branches)'] }
    ]
  },
  {
    examName: 'CUET',
    subject: 'Domain & General Test',
    unit: 'Recent syllabus update',
    chapter: 'Domain-specific knowledge and general test',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Domain', subtopics: ['Subject fundamentals', 'Application-based questions'] },
      { name: 'General Test', subtopics: ['Reading comprehension', 'Current affairs', 'General knowledge'] },
      { name: 'Language', subtopics: ['English language', 'Comprehension'] }
    ]
  },
  {
    examName: 'NDA',
    subject: 'Mathematics & GAT',
    unit: 'Recent syllabus update',
    chapter: 'Mathematics and General Ability Test',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Mathematics', subtopics: ['Algebra', 'Trigonometry', 'Calculus basics'] },
      { name: 'GAT', subtopics: ['English', 'General knowledge', 'Physics basics'] },
      { name: 'Reasoning', subtopics: ['Pattern recognition', 'Series'] }
    ]
  },
  {
    examName: 'CLAT',
    subject: 'Legal Aptitude & English',
    unit: 'Recent syllabus update',
    chapter: 'Legal reasoning, logical reasoning, English comprehension',
    revisionYear: 2025,
    sourceLabel: 'Recent release',
    topics: [
      { name: 'Legal Aptitude', subtopics: ['Legal propositions', 'Fact & law analysis'] },
      { name: 'Logical Reasoning', subtopics: ['Syllogisms', 'Analytical reasoning'] },
      { name: 'English', subtopics: ['Reading comprehension', 'Vocabulary'] }
    ]
  }
];

const buildSearchableText = (entry) => {
  const topics = Array.isArray(entry.topics) ? entry.topics : [];
  const topicText = topics.flatMap(topic => [topic.name, ...(topic.subtopics || [])]).join(' ');
  return [entry.examName, entry.subject, entry.unit, entry.chapter, topicText].filter(Boolean).join(' ').toLowerCase();
};

const normalizeSyllabusEntry = (entry, source = 'database') => {
  const plainEntry = typeof entry.toObject === 'function' ? entry.toObject() : { ...entry };
  return {
    ...plainEntry,
    revisionYear: plainEntry.revisionYear || (plainEntry.createdAt ? new Date(plainEntry.createdAt).getFullYear() : 2025),
    sourceLabel: plainEntry.sourceLabel || (source === 'catalog' ? 'Recent release' : 'Stored syllabus')
  };
};

const getCombinedSyllabusEntries = ({ examName = '', subject = '', query = '' } = {}) => {
  const examFilter = examName.trim();
  const subjectFilter = subject.trim().toLowerCase();
  const queryFilter = query.trim().toLowerCase();

  const dbEntries = [];
  const catalogEntries = recentSyllabusCatalog.map(entry => normalizeSyllabusEntry(entry, 'catalog'));

  const allEntries = [...dbEntries, ...catalogEntries].filter(entry => {
    if (examFilter && entry.examName !== examFilter) return false;
    if (subjectFilter && entry.subject.toLowerCase() !== subjectFilter) return false;
    if (queryFilter && !buildSearchableText(entry).includes(queryFilter)) return false;
    return true;
  });

  const deduped = new Map();
  allEntries.forEach(entry => {
    const key = `${entry.examName}::${entry.subject}::${entry.chapter}`;
    deduped.set(key, entry);
  });

  return Array.from(deduped.values()).sort((left, right) => {
    const yearDiff = (right.revisionYear || 0) - (left.revisionYear || 0);
    if (yearDiff !== 0) return yearDiff;
    return `${left.examName} ${left.subject} ${left.chapter}`.localeCompare(`${right.examName} ${right.subject} ${right.chapter}`);
  });
};

// Get all exams syllabuses
exports.getAllSyllabuses = async (req, res) => {
  try {
    const { examName, subject, limit = 20, skip = 0 } = req.query;

    const dbQuery = {};
    if (examName) dbQuery.examName = examName;
    if (subject) dbQuery.subject = subject;

    const storedSyllabuses = await Syllabus.find(dbQuery).sort({ examName: 1, subject: 1, chapter: 1 });
    const combinedSyllabuses = getCombinedSyllabusEntries({ examName, subject });
    const merged = [...storedSyllabuses.map(entry => normalizeSyllabusEntry(entry)), ...combinedSyllabuses];

    const deduped = new Map();
    merged.forEach(entry => {
      const key = `${entry.examName}::${entry.subject}::${entry.chapter}`;
      deduped.set(key, entry);
    });

    const syllabuses = Array.from(deduped.values())
      .sort((left, right) => {
        const yearDiff = (right.revisionYear || 0) - (left.revisionYear || 0);
        if (yearDiff !== 0) return yearDiff;
        return `${left.examName} ${left.subject} ${left.chapter}`.localeCompare(`${right.examName} ${right.subject} ${right.chapter}`);
      })
      .slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    const total = deduped.size;

    res.json({
      success: true,
      syllabuses,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch syllabuses', error: error.message });
  }
};

// Get syllabus by exam
exports.getSyllabusByExam = async (req, res) => {
  try {
    const { examName } = req.params;

    const syllabuses = getCombinedSyllabusEntries({ examName });

    if (syllabuses.length === 0) {
      return res.status(404).json({ success: false, message: 'Syllabus not found for this exam' });
    }

    // Group by subject
    const groupedBySubject = syllabuses.reduce((acc, curr) => {
      if (!acc[curr.subject]) {
        acc[curr.subject] = [];
      }
      acc[curr.subject].push(curr);
      return acc;
    }, {});

    res.json({
      success: true,
      examName,
      subjects: groupedBySubject
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch syllabus', error: error.message });
  }
};

// Search syllabus
exports.searchSyllabus = async (req, res) => {
  try {
    const { query, examName } = req.query;

    const storedResults = await Syllabus.find(examName ? { examName } : {});
    const mergedResults = [
      ...storedResults.map(entry => normalizeSyllabusEntry(entry)),
      ...getCombinedSyllabusEntries({ examName, query })
    ];

    const deduped = new Map();
    mergedResults.forEach(entry => {
      const key = `${entry.examName}::${entry.subject}::${entry.chapter}`;
      if (buildSearchableText(entry).includes(String(query || '').trim().toLowerCase())) {
        deduped.set(key, entry);
      }
    });

    res.json({
      success: true,
      results: Array.from(deduped.values()).slice(0, 50)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed', error: error.message });
  }
};

// Get chapter details
exports.getChapterDetails = async (req, res) => {
  try {
    const { syllabusId } = req.params;

    const syllabus = await Syllabus.findById(syllabusId);

    if (!syllabus) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    res.json({
      success: true,
      chapter: syllabus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chapter details', error: error.message });
  }
};

// Get exam subjects
exports.getExamSubjects = async (req, res) => {
  try {
    const { examName } = req.params;

    const dbSubjects = await Syllabus.find({ examName }).distinct('subject');
    const catalogSubjects = getCombinedSyllabusEntries({ examName }).map(entry => entry.subject);
    const syllabuses = Array.from(new Set([...dbSubjects, ...catalogSubjects])).sort();

    res.json({
      success: true,
      examName,
      subjects: syllabuses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects', error: error.message });
  }
};

// Get chapters for a subject
exports.getChaptersBySubject = async (req, res) => {
  try {
    const { examName, subject } = req.params;

    const dbChapters = await Syllabus.find({ examName, subject }).distinct('chapter');
    const catalogChapters = getCombinedSyllabusEntries({ examName, subject }).map(entry => entry.chapter);
    const chapters = Array.from(new Set([...dbChapters, ...catalogChapters])).sort();

    res.json({
      success: true,
      examName,
      subject,
      chapters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chapters', error: error.message });
  }
};

module.exports = exports;
