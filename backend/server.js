const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'way_to_success_super_secret_key_123';

// Database connection
const dbPath = path.join(__dirname, 'way_to_success.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite Database.');
  }
});

app.use(cors());
app.use(bodyParser.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Admin Middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin privileges required' });
  }
};


// --- AUTHENTICATION ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user'],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        // Generate token
        const token = jwt.sign({ id: this.lastID, email, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, name, email, role: 'user' }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        education: user.education,
        saved_jobs: user.saved_jobs
      }
    });
  });
});

// Get User Profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, name, email, role, bio, skills, experience, education, saved_jobs FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });
});

// Update User Profile
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { name, bio, skills, experience, education } = req.body;
  db.run(
    'UPDATE users SET name = ?, bio = ?, skills = ?, experience = ?, education = ? WHERE id = ?',
    [name, bio, skills, experience, education, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      db.get('SELECT id, name, email, role, bio, skills, experience, education, saved_jobs FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Profile updated successfully', user });
      });
    }
  );
});


// --- JOB PORTAL ROUTES ---

// Get all jobs (with query filters & pagination)
app.get('/api/jobs', (req, res) => {
  const { search, category, location, experience, minSalary, page = 1, limit = 6 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM jobs WHERE 1=1';
  let params = [];

  if (search) {
    query += ' AND (title LIKE ? OR company LIKE ? OR description LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  if (category) {
    query += ' AND role_category = ?';
    params.push(category);
  }

  if (location) {
    query += ' AND location LIKE ?';
    params.push(`%${location}%`);
  }

  if (experience) {
    query += ' AND experience_level = ?';
    params.push(experience);
  }

  if (minSalary) {
    // Basic filter parsing
    query += ' AND salary LIKE ?';
    params.push(`%${minSalary}%`);
  }

  // Count query for pagination
  const countQuery = query.replace('SELECT * FROM jobs', 'SELECT COUNT(*) AS count FROM jobs');
  const countParams = [...params];

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.get(countQuery, countParams, (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });
    const totalJobs = countRow ? countRow.count : 0;
    const totalPages = Math.ceil(totalJobs / limit);

    db.all(query, params, (err, jobs) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        jobs,
        pagination: {
          totalJobs,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    });
  });
});

// Get a single job by ID
app.get('/api/jobs/:id', (req, res) => {
  db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id], (err, job) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  });
});

// Admin Add Job
app.post('/api/jobs', authenticateToken, requireAdmin, (req, res) => {
  const { title, company, location, role_category, experience_level, salary, description, requirements } = req.body;
  if (!title || !company || !location || !role_category || !experience_level || !salary || !description || !requirements) {
    return res.status(400).json({ error: 'Please provide all job details' });
  }

  db.run(
    'INSERT INTO jobs (title, company, location, role_category, experience_level, salary, description, requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title, company, location, role_category, experience_level, salary, description, requirements],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.status(201).json({ message: 'Job added successfully', jobId: this.lastID });
    }
  );
});

// Admin Edit Job
app.put('/api/jobs/:id', authenticateToken, requireAdmin, (req, res) => {
  const { title, company, location, role_category, experience_level, salary, description, requirements } = req.body;
  db.run(
    'UPDATE jobs SET title = ?, company = ?, location = ?, role_category = ?, experience_level = ?, salary = ?, description = ?, requirements = ? WHERE id = ?',
    [title, company, location, role_category, experience_level, salary, description, requirements, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Job updated successfully' });
    }
  );
});

// Admin Delete Job
app.delete('/api/jobs/:id', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM jobs WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Job deleted successfully' });
  });
});


// --- SAVED JOBS & APPLICATION ROUTES ---

// Toggle Save Job
app.post('/api/jobs/save/:id', authenticateToken, (req, res) => {
  const jobId = req.params.id;
  db.get('SELECT saved_jobs FROM users WHERE id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    let saved = row && row.saved_jobs ? row.saved_jobs.split(',').filter(Boolean) : [];

    const index = saved.indexOf(jobId);
    if (index > -1) {
      saved.splice(index, 1); // remove
    } else {
      saved.push(jobId); // add
    }

    const savedStr = saved.join(',');
    db.run('UPDATE users SET saved_jobs = ? WHERE id = ?', [savedStr, req.user.id], (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Saved jobs updated', saved_jobs: savedStr });
    });
  });
});

// Apply to Job
app.post('/api/jobs/apply/:id', authenticateToken, (req, res) => {
  const jobId = req.params.id;
  db.get('SELECT * FROM jobs WHERE id = ?', [jobId], (err, job) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Check if already applied
    db.get('SELECT id FROM applications WHERE user_id = ? AND job_id = ?', [req.user.id, jobId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (row) return res.status(400).json({ error: 'You have already applied to this job.' });

      db.run(
        'INSERT INTO applications (user_id, job_id, job_title, company) VALUES (?, ?, ?, ?)',
        [req.user.id, jobId, job.title, job.company],
        function (err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.json({ message: 'Applied to job successfully', applicationId: this.lastID });
        }
      );
    });
  });
});

// Get User's Applications
app.get('/api/applications/my', authenticateToken, (req, res) => {
  db.all('SELECT * FROM applications WHERE user_id = ? ORDER BY applied_at DESC', [req.user.id], (err, apps) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ applications: apps });
  });
});


// --- QUIZ & CERTIFICATE ROUTES ---

// Get Quiz list
app.get('/api/quizzes', (req, res) => {
  db.all('SELECT * FROM quizzes', [], (err, quizzes) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ quizzes });
  });
});

// Get Quiz details along with questions
app.get('/api/quizzes/:id', (req, res) => {
  db.get('SELECT * FROM quizzes WHERE id = ?', [req.params.id], (err, quiz) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    db.all('SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE quiz_id = ?', [quiz.id], (err, questions) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ quiz, questions });
    });
  });
});

// Submit Quiz Responses and Generate Score & Certificate if applicable
app.post('/api/quizzes/:id/submit', authenticateToken, (req, res) => {
  const quizId = req.params.id;
  const { answers } = req.body; // Map of { questionId: "A"/"B"/"C"/"D" }

  db.get('SELECT * FROM quizzes WHERE id = ?', [quizId], (err, quiz) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    db.all('SELECT id, correct_option FROM questions WHERE quiz_id = ?', [quizId], (err, questions) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      let correctCount = 0;
      const totalQuestions = questions.length;

      questions.forEach(q => {
        const userAns = answers[q.id];
        if (userAns && userAns.toUpperCase() === q.correct_option.toUpperCase()) {
          correctCount++;
        }
      });

      const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
      const passed = percentage >= 70 ? 1 : 0;

      // Get user's details for logging / certificate
      db.get('SELECT name FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        // Insert into Quiz History
        db.run(
          'INSERT INTO quiz_history (user_id, quiz_id, quiz_title, category, score, total_questions, percentage, passed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [req.user.id, quiz.id, quiz.title, quiz.category, correctCount, totalQuestions, percentage, passed],
          function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });

            let certificate = null;

            if (passed) {
              // Generate Certificate Unique ID
              const certId = `W2S-${Math.floor(100000 + Math.random() * 900000)}`;
              db.run(
                'INSERT INTO certificates (certificate_id, user_id, user_name, quiz_id, course_name, score) VALUES (?, ?, ?, ?, ?, ?)',
                [certId, req.user.id, user.name, quiz.id, quiz.title, percentage],
                function (err) {
                  if (err) {
                    console.error('Error creating certificate:', err);
                  }
                  certificate = {
                    certificate_id: certId,
                    user_name: user.name,
                    course_name: quiz.title,
                    score: percentage,
                    issued_at: new Date().toISOString()
                  };

                  res.json({
                    score: correctCount,
                    totalQuestions,
                    percentage,
                    passed: true,
                    certificate
                  });
                }
              );
            } else {
              res.json({
                score: correctCount,
                totalQuestions,
                percentage,
                passed: false,
                certificate: null
              });
            }
          }
        );
      });
    });
  });
});

// Get User's Certificates
app.get('/api/certificates/my', authenticateToken, (req, res) => {
  db.all('SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC', [req.user.id], (err, certs) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ certificates: certs });
  });
});

// Admin Add Quiz
app.post('/api/quizzes', authenticateToken, requireAdmin, (req, res) => {
  const { title, category, duration, questions } = req.body;
  if (!title || !category || !duration || !questions || !questions.length) {
    return res.status(400).json({ error: 'Please provide full quiz details and questions.' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.run(
      'INSERT INTO quizzes (title, category, duration) VALUES (?, ?, ?)',
      [title, category, duration],
      function (err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error' });
        }
        const quizId = this.lastID;

        let insertErr = false;
        questions.forEach(q => {
          db.run(
            'INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [quizId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option],
            (err) => {
              if (err) insertErr = true;
            }
          );
        });

        setTimeout(() => {
          if (insertErr) {
            db.run('ROLLBACK');
            res.status(500).json({ error: 'Error inserting questions.' });
          } else {
            db.run('COMMIT');
            res.status(201).json({ message: 'Quiz and questions created successfully', quizId });
          }
        }, 100);
      }
    );
  });
});

// Admin Delete Quiz
app.delete('/api/quizzes/:id', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM quizzes WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Quiz deleted successfully' });
  });
});


// --- ADMIN PANELS DATA VIEWS ---

// Get all users
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT id, name, email, role, bio, skills, experience, education, created_at FROM users', [], (err, users) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ users });
  });
});

// Get all certificates
app.get('/api/admin/certificates', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM certificates ORDER BY issued_at DESC', [], (err, certs) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ certificates: certs });
  });
});

// Get Quiz History
app.get('/api/quiz-history/my', authenticateToken, (req, res) => {
  db.all('SELECT * FROM quiz_history WHERE user_id = ? ORDER BY taken_at DESC', [req.user.id], (err, history) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ history });
  });
});


// --- CONTACT US ROUTE ---
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Please provide all details' });
  }

  db.run(
    'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
    [name, email, subject, message],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.status(201).json({ message: 'Contact message received successfully.' });
    }
  );
});


// Start server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
