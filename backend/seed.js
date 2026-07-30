const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'way_to_success.db');
const db = new sqlite3.Database(dbPath);

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');

db.serialize(async () => {
  // Execute schema creation queries sequentially
  const statements = schema.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    db.run(stmt, (err) => {
      if (err) {
        console.error('Error executing query:', stmt, err);
      }
    });
  }

  console.log('Database tables created successfully.');

  // Check if admin user exists, if not create one
  const adminEmail = 'admin@waytosuccess.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  db.get('SELECT id FROM users WHERE email = ?', [adminEmail], (err, row) => {
    if (!row) {
      db.run(
        'INSERT INTO users (name, email, password, role, bio, skills, experience, education) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          'System Admin',
          adminEmail,
          hashedPassword,
          'admin',
          'Platform administrator and manager of quizzes, jobs, and candidate credentials.',
          'Database Administration, Fullstack Engineering, Mentorship',
          '5+ Years',
          'Master of Computer Applications'
        ],
        (err) => {
          if (err) console.error('Error seeding admin user:', err);
          else console.log('Admin user seeded (admin@waytosuccess.com / admin123).');
        }
      );
    }
  });

  // Check if standard test user exists, if not create one
  const userEmail = 'user@waytosuccess.com';
  const userHashedPassword = await bcrypt.hash('user123', 10);

  db.get('SELECT id FROM users WHERE email = ?', [userEmail], (err, row) => {
    if (!row) {
      db.run(
        'INSERT INTO users (name, email, password, role, bio, skills, experience, education) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          'Jane Doe',
          userEmail,
          userHashedPassword,
          'user',
          'Passionate software enthusiast looking for growth opportunities.',
          'Python, HTML, CSS, JavaScript',
          '1 Year',
          'B.Sc. Computer Science'
        ],
        (err) => {
          if (err) console.error('Error seeding test user:', err);
          else console.log('Test user seeded (user@waytosuccess.com / user123).');
        }
      );
    }
  });

  // Seed Jobs if empty
  db.get('SELECT COUNT(*) AS count FROM jobs', [], (err, row) => {
    if (row && row.count === 0) {
      const initialJobs = [
        {
          title: 'Junior Python Developer',
          company: 'PyTech Solutions',
          location: 'San Francisco, CA (Remote)',
          role_category: 'Python',
          experience_level: 'Entry Level',
          salary: '$80,000 - $95,000',
          description: 'We are looking for a Junior Python Developer to join our growing engineering team. You will work on writing clean, scalable Python backend services, integrating APIs, and collaborating with cross-functional teams to deploy code.',
          requirements: 'Strong understanding of Python 3. Familiarity with Django or Flask. Knowledge of relational databases (SQLite/Postgres). Good communication skills.'
        },
        {
          title: 'Senior Java Architect',
          company: 'FinGlobal Corp',
          location: 'New York, NY',
          role_category: 'Java',
          experience_level: 'Senior',
          salary: '$140,000 - $170,000',
          description: 'Lead the architectural design and development of our next-generation enterprise banking software using Java/Spring Boot. Responsible for high-throughput messaging, distributed services, and microservice alignment.',
          requirements: '8+ years of experience with Java and Spring Framework. Microservices architecture expertise. Experience with SQL and messaging queues (RabbitMQ/Kafka).'
        },
        {
          title: 'Frontend Web Developer',
          company: 'DesignCraft Studio',
          location: 'Austin, TX (Hybrid)',
          role_category: 'Web Development',
          experience_level: 'Mid Level',
          salary: '$90,000 - $110,000',
          description: 'Join our creative development squad to craft elegant and highly responsive web platforms using React, Tailwind CSS, and TypeScript. You should have an eye for design and outstanding frontend debugging capabilities.',
          requirements: '3+ years of experience in JavaScript and Modern React. Proficient in CSS Frameworks like Tailwind. Solid understanding of responsive web layouts and responsive UI principles.'
        },
        {
          title: 'Database & SQL Engineer',
          company: 'DataStream Inc.',
          location: 'Chicago, IL',
          role_category: 'SQL',
          experience_level: 'Mid Level',
          salary: '$95,000 - $115,000',
          description: 'Optimize queries, design robust relational schemas, and manage database performance for high-traffic operations. Work closely with software developers to write secure, clean SQL queries and stored procedures.',
          requirements: 'Proficiency in complex SQL queries, database indexing, and execution plans. Familiarity with PostgreSQL, MySQL, or SQL Server. Experience with ETL processes.'
        },
        {
          title: 'Machine Learning/AI Associate',
          company: 'NeuralNext',
          location: 'Seattle, WA (Remote)',
          role_category: 'AI Basics',
          experience_level: 'Entry Level',
          salary: '$100,000 - $125,000',
          description: 'Assist in training machine learning models, pre-processing large datasets, and integrating AI microservices into standard applications. Great growth opportunities in an advanced research setting.',
          requirements: 'Basic understanding of supervised/unsupervised machine learning models. Exposure to Python libraries: PyTorch, TensorFlow, Scikit-learn. Strong mathematical foundation.'
        }
      ];

      initialJobs.forEach(job => {
        db.run(
          'INSERT INTO jobs (title, company, location, role_category, experience_level, salary, description, requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [job.title, job.company, job.location, job.role_category, job.experience_level, job.salary, job.description, job.requirements],
          (err) => {
            if (err) console.error('Error inserting job:', err);
          }
        );
      });
      console.log('Initial jobs seeded.');
    }
  });

  // Seed Quizzes and Questions
  db.get('SELECT COUNT(*) AS count FROM quizzes', [], (err, row) => {
    if (row && row.count === 0) {
      const quizzesData = [
        {
          title: 'Python Essentials Quiz',
          category: 'Python',
          duration: 10,
          questions: [
            {
              question_text: 'Which keyword is used to define a function in Python?',
              option_a: 'func',
              option_b: 'def',
              option_c: 'function',
              option_d: 'define',
              correct_option: 'B'
            },
            {
              question_text: 'What is the correct way to output "Hello" in Python?',
              option_a: 'print("Hello")',
              option_b: 'echo "Hello"',
              option_c: 'Console.WriteLine("Hello")',
              option_d: 'printf("Hello")',
              correct_option: 'A'
            },
            {
              question_text: 'Which data type is mutable in Python?',
              option_a: 'tuple',
              option_b: 'string',
              option_c: 'list',
              option_d: 'int',
              correct_option: 'C'
            },
            {
              question_text: 'How do you insert comments in Python code?',
              option_a: '// comment',
              option_b: '/* comment */',
              option_c: '# comment',
              option_d: '<!-- comment -->',
              correct_option: 'C'
            },
            {
              question_text: 'What does the len() function do?',
              option_a: 'Retrieves the largest element',
              option_b: 'Calculates length/size of an iterable',
              option_c: 'Generates a random list',
              option_d: 'Measures memory address size',
              correct_option: 'B'
            }
          ]
        },
        {
          title: 'Java Fundamentals Quiz',
          category: 'Java',
          duration: 10,
          questions: [
            {
              question_text: 'Which of these is NOT a valid access modifier in Java?',
              option_a: 'public',
              option_b: 'private',
              option_c: 'internal',
              option_d: 'protected',
              correct_option: 'C'
            },
            {
              question_text: 'What is the default value of a local variable in Java?',
              option_a: 'null',
              option_b: '0',
              option_c: 'Not initialized / Compilation error when used',
              option_d: 'Depends on the IDE',
              correct_option: 'C'
            },
            {
              question_text: 'Which class is the superclass of all classes in Java?',
              option_a: 'String',
              option_b: 'Object',
              option_c: 'System',
              option_d: 'Class',
              correct_option: 'B'
            },
            {
              question_text: 'Which keyword is used to inherit a class in Java?',
              option_a: 'implements',
              option_b: 'extends',
              option_c: 'inherits',
              option_d: 'instanceof',
              correct_option: 'B'
            },
            {
              question_text: 'Which memory section stores newly created object instances in Java?',
              option_a: 'Stack Memory',
              option_b: 'Heap Memory',
              option_c: 'Static Memory',
              option_d: 'Register Memory',
              correct_option: 'B'
            }
          ]
        },
        {
          title: 'Web Development Basics',
          category: 'Web Development',
          duration: 10,
          questions: [
            {
              question_text: 'What does HTML stand for?',
              option_a: 'Hyper Text Markup Language',
              option_b: 'High Tech Modern Language',
              option_c: 'Hyperlink and Text Management Language',
              option_d: 'Home Tool Markup Language',
              correct_option: 'A'
            },
            {
              question_text: 'Where in an HTML document is the correct place to refer to an external style sheet?',
              option_a: 'In the <body> section',
              option_b: 'At the end of the document',
              option_c: 'In the <head> section',
              option_d: 'Directly inside the <html> tag',
              correct_option: 'C'
            },
            {
              question_text: 'Which CSS property controls the text size?',
              option_a: 'font-style',
              option_b: 'text-size',
              option_c: 'font-size',
              option_d: 'text-style',
              correct_option: 'C'
            },
            {
              question_text: 'Which HTML tag is used to define an internal style sheet?',
              option_a: '<css>',
              option_b: '<script>',
              option_c: '<style>',
              option_d: '<link>',
              correct_option: 'C'
            },
            {
              question_text: 'What is the correct way to write a JavaScript array?',
              option_a: 'var colors = "red", "green", "blue"',
              option_b: 'var colors = ["red", "green", "blue"]',
              option_c: 'var colors = (1:"red", 2:"green", 3:"blue")',
              option_d: 'var colors = {"red", "green", "blue"}',
              correct_option: 'B'
            }
          ]
        },
        {
          title: 'Aptitude Challenge',
          category: 'Aptitude',
          duration: 12,
          questions: [
            {
              question_text: 'If a car travels at 60 km/h, how much distance does it cover in 15 minutes?',
              option_a: '10 km',
              option_b: '15 km',
              option_c: '20 km',
              option_d: '25 km',
              correct_option: 'B'
            },
            {
              question_text: 'Find the average of first 5 prime numbers.',
              option_a: '5.0',
              option_b: '5.6',
              option_c: '3.6',
              option_d: '4.8',
              correct_option: 'B'
            },
            {
              question_text: 'A sum of money doubles itself at simple interest in 10 years. What is the rate of interest per annum?',
              option_a: '5%',
              option_b: '10%',
              option_c: '12%',
              option_d: '15%',
              correct_option: 'B'
            },
            {
              question_text: 'Find the next number in the sequence: 3, 6, 11, 18, 27, ?',
              option_a: '38',
              option_b: '36',
              option_c: '34',
              option_d: '40',
              correct_option: 'A'
            },
            {
              question_text: 'If 12 men can complete a project in 20 days, how many days will 15 men take to complete the same work?',
              option_a: '14 days',
              option_b: '16 days',
              option_c: '18 days',
              option_d: '15 days',
              correct_option: 'B'
            }
          ]
        },
        {
          title: 'Structured Query Language (SQL)',
          category: 'SQL',
          duration: 10,
          questions: [
            {
              question_text: 'Which SQL statement is used to extract data from a database?',
              option_a: 'EXTRACT',
              option_b: 'OPEN',
              option_c: 'SELECT',
              option_d: 'GET',
              correct_option: 'C'
            },
            {
              question_text: 'Which SQL keyword is used to sort the result-set?',
              option_a: 'SORT BY',
              option_b: 'ORDER BY',
              option_c: 'GROUP BY',
              option_d: 'ALIGN BY',
              correct_option: 'B'
            },
            {
              question_text: 'How do you select all columns from a table named "Customers"?',
              option_a: 'SELECT * FROM Customers',
              option_b: 'SELECT [all] FROM Customers',
              option_c: 'SELECT Customers',
              option_d: 'SELECT columns FROM Customers',
              correct_option: 'A'
            },
            {
              question_text: 'Which SQL constraint unique identifies each record in a database table?',
              option_a: 'FOREIGN KEY',
              option_b: 'UNIQUE KEY',
              option_c: 'PRIMARY KEY',
              option_d: 'CHECK',
              correct_option: 'C'
            },
            {
              question_text: 'What is the default sorting order of ORDER BY?',
              option_a: 'Descending',
              option_b: 'Ascending',
              option_c: 'Random',
              option_d: 'None',
              correct_option: 'B'
            }
          ]
        },
        {
          title: 'AI Basics & Concepts',
          category: 'AI Basics',
          duration: 10,
          questions: [
            {
              question_text: 'Which of the following is considered the founding father of AI?',
              option_a: 'Alan Turing',
              option_b: 'John McCarthy',
              option_c: 'Ada Lovelace',
              option_d: 'Geoffrey Hinton',
              correct_option: 'B'
            },
            {
              question_text: 'What does "NLP" stand for in the context of Artificial Intelligence?',
              option_a: 'Neural Logic Processing',
              option_b: 'Natural Language Processing',
              option_c: 'Network Link Protocol',
              option_d: 'Node Learning Procedure',
              correct_option: 'B'
            },
            {
              question_text: 'What type of machine learning involves rewards and punishments?',
              option_a: 'Supervised Learning',
              option_b: 'Unsupervised Learning',
              option_c: 'Reinforcement Learning',
              option_d: 'Semi-supervised Learning',
              correct_option: 'C'
            },
            {
              question_text: 'Which of these is a popular unsupervised learning algorithm?',
              option_a: 'Linear Regression',
              option_b: 'K-Means Clustering',
              option_c: 'Random Forest',
              option_d: 'Support Vector Machine',
              correct_option: 'B'
            },
            {
              question_text: 'What is a perceptron in the context of Artificial Neural Networks?',
              option_a: 'An optical scanner',
              option_b: 'A single-layer artificial neuron',
              option_c: 'A deep reinforcement environment',
              option_d: 'An optimization optimizer',
              correct_option: 'B'
            }
          ]
        }
      ];

      quizzesData.forEach(quiz => {
        db.run(
          'INSERT INTO quizzes (title, category, duration) VALUES (?, ?, ?)',
          [quiz.title, quiz.category, quiz.duration],
          function (err) {
            if (err) {
              console.error('Error seeding quiz:', quiz.title, err);
              return;
            }
            const quizId = this.lastID;
            quiz.questions.forEach(q => {
              db.run(
                'INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [quizId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option],
                (err) => {
                  if (err) console.error('Error seeding question for quiz:', quizId, err);
                }
              );
            });
          }
        );
      });
      console.log('Quizzes and questions successfully seeded.');
    }
  });
});

// Close connection after slight delay to ensure transactions finalize
setTimeout(() => {
  db.close(() => {
    console.log('Database configuration and seeding complete.');
  });
}, 2000);
