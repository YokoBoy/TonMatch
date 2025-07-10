module.exports = (req, res) => {
  res.status(200).json({ success: true, subscribed: true }); // Эмуляция подписки
};