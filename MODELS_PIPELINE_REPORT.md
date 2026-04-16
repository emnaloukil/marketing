# EduKids - Models Pipeline & Data Flow Techniques
**Date:** April 16, 2026  
**Focus:** Complete Data Pipeline Analysis

---

## 📊 Table of Contents
1. [Models Relationship Map](#models-relationship-map)
2. [Data Flow Pipelines](#data-flow-pipelines)
3. [Query Patterns & Techniques](#query-patterns--techniques)
4. [Transaction Flows](#transaction-flows)
5. [Real-time Data Synchronization](#real-time-data-synchronization)
6. [Performance Techniques](#performance-techniques)

---

## 📍 Models Relationship Map

### Complete Relationship Diagram (All 9+1 Models)

```
USERS LAYER
──────────────────────────────────────────────

    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │   TEACHER    │         │    PARENT    │         │   STUDENT    │
    │ (Educator)   │         │   (Guardian) │         │  (Learner)   │
    └──────┬───────┘         └──────┬───────┘         └──────┬───────┘
           │                        │                        │
           │                        └────────┬────────────┐  │
           │                                 │            │  │
           ↓                                 ↓            ↓  ↓
    
AUTHORIZATION LAYER
──────────────────────────────────────────────

    ┌──────────────────────────────────────────────────────┐
    │              ParentChild (Junction)                  │
    │  Links Parent → Student with relationship type      │
    │  (parent, guardian, tutor)                          │
    └──────────────────────────────────────────────────────┘


ACADEMIC STRUCTURE LAYER
──────────────────────────────────────────────────────────

    ┌──────────────┐         ┌──────────────┐
    │    CLASS     │◄────────┤   TEACHER    │
    │ (Cohort)     │ 1:many  │   (Instructor)
    └──────┬───────┘         └──────────────┘
           │ 1:many
           ↓
    ┌──────────────────────────────────────────┐
    │       CLASS SESSION                      │
    │   (Scheduled 50-min teaching block)      │
    │   - topic, materials, status             │
    └──────┬───────────────────────────────────┘
           │ 1:many (each session = many snapshots)
           ↓
    
SESSION TRACKING LAYER
──────────────────────────────────────────────────────────

    For each student in session:
    ┌──────────────────────────────────────────┐
    │      SESSION SNAPSHOT                    │
    │   (Engagement at point-in-time)          │
    │   - engagementScore (0-100)              │
    │   - attentionLevel (high/med/low)        │
    │   - interactionCount                     │
    └──────┬───────────────────────────────────┘
           │ Contains array of:
           ↓
    ┌──────────────────────────────────────────┐
    │      BUTTON EVENT                        │
    │   (Individual interaction)               │
    │   - raised_hand, attention, etc.         │
    │   - timestamp (precise tracking)         │
    └──────────────────────────────────────────┘


CONTENT & MATERIALS LAYER
──────────────────────────────────────────────────────────

    ┌──────────────────────────────────────────┐
    │         MATERIAL                         │
    │   (PDFs, videos, images, links)          │
    │   - attached to ClassSession             │
    └──────────────────────────────────────────┘


REPORTING LAYER
──────────────────────────────────────────────────────────

    ┌──────────────────────────────────────────┐
    │      DAILY SUMMARY                       │
    │   (Aggregated by teacher, per day)       │
    │   - averageEngagement                    │
    │   - topPerformers, needsAttention        │
    │   - AI-generated recommendations         │
    └──────────────────────────────────────────┘
```

### Model Cardinalities (Relationship Counts)

```
Teacher ──1:many──► Class
Teacher ──1:many──► ClassSession
Teacher ──1:many──► DailySummary

Parent ──1:many──► Student (via ParentChild junction)
       ──1:many──► ParentChild

Student ──N:1──► Class
        ──N:many──► ClassSession (via enrollment)
        ──1:many──► SessionSnapshot
        ──1:many──► ButtonEvent
        ──N:many──► ParentChild

Class ──1:many──► Student
      ──1:many──► ClassSession

ClassSession ──1:many──► SessionSnapshot
            ──1:many──► ButtonEvent
            ──1:many──► Material

SessionSnapshot ──N:1──► ClassSession
               ──N:1──► Student
               (contains array of ButtonEvent data)

ButtonEvent ──N:1──► Student
           ──N:1──► ClassSession
           ──N:1──► SessionSnapshot

Material ──N:1──► ClassSession
        ──N:1──► Teacher

DailySummary ──N:1──► Teacher
            (aggregates SessionSnapshot data)

ParentChild ──N:1──► Parent
           ──N:1──► Student
```

---

## 🔄 Data Flow Pipelines

### Pipeline 1: Complete Teaching Session Lifecycle

```
PHASE 1: PREPARATION (Before Session)
═══════════════════════════════════════════════════════════

    Teacher Logs In
        ↓
    Teacher Navigates: Dashboard → Create Session
        ↓
    POST /api/session/create
    {
      teacher: "tea_123",
      class: "cls_456",
      topic: "Fractions",
      scheduledTime: "2024-04-16T14:00:00Z",
      materials: ["mat_001", "mat_002"]
    }
        ↓
    Backend Creates:
    ┌─ ClassSession Document
    │  {
    │    _id: ObjectId("..."),
    │    teacher: ref(Teacher),
    │    class: ref(Class),
    │    topic: "Fractions",
    │    scheduledTime: ISODate,
    │    status: "scheduled",  ← Initial status
    │    materials: [refs to Materials],
    │    isLive: false
    │  }
    └─ Stored in DB


PHASE 2: SESSION START (Teacher Clicks "Go Live")
═══════════════════════════════════════════════════════════

    Teacher Clicks "Start Live Session"
        ↓
    PUT /api/session/cls_456/start
        ↓
    Backend Updates ClassSession:
    {
      status: "in_progress",  ← Changed from "scheduled"
      isLive: true,           ← Flag for frontend
      liveStartedAt: new Date()
    }
        ↓
    Socket.IO Creates Room:
    ┌─ Room: "session_cls_456"
    │  └─ Teacher auto-joins with role: "instructor"
    └─ Emits "session_started" to room


PHASE 3: STUDENTS JOIN SESSION
═══════════════════════════════════════════════════════════

    Student 1 (Ahmed) Joins:
        ↓
    Socket Event: "student_join"
    {
      studentId: "stu_001",
      sessionId: "cls_456"
    }
        ↓
    Backend Actions:
    ├─ Verify student enrolled in class
    ├─ Add student to room: "session_cls_456"
    ├─ Create attendance record
    └─ Emit "student_joined" (broadcast to room)
        ↓
    Frontend Updates:
    ├─ Teacher sees "Ahmed joined"
    ├─ Ahmed's name appears in participant list
    └─ Ahmed can now see live materials


PHASE 4: LIVE INTERACTION (Real-time Engagement)
═══════════════════════════════════════════════════════════

    Timeline: 14:05 - Engagement Event Occurs
    
    Event 1: Student Raises Hand
    ─────────────────────────────────
    Ahmed Presses "Raised Hand" Button
        ↓
    Client Socket Emit: "raised_hand"
    {
      studentId: "stu_001",
      sessionId: "cls_456",
      timestamp: 1713280800005
    }
        ↓
    Server Socket Handler:
    ├─ Create ButtonEvent Document
    │  {
    │    _id: ObjectId("..."),
    │    student: ref(stu_001),
    │    session: ref(cls_456),
    │    eventType: "raised_hand",
    │    timestamp: ISODate,
    │    metadata: { ... }
    │  }
    │
    ├─ Update SessionSnapshot for Ahmed
    │  {
    │    session: ref(cls_456),
    │    student: ref(stu_001),
    │    timestamp: ISODate,
    │    engagementScore: 72,  ← Recalculated
    │    interactionCount: 5,  ← Incremented
    │    attentionLevel: "high",
    │    lastActivity: "raised_hand",
    │    rawEvents: [...previous events...]
    │  }
    │
    └─ Broadcast to Room
       socket.to("session_cls_456").emit("engagement_update", {
         studentId: "stu_001",
         score: 72,
         level: "high"
       })
        ↓
    Frontend Updates:
    ├─ Teacher dashboard shows Ahmed's score: 72
    ├─ Ahmed's progress bar updates
    ├─ Audio/visual feedback (ding sound)
    └─ All other students see Ahmed participated


    Event 2: Student Marks Correct Answer
    ──────────────────────────────────────
    Zara Presses "Correct" Button
        ↓
    Same flow as above, but:
    ├─ eventType: "correct" (worth +3 points)
    ├─ SessionSnapshot updated (score now 75)
    └─ Broadcast shows Zara's improvement
        ↓
    [Repeat for all interaction types across all students]


    Engagement Score Calculation (Real-time):
    ───────────────────────────────────────────
    For Ahmed (5 minutes into session):
    
    Raw Events:
    ├─ raised_hand (14:05:00) → +5 pts, decay=1.0x
    ├─ attention (14:06:30) → +2 pts, decay=0.9x
    ├─ raised_hand (14:07:15) → +5 pts, decay=0.85x
    ├─ correct (14:08:00) → +3 pts, decay=0.8x
    └─ attention (14:08:45) → +2 pts, decay=0.75x
    
    Calculation:
    ├─ Raw Score = (5×1.0 + 2×0.9 + 5×0.85 + 3×0.8 + 2×0.75) = 19.25 pts
    ├─ Max Possible = 100 pts (example)
    ├─ Percentage = (19.25 / 100) × 100 = 19.25%
    ├─ Normalized = 72/100 (on 100-point scale)
    └─ Attention Level = "high" (score ≥ 70)


PHASE 5: SESSION END (Teacher Clicks "End Session")
═══════════════════════════════════════════════════════════

    Teacher Clicks "End Live Session"
        ↓
    PUT /api/session/cls_456/end
        ↓
    Backend Actions:
    ├─ Update ClassSession
    │  {
    │    status: "completed",  ← Changed from "in_progress"
    │    isLive: false,
    │    endedAt: new Date(),
    │    duration: (endTime - startTime)
    │  }
    │
    ├─ Finalize All SessionSnapshots
    │  For each student in session:
    │  └─ Calculate final engagementScore
    │     Lock snapshot (no more real-time updates)
    │
    ├─ Close Socket.IO Room
    │  └─ Emit "session_ended" (broadcast)
    │
    └─ Log Summary Statistics
       ├─ Total Students: 25
       ├─ Average Engagement: 68%
       ├─ Total Events: 245
       └─ Duration: 50 minutes


PHASE 6: POST-SESSION (Data Available in Teacher Dashboard)
═══════════════════════════════════════════════════════════

    Teacher Visits Dashboard
        ↓
    GET /api/session/cls_456
        ↓
    Backend Queries:
    ├─ ClassSession: topic, duration, status
    ├─ SessionSnapshots (all 25 students):
    │  └─ Final scores, attention levels, event counts
    └─ ButtonEvents: detailed interaction log
        ↓
    Frontend Displays:
    ├─ Overall Class Engagement: 68%
    ├─ Student Rankings
    │  1. Zara - 92%
    │  2. Ahmed - 87%
    │  3. ...
    └─ Interaction Heatmap
       (who raised hand, who answered correctly, etc.)


PHASE 7: DAILY SUMMARY GENERATION (Cron: 8 PM)
═══════════════════════════════════════════════════════════

    Scheduled Task Runs (Every 24h at 8 PM)
        ↓
    Query All ClassSessions for Teacher (24h window)
        ↓
    For Each Session:
    ├─ Aggregate SessionSnapshots
    ├─ Calculate Daily Statistics
    │  ├─ Total Students Engaged: 45
    │  ├─ Average Engagement: 71%
    │  ├─ Top Performers: [Zara, Ahmed, Fatima]
    │  └─ Need Attention: [Omar, Leila]
    │
    └─ Call AI Service (FastAPI)
       POST http://localhost:8000/recommend
       {
         engagementData: {...},
         studentProfiles: {...}
       }
       ↓
       Response:
       {
         recommendations: [
           "Omar needs extra support - low engagement (34%)",
           "Zara excels - consider advanced challenges",
           "Class struggled with fractions - review tomorrow"
         ]
       }
        ↓
    Create DailySummary Document
    {
      _id: ObjectId("..."),
      teacher: ref(tea_123),
      date: ISODate("2024-04-16"),
      totalStudents: 45,
      averageEngagement: 71,
      topPerformers: [ref(Zara), ref(Ahmed), ref(Fatima)],
      needsAttention: [ref(Omar), ref(Leila)],
      sessionsHeld: 3,
      recommendations: [3 AI-generated strings],
      createdAt: ISODate
    }
        ↓
    Store in DB
        ↓
    Email to Teacher (if configured)
    Subject: "Daily Summary - April 16"
    Body: "Average engagement 71%, 3 sessions held..."


PHASE 8: PARENT VISIBILITY (Next Day)
═══════════════════════════════════════════════════════════

    Parent Logs In
        ↓
    GET /api/parent/:parentId/children
        ↓
    Response: [{childId: stu_001, name: "Ahmed", ...}]
        ↓
    Parent Clicks "Ahmed's Progress"
        ↓
    GET /api/student/stu_001/summary?days=7
        ↓
    Backend Queries:
    ├─ DailySummary (last 7 days for teacher's class)
    ├─ SessionSnapshots (7-day rollup)
    └─ Calculates Trends
        ↓
    Response:
    {
      averageEngagement: 72,
      trend: "up 5% from last week",
      attendance: "95%",
      topArea: "Math - Fractions",
      needsSupport: "Reading Comprehension",
      recommendations: ["Practice fractions at home", ...]
    }
        ↓
    Parent Sees Dashboard:
    ├─ Ahmed's 7-day average: 72%
    ├─ Trend graph (upward)
    ├─ AI recommendations
    └─ Option to schedule tutor
```

---

### Pipeline 2: Authentication & Authorization Flow

```
TEACHER LOGIN
═════════════════════════════════════════════

1. User Submits Form
   POST /api/auth/login
   {
     email: "ahmed.teacher@edukids.com",
     password: "SecurePass123"
   }

2. Controller: authController.login()
   ├─ Validate input (non-empty email/password)
   ├─ Query DB: Teacher.findOne({ email })
   │  └─ Uses index on email field (O(log n))
   └─ If not found → Error 404

3. Password Verification
   ├─ Compare input hash vs stored hash
   │  bcryptjs.compare(plaintext, hash)
   ├─ If mismatch → Error 401 "Invalid password"
   └─ If match → Proceed

4. Create Response
   ├─ Extract user data: name, email, role
   ├─ Generate session/token (if JWT enabled)
   └─ Return: { userId, email, role }

5. Frontend Stores Session
   ├─ Context API: AuthContext.setUser()
   ├─ Local Storage: Save userId
   └─ All subsequent requests include userId


STUDENT LOGIN (QuickCode Entry)
═════════════════════════════════════════════

1. Student Enters QuickCode
   POST /api/studentAuth/login
   {
     studentCode: "STU-ABCD",  ← Unique identifier
     pin: "1234"               ← 4-digit PIN
   }

2. Controller: studentAuthController.login()
   ├─ Validate: studentCode exists
   │  Student.findOne({ studentCode })
   │  └─ Index lookup: O(1)
   └─ If not found → Error 404

3. PIN Verification
   ├─ Compare hashed PIN vs input
   │  bcryptjs.compare(pin, hashedPin)
   ├─ If mismatch → Error 401
   └─ If match → Proceed

4. Return Student Data
   {
     studentId: "stu_001",
     name: "Ahmed",
     class: "Grade 3A",
     classId: "cls_456"
   }

5. Frontend Joins Socket.IO Room
   socket.emit("student_join", {
     studentId: "stu_001",
     sessionId: "cls_456"
   })


ACCESS CONTROL CHECKS
═════════════════════════════════════════════

Teacher Accessing Their Class:
├─ GET /api/teacher/tea_123/classes
├─ Controller checks: requestUser.id === tea_123
├─ If mismatch → Error 403 "Forbidden"
└─ Return only this teacher's classes

Parent Accessing Child's Data:
├─ GET /api/student/stu_001/summary
├─ Controller queries ParentChild junction
│  ParentChild.findOne({
│    parent: requestUser.id,
│    child: stu_001
│  })
├─ If not found → Error 403
└─ Return only verified child's data

Student Accessing Own Profile:
├─ GET /api/student/stu_001/profile
├─ Verify: requestUser.id === stu_001
├─ Allow only self-access (or parent access)
└─ Prevent access to other students' profiles
```

---

### Pipeline 3: Real-time Engagement Tracking

```
MULTI-STUDENT CONCURRENT INTERACTION
═════════════════════════════════════════════════════════════

Timeline: Session in progress, all students clicking buttons

14:05:00 → Ahmed clicks "Raised Hand"
14:05:03 → Zara clicks "Correct"
14:05:05 → Omar clicks "Confused"
14:05:07 → Fatima clicks "Raised Hand"
14:05:10 → Ahmed clicks "Correct"

BACKEND CONCURRENT HANDLING:

Each event triggers parallel operations:

Event 1: Ahmed "Raised Hand"
┌─ Parse socket event
├─ Validate: student in session
├─ Create ButtonEvent in DB (async)
├─ Query current SessionSnapshot (async)
├─ Recalculate engagement (in-memory)
├─ Update SessionSnapshot (async)
└─ Broadcast to room (sync)
   └─ socket.to("session_cls_456").emit(...)

Event 2: Zara "Correct" [starts immediately, doesn't wait for Event 1]
┌─ Parse socket event
├─ Validate: student in session
├─ Create ButtonEvent in DB (async)  ← Parallel with Event 1 DB write
├─ Query current SessionSnapshot (async)  ← Parallel queries
├─ Recalculate engagement (in-memory)
├─ Update SessionSnapshot (async)  ← Parallel writes
└─ Broadcast to room (sync)

[Events 3, 4, 5 follow same pattern - all executing concurrently]

Result: All 5 events processed in ~100ms total (vs 500ms if sequential)

Concurrent SessionSnapshot Update:

Before:
Ahmed's SessionSnapshot: { engagement: 65, count: 2 }
Zara's SessionSnapshot:  { engagement: 58, count: 1 }

Events execute in parallel:
├─ Ahmed's update: engagement = 72, count = 3
└─ Zara's update: engagement = 78, count = 2

MongoDB handles concurrent writes with:
├─ Optimistic locking (version field)
├─ Atomic operations (guaranteed consistency)
└─ No race conditions


BROADCAST TO TEACHER DASHBOARD:

Each event emits update:

socket.to("session_cls_456").emit("engagement_update", {
  studentId: "stu_001",
  score: 72,
  level: "high",
  eventType: "raised_hand"
})

Teacher's Browser Receives:
├─ Event 1 update (Ahmed 72%)
├─ Event 2 update (Zara 78%)
├─ Event 3 update (Omar 45%)
├─ Event 4 update (Fatima 71%)
├─ Event 5 update (Ahmed 75%)

Frontend Re-renders Dashboard:
├─ Student cards update in real-time
├─ Color indicators change (red→green)
├─ Engagement bars animate
├─ No page reload needed
└─ Smooth 60fps animation
```

---

## 🔍 Query Patterns & Techniques

### Pattern 1: Fast Lookups (O(log n) with Indexes)

```javascript
// ✅ FAST - Uses index
const student = await Student.findOne({ studentCode: "STU-ABCD" })
// Query Plan: IXSCAN (index scan) → Single document

// ✅ FAST - Uses compound index
const sessions = await ClassSession.find({
  teacher: teacherId,
  status: "in_progress"
}).sort({ scheduledTime: -1 })
// Query Plan: IXSCAN on { teacher, status } → Sorted by time

// ❌ SLOW - No index
const students = await Student.find({ age: 10 })
// Query Plan: COLLSCAN (full collection scan) → O(n)
```

### Pattern 2: Projection (Select Only Needed Fields)

```javascript
// ✅ EFFICIENT - Only select needed fields
const teacher = await Teacher
  .findById(teacherId)
  .select({ name: 1, email: 1, isActive: 1 })
  .lean()  // Read-only, returns plain JS object (20% faster)
// Memory: 150 bytes per document

// ❌ INEFFICIENT - Select all fields
const teacher = await Teacher.findById(teacherId)
// Memory: 500 bytes per document + overhead
```

### Pattern 3: Population (Join-like Operations)

```javascript
// Query: Get a class with teacher and student names

const classRoom = await Class
  .findById(classId)
  .populate('teacher', 'name email')  // Get teacher name, email
  .populate('students', 'name studentCode')  // Get student names
  .lean()

// Result:
{
  _id: "cls_456",
  name: "Grade 3A",
  teacher: {
    _id: "tea_123",
    name: "Ahmed",
    email: "ahmed@edukids.com"
  },
  students: [
    { _id: "stu_001", name: "Zara", studentCode: "STU-ABCD" },
    { _id: "stu_002", name: "Omar", studentCode: "STU-EFGH" },
    ...
  ]
}

// Equivalent in SQL (for reference):
// SELECT c.*, t.name, t.email, s.name, s.studentCode
// FROM class c
// LEFT JOIN teacher t ON c.teacher = t._id
// LEFT JOIN student s ON s.class = c._id
```

### Pattern 4: Aggregation Pipeline (Complex Analytics)

```javascript
// Query: For a teacher, get daily average engagement over last 7 days

const dailyStats = await SessionSnapshot.aggregate([
  // Stage 1: Match snapshots for specific teacher's sessions
  {
    $match: {
      session: ObjectId(sessionId),
      timestamp: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
    }
  },
  
  // Stage 2: Group by date, calculate average engagement
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
      avgEngagement: { $avg: "$engagementScore" },
      studentCount: { $sum: 1 }
    }
  },
  
  // Stage 3: Sort by date descending (latest first)
  {
    $sort: { _id: -1 }
  }
])

// Result:
[
  { _id: "2024-04-16", avgEngagement: 73, studentCount: 45 },
  { _id: "2024-04-15", avgEngagement: 71, studentCount: 42 },
  { _id: "2024-04-14", avgEngagement: 68, studentCount: 40 },
  ...
]
```

### Pattern 5: Batch Operations (Insert Many)

```javascript
// Create 100 ButtonEvents efficiently

const events = students.map(student => ({
  student: student._id,
  session: sessionId,
  eventType: "attendance_marked",
  timestamp: new Date()
}))

// ✅ FAST - Single DB call
await ButtonEvent.insertMany(events)
// Time: ~50ms for 100 documents

// ❌ SLOW - 100 DB calls
for (const event of events) {
  await ButtonEvent.create(event)
}
// Time: ~500ms for 100 documents (10x slower!)
```

### Pattern 6: Upsert (Insert or Update)

```javascript
// Update engagement score, or create if doesn't exist

await SessionSnapshot.findByIdAndUpdate(
  snapshotId,
  {
    $set: {
      engagementScore: 75,
      lastUpdated: new Date()
    }
  },
  { upsert: true, new: true }  // Create if not found, return updated doc
)
```

---

## 💳 Transaction Flows

### Multi-Document Transaction Example

```
SCENARIO: Teacher Creates Class with Students
═════════════════════════════════════════════════

Problem: Class creation + student enrollment must be atomic
If class created but student enrollment fails → Data inconsistency

Solution: MongoDB Transaction

const session = await mongoose.startSession()
session.startTransaction()

try {
  // Step 1: Create class
  const classRoom = await Class.create([{
    name: "Grade 3A",
    teacher: teacherId,
    level: "Grade 3"
  }], { session })
  
  // Step 2: Enroll students (update Student model)
  await Student.updateMany(
    { _id: { $in: studentIds } },
    { class: classRoom[0]._id },
    { session }
  )
  
  // Step 3: Update Class.students array
  await Class.findByIdAndUpdate(
    classRoom[0]._id,
    { students: studentIds },
    { session }
  )
  
  // All succeeded → Commit transaction
  await session.commitTransaction()
  
} catch (error) {
  // Something failed → Rollback ALL changes
  await session.abortTransaction()
  console.error("Transaction failed:", error)
  
} finally {
  await session.endSession()
}

// Result: Either all changes applied, or none
// No partial state possible
```

---

## 🔄 Real-time Data Synchronization

### WebSocket Room Management

```
SESSION LIFECYCLE IN ROOMS:
═════════════════════════════════════════════

1. Create Room: teacher_creates_session
   └─ Room: "session_cls_456" created

2. Teacher Joins:
   socket.join("session_cls_456")
   io.to("session_cls_456").emit("teacher_joined", {teacherId})

3. Student 1 Joins:
   socket.join("session_cls_456")
   io.to("session_cls_456").emit("student_joined", {studentId: stu_001})

4. Real-time Events:
   ├─ Ahmed emits "raised_hand"
   ├─ Server broadcasts to room (EXCEPT Ahmed):
   │  socket.to("session_cls_456").emit("interaction", {studentId})
   ├─ Teacher receives update (in real-time)
   └─ Other students see Ahmed participated

5. Student 2 Joins:
   socket.join("session_cls_456")
   io.to("session_cls_456").emit("student_joined", {studentId: stu_002})

6. Session Ends:
   io.to("session_cls_456").emit("session_ended")
   └─ All sockets leave room


BROADCAST PATTERNS:

// Send to everyone EXCEPT sender
socket.to(room).emit("event", data)

// Send to specific room only
io.to(room).emit("event", data)

// Send to specific user
io.to(userId).emit("event", data)

// Send only to sender
socket.emit("event", data)
```

---

## ⚡ Performance Techniques

### Caching Strategy

```javascript
// In-memory cache for frequently accessed data

const cache = new Map()

async function getTeacherClasses(teacherId) {
  const cacheKey = `teacher_classes_${teacherId}`
  
  // Check cache
  if (cache.has(cacheKey)) {
    console.log("Cache HIT")
    return cache.get(cacheKey)
  }
  
  // Cache miss → Query DB
  console.log("Cache MISS - querying DB")
  const classes = await Class
    .find({ teacher: teacherId })
    .lean()
  
  // Store in cache
  cache.set(cacheKey, classes)
  
  // Expire after 1 hour
  setTimeout(() => cache.delete(cacheKey), 60*60*1000)
  
  return classes
}

// Result:
// First call: Cache MISS - querying DB (150ms)
// Second call within 1 hour: Cache HIT (5ms) ← 30x faster!
```

### Pagination Pattern

```javascript
// Don't load all 10,000 events at once

async function getSessionEvents(sessionId, page = 1, limit = 20) {
  const skip = (page - 1) * limit
  
  const events = await ButtonEvent
    .find({ session: sessionId })
    .skip(skip)       // Skip first (page-1)*limit
    .limit(limit)     // Return only 'limit' documents
    .sort({ timestamp: -1 })  // Newest first
    .lean()
  
  const total = await ButtonEvent.countDocuments({ session: sessionId })
  
  return {
    events,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }
}

// Result:
// Page 1: 20 events (150ms)
// Page 2: 20 events (50ms) - skip/limit optimized
// Page 50: 20 events (50ms) - consistent performance
// vs: Load all 10,000 → 5000ms + memory overflow
```

### Index Optimization

```javascript
// Frequently used queries need indexes

// Query: Find all sessions for teacher on specific date
// WITHOUT INDEX: O(n) - scans all sessions
// WITH INDEX: O(log n) - instant

db.classsession.createIndex({
  teacher: 1,           // Ascending order
  scheduledTime: -1     // Descending (newest first)
})

// Now query executes ~1000x faster:
await ClassSession
  .find({
    teacher: teacherId,
    scheduledTime: { $gte: startOfDay, $lt: endOfDay }
  })
  .hint({ teacher: 1, scheduledTime: -1 })
  .sort({ scheduledTime: -1 })
```

---

## 📊 Summary Table: Model Data Volumes

| Model | Typical Count | Growth Rate | Query Frequency |
|-------|--------------|-------------|-----------------|
| Teacher | 50-500 | ~10/month | High (login) |
| Student | 5,000-50,000 | ~100/month | High (enrollment) |
| Parent | 2,000-20,000 | ~50/month | Medium |
| Class | 100-1,000 | ~5/month | High (filtering) |
| ClassSession | 10,000-100,000 | ~500/month | High (listings) |
| SessionSnapshot | 100,000-1M+ | ~5,000/month | Very High (real-time) |
| ButtonEvent | 500,000-5M+ | ~20,000/month | Very High (tracking) |
| DailySummary | 50-500 | ~10/month | Medium |
| Material | 1,000-10,000 | ~50/month | Medium |

**Indexes Critical For:** SessionSnapshot (timestamp, session+student), ButtonEvent (session+timestamp)

---

**Technical Report Complete - All Pipelines Documented**

This document provides comprehensive insight into:
✅ How data flows through the system  
✅ Query optimization techniques  
✅ Real-time synchronization  
✅ Concurrent handling  
✅ Performance optimization strategies  
