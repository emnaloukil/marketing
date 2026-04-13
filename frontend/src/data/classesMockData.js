// src/data/classesMockData.js
// Données mockées pour la page "My Classes"
// À remplacer par des appels API plus tard

export const mockClasses = [
  {
    id:           'class-001',
    name:         'CM2-A',
    level:        'CM2',
    subject:      'All subjects',
    studentCount: 24,
    color:        '#9B8EFF',
    emoji:        '🔢',
    lastSession:  'Today, 09:00',
    avgScore:     72,
    trend:        'up',
    alerts:       2,
  },
  {
    id:           'class-002',
    name:         'CM1-B',
    level:        'CM1',
    subject:      'Mathematics · Reading',
    studentCount: 22,
    color:        '#FF6B6B',
    emoji:        '📖',
    lastSession:  'Yesterday',
    avgScore:     65,
    trend:        'stable',
    alerts:       0,
  },
  {
    id:           'class-003',
    name:         'CE2-C',
    level:        'CE2',
    subject:      'Sciences · Arts',
    studentCount: 20,
    color:        '#4ECDC4',
    emoji:        '🔬',
    lastSession:  '3 days ago',
    avgScore:     58,
    trend:        'down',
    alerts:       1,
  },
]

export const levelOptions = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', 'Other']