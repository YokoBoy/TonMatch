module.exports = (req, res) => {
  if (req.method === 'POST') {
    const { telegramId, state } = req.body;
    // Здесь можно добавить логику сохранения состояния (например, в память или базу данных)
    console.log(`Saving state for ${telegramId}:`, state);
    res.status(200).json({ success: true, message: 'State saved' });
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
};