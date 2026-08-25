const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const connectDB = require('./database/mongodb');
const User = require('./models/User');
const products = require('./database/products');

const app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'practice-lab-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.get('/', (req, res) => {
    res.render('index', { products });
});

app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.render('detail', { product });
    } else {
        res.status(404).send('Not Found');
    }
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.render('register', { error: 'This email is already registered' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashedPassword });
        res.redirect('/login');
    } catch (err) {
        res.render('register', { error: 'Something went wrong, please try again' });
    }
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password' });
        }
        req.session.user = { id: user._id, username: user.username, email: user.email };
        res.redirect('/');
    } catch (err) {
        res.render('login', { error: 'Something went wrong, please try again' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

connectDB().then(() => {
    app.listen(3000, () => {
        console.log('http://localhost:3000');
    });
});
