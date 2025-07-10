const express = require('express');
const cors = require('cors');
const app = express();

// Настройка CORS для конкретного origin
const allowedOrigins = ['https://cryptomatch.vercel.app'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'], // Разреши нужные методы
  credentials: true // Если используешь куки или авторизацию
}));

// Пример эндпоинтов
app.get('/getUserState', (req, res) => {
  // Логика получения состояния
  res.json({ success: true, state: { playerName: 'Test' } });
});

app.get('/checkSubscription', (req, res) => {
  // Логика проверки подписки
  res.json({ success: true, subscribed: true });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});