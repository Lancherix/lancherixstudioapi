const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const uploadDir = path.join(__dirname, 'uploads');
const wallpaperDir = path.join(__dirname, 'wallpapers');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(wallpaperDir)) {
  fs.mkdirSync(wallpaperDir);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadDir));
app.use('/wallpapers', express.static(wallpaperDir));

const users = [];
const notes = [];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
      cb(null, uploadDir);
    } else if (file.fieldname === 'wallpaper') {
      cb(null, wallpaperDir);
    } else {
      cb('Invalid field name for file upload');
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  jwt.verify(token.split(' ')[1], 'secret_key', (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

app.post('/api/register', async (req, res) => {
  const {
    username,
    password,
    fullName,
    email,
    birthMonth,
    birthDate,
    birthYear,
    gender,
    registrationDate
  } = req.body;

  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    id: uuidv4(),
    username,
    password: hashedPassword,
    fullName,
    email,
    birthMonth,
    birthDate,
    birthYear,
    gender,
    registrationDate,
    profilePicture: 'https://tse1.mm.bing.net/th?q=profile%20pic%20blank&w=250&h=250&c=7',
    wallpaper: '/Images/backgroundImage.jpeg',
    sideMenuColor: 'rgba(255, 255, 255, 1)',
    themeMode: 'glass'
  };

  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ username }, 'secret_key', { expiresIn: '10000h' });
  console.log(`User ${username} logged in successfully`);
  res.json({ token });
});

app.get('/api/music', (req, res) => {
  const music = [
    {
      id: 1,
      title: "Bohemian Rhapsody",
      author: "Queen",
      year: 1975,
      cover: "https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png"
    },
    {
      id: 2,
      title: "Imagine",
      author: "John Lennon",
      year: 1971,
      cover: "https://i.scdn.co/image/ab67616d0000b27399581550ef9746ca582bb3cc"
    },
    {
      id: 3,
      title: "Smells Like Teen Spirit",
      author: "Nirvana",
      year: 1991,
      cover: "https://cdns-images.dzcdn.net/images/cover/fb71ce45bc9d3f2cb53977cf18d43b0a/1900x1900-000000-80-0-0.jpg"
    },
    {
      id: 4,
      title: "Billie Jean",
      author: "Michael Jackson",
      year: 1982,
      cover: "https://static.stereogum.com/uploads/2020/07/Michael-Jackson-Billie-Jean-1593711568.jpg"
    },
    {
      id: 5,
      title: "Hotel California",
      author: "Eagles",
      year: 1976,
      cover: "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg"
    },
    {
      id: 6,
      title: "Like a Rolling Stone",
      author: "Bob Dylan",
      year: 1965,
      cover: "https://i.discogs.com/UUUVx58Tc8vetBCbscjKdtF2l1kq_X-E6XRraWXeyYM/rs:fit/g:sm/q:40/h:300/w:300/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTIxNDc3/OTAtMTI2NjYxMTcw/MC5qcGVn.jpeg"
    },
    {
      id: 7,
      title: "What's Going On",
      author: "Marvin Gaye",
      year: 1971,
      cover: "https://upload.wikimedia.org/wikipedia/en/8/84/MarvinGayeWhat%27sGoingOnalbumcover.jpg"
    },
    {
      id: 8,
      title: "Purple Haze",
      author: "Jimi Hendrix",
      year: 1967,
      cover: "https://upload.wikimedia.org/wikipedia/en/9/9e/Jimi_Hendrix_-_Are_You_Experienced.jpg"
    },
    {
      id: 9,
      title: "Hey Jude",
      author: "The Beatles",
      year: 1968,
      cover: "https://upload.wikimedia.org/wikipedia/en/4/42/Hey_Jude_-_UK_single_cover.jpg"
    },
    {
      id: 10,
      title: "Stairway to Heaven",
      author: "Led Zeppelin",
      year: 1971,
      cover: "https://upload.wikimedia.org/wikipedia/en/2/26/Led_Zeppelin_-_Led_Zeppelin_IV.jpg"
    }
  ];
  res.json(music);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.put('/api/users', verifyToken, upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'wallpaper', maxCount: 1 }]), async (req, res) => {
  try {
    const { email, fullName, birthMonth, birthDate, birthYear, gender, sideMenuColor, themeMode, wallpaper } = req.body;

    const userIndex = users.findIndex(u => u.username === req.user.username);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = {
      ...users[userIndex],
      email: email || users[userIndex].email,
      fullName: fullName || users[userIndex].fullName,
      birthMonth: birthMonth || users[userIndex].birthMonth,
      birthDate: birthDate || users[userIndex].birthDate,
      birthYear: birthYear || users[userIndex].birthYear,
      gender: gender || users[userIndex].gender,
      sideMenuColor: sideMenuColor || users[userIndex].sideMenuColor,
      themeMode: themeMode || users[userIndex].themeMode,
    };

    if (req.body.profilePicture === 'https://tse1.mm.bing.net/th?q=profile%20pic%20blank&w=250&h=250&c=7') {
      updatedUser.profilePicture = 'https://tse1.mm.bing.net/th?q=profile%20pic%20blank&w=250&h=250&c=7';
    } else if (req.files && req.files['profilePicture']) {
      const profilePicture = req.files['profilePicture'][0];
      updatedUser.profilePicture = `http://localhost:3000/uploads/${encodeURIComponent(profilePicture.filename)}`;
    } 
    
    if (req.files && req.files['wallpaper']) {
      const wallpaperFile = req.files['wallpaper'][0];
      updatedUser.wallpaper = `http://localhost:3000/wallpapers/${encodeURIComponent(wallpaperFile.filename)}`;
    } else if (wallpaper) {
      updatedUser.wallpaper = wallpaper;
    }

    users[userIndex] = updatedUser;

    res.json({ message: 'User data updated successfully', updatedUser });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Failed to update user data', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post('/api/notes', verifyToken, (req, res) => {
  const { content } = req.body;
  const newNote = {
    id: uuidv4(),
    userId: req.user.username,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log('New note created:', newNote);
  
  notes.push(newNote);
  res.status(201).json({ message: 'Note saved successfully', note: newNote });
});

app.get('/api/notes', verifyToken, (req, res) => {
  const userNotes = notes.filter(note => note.userId === req.user.username);
  res.json(userNotes);
});

app.delete('/api/notes/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.username;

  const noteIndex = notes.findIndex(note => note.id === id && note.userId === userId);

  if (noteIndex === -1) {
    return res.status(404).json({ message: 'Note not found or you are not authorized to delete this note' });
  }

  notes.splice(noteIndex, 1);

  res.json({ message: 'Note deleted successfully' });
});

app.put('/api/notes/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.username;

    const noteIndex = notes.findIndex(note => note.id === id && note.userId === userId);

    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found or you are not authorized to update this note' });
    }

    const originalNote = notes[noteIndex];
    
    const updatedNote = { 
      ...originalNote,
      content,
      updatedAt: new Date().toISOString()
    };

    notes[noteIndex] = updatedNote;

    res.json({ message: 'Note updated successfully', note: updatedNote });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Failed to update note', error: error.message });
  }
});