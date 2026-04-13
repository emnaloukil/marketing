// src/data/teacherMockData.js
// Données mockées réalistes pour le Teacher Dashboard
// À remplacer par des appels API plus tard

// ── Teacher ───────────────────────────────────────────────────────────────────
export const mockTeacher = {
  id:        'teacher-001',
  firstName: 'Sophie',
  lastName:  'Marchand',
  email:     'sophie.marchand@edukids.fr',
  school:    'École Jules Ferry',
  className: 'CM2-A',
  avatar:    '👩‍🏫',
}

// ── Élèves ────────────────────────────────────────────────────────────────────
export const mockStudents = [
  { id: 's1', firstName: 'Lucas',    lastName: 'Dupont',   supportProfile: 'none',     score: 78, trend: 'up',   status: 'good',      lastSeen: '10:42', avatar: '🧒' },
  { id: 's2', firstName: 'Emma',     lastName: 'Moreau',   supportProfile: 'adhd',     score: 52, trend: 'down', status: 'warning',   lastSeen: '10:45', avatar: '👧' },
  { id: 's3', firstName: 'Noah',     lastName: 'Laurent',  supportProfile: 'dyslexia', score: 34, trend: 'down', status: 'alert',     lastSeen: '10:38', avatar: '🧒' },
  { id: 's4', firstName: 'Léa',      lastName: 'Benali',   supportProfile: 'autism',   score: 70, trend: 'up',   status: 'good',      lastSeen: '10:44', avatar: '👧' },
  { id: 's5', firstName: 'Hugo',     lastName: 'Rousseau', supportProfile: 'none',     score: 65, trend: 'stable', status: 'good',    lastSeen: '10:41', avatar: '🧒' },
  { id: 's6', firstName: 'Chloé',    lastName: 'Martin',   supportProfile: 'dyslexia', score: 41, trend: 'up',   status: 'warning',   lastSeen: '10:43', avatar: '👧' },
  { id: 's7', firstName: 'Antoine',  lastName: 'Bernard',  supportProfile: 'none',     score: 82, trend: 'up',   status: 'good',      lastSeen: '10:46', avatar: '🧒' },
  { id: 's8', firstName: 'Inès',     lastName: 'Thomas',   supportProfile: 'adhd',     score: 28, trend: 'down', status: 'alert',     lastSeen: '10:39', avatar: '👧' },
  { id: 's9', firstName: 'Mathis',   lastName: 'Petit',    supportProfile: 'none',     score: 71, trend: 'stable', status: 'good',   lastSeen: '10:47', avatar: '🧒' },
  { id: 's10',firstName: 'Camille',  lastName: 'Durand',   supportProfile: 'none',     score: 60, trend: 'up',   status: 'good',      lastSeen: '10:42', avatar: '👧' },
]

// ── Session active ─────────────────────────────────────────────────────────────
export const mockActiveSession = {
  id:         'session-001',
  title:      'Mathématiques — Les fractions',
  subject:    'mathematics',
  classId:    'CM2-A',
  status:     'active',
  startedAt:  '09:00',
  duration:   '47 min',
  classScore: 62,
  trend:      'improving',
  breakdown: {
    good:       6,
    warning:    2,
    alert:      2,
    total:      10,
  },
  buttonTotals: {
    understand:  42,
    confused:    18,
    overwhelmed:  8,
    help:         5,
  },
  scoreHistory: [38, 44, 50, 55, 58, 62],
}

// ── Sessions récentes ──────────────────────────────────────────────────────────
export const mockRecentSessions = [
  {
    id:         'session-002',
    title:      'Français — La conjugaison',
    subject:    'reading',
    date:       'Hier',
    duration:   '55 min',
    classScore: 74,
    trend:      'stable_good',
    students:   24,
  },
  {
    id:         'session-003',
    title:      'Sciences — Le cycle de l\'eau',
    subject:    'sciences',
    date:       'Lundi',
    duration:   '48 min',
    classScore: 58,
    trend:      'recovering',
    students:   23,
  },
  {
    id:         'session-004',
    title:      'Mathématiques — Fractions (intro)',
    subject:    'mathematics',
    date:       'Vendredi',
    duration:   '52 min',
    classScore: 45,
    trend:      'degrading',
    students:   24,
  },
]

// ── Planning ───────────────────────────────────────────────────────────────────
export const mockPlanning = [
  { id: 'p1', time: '11:00', subject: 'Français',        topic: 'La ponctuation',         color: '#FF6B6B', emoji: '📖' },
  { id: 'p2', time: '13:30', subject: 'Arts plastiques', topic: 'Projet saisons',          color: '#FFB347', emoji: '🎨' },
  { id: 'p3', time: '14:30', subject: 'Mathématiques',   topic: 'Exercices de révision',   color: '#9B8EFF', emoji: '🔢' },
  { id: 'p4', time: '15:30', subject: 'EPS',             topic: 'Jeux collectifs',         color: '#4ECDC4', emoji: '⚽' },
]

// ── Alertes ───────────────────────────────────────────────────────────────────
export const mockAlerts = [
  {
    id:       'a1',
    type:     'alert',
    student:  'Noah Laurent',
    message:  'Score en forte baisse depuis 3 sessions. Soutien recommandé.',
    profile:  'dyslexia',
    color:    '#FF6B6B',
    emoji:    '🔴',
  },
  {
    id:       'a2',
    type:     'alert',
    student:  'Inès Thomas',
    message:  'A appuyé "overwhelmed" 5 fois lors de la dernière session.',
    profile:  'adhd',
    color:    '#FF6B6B',
    emoji:    '🔴',
  },
  {
    id:       'a3',
    type:     'warning',
    student:  'Emma Moreau',
    message:  'Tendance à la baisse ce matin. À surveiller cet après-midi.',
    profile:  'adhd',
    color:    '#FFB347',
    emoji:    '🟡',
  },
  {
    id:       'a4',
    type:     'info',
    student:  'Classe CM2-A',
    message:  'Score global amélioré de +12 points ce matin. Bonne progression !',
    profile:  null,
    color:    '#4ECDC4',
    emoji:    '🟢',
  },
]

// ── Stats globales ─────────────────────────────────────────────────────────────
export const mockStats = [
  { label: 'Élèves actifs',    value: '24',  sub: 'sur 24 présents',  color: '#9B8EFF', icon: '👥', trend: null    },
  { label: 'Score moyen',      value: '62',  sub: '+8 vs hier',       color: '#4ECDC4', icon: '📊', trend: 'up'    },
  { label: 'En difficulté',    value: '4',   sub: 'besoin de soutien', color: '#FF6B6B', icon: '🔴', trend: 'down'  },
  { label: 'Sessions today',   value: '2',   sub: '1 en cours',       color: '#FFB347', icon: '⚡', trend: null    },
]