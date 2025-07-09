require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf'); // Используем деструктурированный импорт
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN); // Теперь должно работать

// Остальной код остается прежним
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Схема пользователя
const userSchema = new mongoose.Schema({
  telegramId: { type: Number, unique: true, required: true },
  matchTokens: { type: Number, default: 0 },
  energy: { type: Number, default: 100 },
  mining: {
    speed: { level: Number, baseCost: Number, value: Number, cost: Number },
    capacity: { level: Number, baseCost: Number, value: Number, cost: Number },
    time: { level: Number, baseCost: Number, value: Number, cost: Number },
    currentEnergy: { type: Number, default: 0 },
    timeLeft: { type: Number, default: 240 }
  },
  tasks: { type: Map, of: Object },
  subscribed: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

app.use(express.json());

// Проверка подписки
app.get('/checkSubscription', async (req, res) => {
  const userId = parseInt(req.query.userId);
  if (!userId) return res.status(400).json({ subscribed: false, error: 'User ID is required' });

  try {
    const user = await User.findOne({ telegramId: userId });
    if (user && user.subscribed) {
      return res.json({ subscribed: true });
    }

    const response = await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember?chat_id=@YourChannel&user_id=${userId}`);
    const status = response.data.result.status;
    const isSubscribed = ['member', 'administrator', 'creator'].includes(status);

    if (isSubscribed) {
      if (!user) {
        await User.create({ telegramId: userId, subscribed: true });
      } else {
        user.subscribed = true;
        await user.save();
      }
    }

    res.json({ subscribed: isSubscribed });
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ subscribed: false, error: 'Server error' });
  }
});

// Обновление состояния пользователя
app.post('/updateUserState', async (req, res) => {
  const { telegramId, state } = req.body;
  if (!telegramId || !state) return res.status(400).json({ error: 'Telegram ID and state are required' });

  try {
    let user = await User.findOne({ telegramId });
    if (!user) user = await User.create({ telegramId });

    user.matchTokens = state.matchTokens || user.matchTokens;
    user.energy = state.energy || user.energy;
    user.mining = state.mining || user.mining;
    user.tasks = state.tasks || user.tasks;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update state error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Получение состояния пользователя
app.get('/getUserState', async (req, res) => {
  const userId = parseInt(req.query.userId);
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {
    const user = await User.findOne({ telegramId: userId });
    res.json({ success: true, state: user || { matchTokens: 0, energy: 100, mining: { speed: { level: 1, baseCost: 10, value: 0.5, cost: 10 }, capacity: { level: 1, baseCost: 10, value: 2, cost: 10 }, time: { level: 1, baseCost: 10, value: 4, cost: 10 }, currentEnergy: 0, timeLeft: 240 }, tasks: {}, subscribed: false } });
  } catch (error) {
    console.error('Get state error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));